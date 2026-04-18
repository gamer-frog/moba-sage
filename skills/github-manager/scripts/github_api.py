#!/usr/bin/env python3
"""
GitHub REST API Client — extended version.
Supports: file CRUD, directory listing, issues, pull requests, releases,
repository info, and more. Uses only Python standard library (urllib, json).
"""

import base64
import json
import os
import urllib.request
import urllib.error
import urllib.parse
import ssl


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DEFAULT_OWNER = os.environ.get("GITHUB_OWNER", "")
DEFAULT_REPO = os.environ.get("GITHUB_REPO", "")
DEFAULT_BRANCH = os.environ.get("GITHUB_BRANCH", "main")
DEFAULT_TOKEN = os.environ.get("GITHUB_TOKEN", "")

API_BASE = "https://api.github.com"


def _ctx(owner=None, repo=None, branch=None, token=None):
    return {
        "owner": owner or DEFAULT_OWNER,
        "repo": repo or DEFAULT_REPO,
        "branch": branch or DEFAULT_BRANCH,
        "token": token or DEFAULT_TOKEN,
    }


def _headers(token, content_type=None):
    h = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "github-manager-skill/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        h["Authorization"] = f"Bearer {token}"
    if content_type:
        h["Content-Type"] = content_type
    return h


def _request(url, headers, method="GET", data=None):
    ctx_ssl = ssl.create_default_context()
    if data is not None:
        if isinstance(data, str):
            data = data.encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx_ssl) as resp:
            body = resp.read().decode("utf-8")
            if body:
                return json.loads(body), resp.status
            return {}, resp.status
    except urllib.error.HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8")
        except Exception:
            pass
        try:
            error_json = json.loads(error_body)
            return {"error": error_json.get("message", error_body), "status": e.code}, e.code
        except Exception:
            return {"error": error_body, "status": e.code}, e.code


def _contents_url(owner, repo, path=""):
    base = f"{API_BASE}/repos/{owner}/{repo}/contents"
    if path:
        return f"{base}/{path.lstrip('/')}"
    return base


# ===================================================================
# File Operations (Contents API)
# ===================================================================

def read_file(path, owner=None, repo=None, branch=None, token=None):
    """Read and decode a file from the repo."""
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token. Set GITHUB_TOKEN env var or pass token."}

    params = urllib.parse.urlencode({"ref": c["branch"]})
    url = f"{_contents_url(c['owner'], c['repo'], path)}?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status != 200:
        return data

    if data.get("encoding") == "base64" and data.get("content"):
        data["decoded_content"] = base64.b64decode(
            data["content"].replace("\n", "")
        ).decode("utf-8")

    return data


def write_file(path, content, message, owner=None, repo=None, branch=None,
               token=None, sha=None):
    """Create or update a file. SHA is auto-fetched for updates."""
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token. Set GITHUB_TOKEN env var or pass token."}

    if sha is None:
        existing = get_file_info(path, **{k: c[k] for k in ["owner", "repo", "branch", "token"]})
        if "error" not in existing and existing.get("sha"):
            sha = existing["sha"]

    encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")
    payload = {"message": message, "content": encoded, "branch": c["branch"]}
    if sha:
        payload["sha"] = sha

    url = _contents_url(c["owner"], c["repo"], path)
    body = json.dumps(payload)
    data, status = _request(url, _headers(c["token"], "application/json"), method="PUT", data=body)
    return data


def delete_file(path, message, owner=None, repo=None, branch=None, token=None, sha=None):
    """Delete a file from the repo. SHA is required (auto-fetched if not provided)."""
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token. Set GITHUB_TOKEN env var or pass token."}

    if sha is None:
        existing = get_file_info(path, **{k: c[k] for k in ["owner", "repo", "branch", "token"]})
        if "error" in existing:
            return existing
        sha = existing.get("sha")

    payload = {"message": message, "sha": sha, "branch": c["branch"]}
    url = _contents_url(c["owner"], c["repo"], path)
    body = json.dumps(payload)
    data, status = _request(url, _headers(c["token"], "application/json"), method="DELETE", data=body)
    return data


def append_to_file(path, content, message, owner=None, repo=None, branch=None, token=None):
    """Append content to an existing file (read + write in one logical operation)."""
    c = _ctx(owner, repo, branch, token)
    file_data = read_file(path, **{k: c[k] for k in ["owner", "repo", "branch", "token"]})
    if "error" in file_data:
        return file_data

    current = file_data.get("decoded_content", "")
    return write_file(
        path, current + content, message,
        **{k: c[k] for k in ["owner", "repo", "branch", "token"]},
        sha=file_data.get("sha")
    )


def list_directory(path="", owner=None, repo=None, branch=None, token=None):
    """List contents of a directory."""
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token. Set GITHUB_TOKEN env var or pass token."}

    params = urllib.parse.urlencode({"ref": c["branch"]})
    url = f"{_contents_url(c['owner'], c['repo'], path)}?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status != 200:
        return data

    if isinstance(data, list):
        return [
            {"name": i.get("name"), "path": i.get("path"), "type": i.get("type"),
             "size": i.get("size", 0), "sha": i.get("sha")}
            for i in data
        ]
    return data


def get_file_info(path, owner=None, repo=None, branch=None, token=None):
    """Get metadata for a file without downloading full content."""
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token. Set GITHUB_TOKEN env var or pass token."}

    params = urllib.parse.urlencode({"ref": c["branch"]})
    url = f"{_contents_url(c['owner'], c['repo'], path)}?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status != 200:
        return data

    return {
        "sha": data.get("sha"), "name": data.get("name"), "path": data.get("path"),
        "size": data.get("size"), "type": data.get("type"),
        "url": data.get("url"), "html_url": data.get("html_url"),
        "download_url": data.get("download_url"),
    }


# ===================================================================
# Repository Info
# ===================================================================

def get_repo(owner=None, repo=None, token=None):
    """Get repository metadata (description, stars, forks, language, etc.)."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token. Set GITHUB_TOKEN env var or pass token."}

    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}"
    data, status = _request(url, _headers(c["token"]))

    if status == 200:
        return {
            "name": data.get("full_name"),
            "description": data.get("description"),
            "private": data.get("private"),
            "language": data.get("language"),
            "stars": data.get("stargazers_count"),
            "forks": data.get("forks_count"),
            "default_branch": data.get("default_branch"),
            "html_url": data.get("html_url"),
            "created_at": data.get("created_at"),
            "updated_at": data.get("updated_at"),
            "size_kb": data.get("size"),
            "open_issues": data.get("open_issues_count"),
        }
    return data


def list_branches(owner=None, repo=None, token=None):
    """List all branches in the repository."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/branches"
    data, status = _request(url, _headers(c["token"]))

    if status == 200 and isinstance(data, list):
        return {
            "branches": [
                {"name": b["name"], "sha": b["commit"]["sha"],
                 "protected": b.get("protected", False)}
                for b in data
            ]
        }
    return data


# ===================================================================
# Issues
# ===================================================================

def list_issues(owner=None, repo=None, token=None, state="open", per_page=30, page=1):
    """List issues (open, closed, or all)."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    params = urllib.parse.urlencode({"state": state, "per_page": per_page, "page": page})
    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/issues?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status == 200 and isinstance(data, list):
        return {
            "issues": [
                {"number": i["number"], "title": i["title"],
                 "state": i["state"], "labels": [l["name"] for l in i.get("labels", [])],
                 "user": i["user"]["login"],
                 "created_at": i["created_at"],
                 "html_url": i["html_url"],
                 "body": i.get("body", "")[:200]}  # Truncated body
                for i in data
            ]
        }
    return data


def create_issue(title, body="", owner=None, repo=None, token=None, labels=None, assignees=None):
    """Create a new issue."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    payload = {"title": title, "body": body}
    if labels:
        payload["labels"] = labels
    if assignees:
        payload["assignees"] = assignees

    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/issues"
    body_data = json.dumps(payload)
    data, status = _request(url, _headers(c["token"], "application/json"), method="POST", data=body_data)
    return data


def get_issue(number, owner=None, repo=None, token=None):
    """Get a specific issue by number."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/issues/{number}"
    data, status = _request(url, _headers(c["token"]))
    return data


def update_issue(number, owner=None, repo=None, token=None, **kwargs):
    """Update an issue (title, body, state, labels, etc.)."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/issues/{number}"
    body_data = json.dumps(kwargs)
    data, status = _request(url, _headers(c["token"], "application/json"), method="PATCH", data=body_data)
    return data


# ===================================================================
# Pull Requests
# ===================================================================

def list_pull_requests(owner=None, repo=None, token=None, state="open", per_page=30):
    """List pull requests."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    params = urllib.parse.urlencode({"state": state, "per_page": per_page})
    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/pulls?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status == 200 and isinstance(data, list):
        return {
            "pull_requests": [
                {"number": pr["number"], "title": pr["title"],
                 "state": pr["state"], "user": pr["user"]["login"],
                 "head": pr["head"]["ref"], "base": pr["base"]["ref"],
                 "draft": pr.get("draft", False),
                 "html_url": pr["html_url"],
                 "created_at": pr["created_at"]}
                for pr in data
            ]
        }
    return data


def create_pull_request(title, head, base, body="",
                        owner=None, repo=None, token=None, draft=False):
    """Create a pull request."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    payload = {"title": title, "head": head, "base": base, "body": body, "draft": draft}
    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/pulls"
    body_data = json.dumps(payload)
    data, status = _request(url, _headers(c["token"], "application/json"), method="POST", data=body_data)
    return data


def get_pull_request(number, owner=None, repo=None, token=None):
    """Get details of a specific PR."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/pulls/{number}"
    data, status = _request(url, _headers(c["token"]))
    return data


def list_pr_files(number, owner=None, repo=None, token=None):
    """List files changed in a PR."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/pulls/{number}/files"
    data, status = _request(url, _headers(c["token"]))

    if status == 200 and isinstance(data, list):
        return {
            "files": [
                {"filename": f["filename"], "status": f["status"],
                 "additions": f["additions"], "deletions": f["deletions"],
                 "patch": f.get("patch", "")[:500]}
                for f in data
            ]
        }
    return data


# ===================================================================
# Releases
# ===================================================================

def list_releases(owner=None, repo=None, token=None, per_page=10):
    """List repository releases."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    params = urllib.parse.urlencode({"per_page": per_page})
    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/releases?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status == 200 and isinstance(data, list):
        return {
            "releases": [
                {"tag_name": r["tag_name"], "name": r["name"],
                 "prerelease": r.get("prerelease", False),
                 "published_at": r.get("published_at"),
                 "html_url": r["html_url"],
                 "body": (r.get("body", "") or "")[:300]}
                for r in data
            ]
        }
    return data


def create_release(tag_name, name="", body="",
                   owner=None, repo=None, token=None, draft=False, prerelease=False):
    """Create a new release."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    payload = {
        "tag_name": tag_name, "name": name or tag_name,
        "body": body, "draft": draft, "prerelease": prerelease
    }
    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/releases"
    body_data = json.dumps(payload)
    data, status = _request(url, _headers(c["token"], "application/json"), method="POST", data=body_data)
    return data


# ===================================================================
# Commit History (API)
# ===================================================================

def list_commits(owner=None, repo=None, token=None, sha=None, path=None,
                 per_page=15, page=1):
    """List commits via API (alternative to git log)."""
    c = _ctx(owner, repo, token=token)
    if not c["token"]:
        return {"error": "No GitHub token."}

    params = {"per_page": per_page, "page": page}
    if sha:
        params["sha"] = sha
    if path:
        params["path"] = path

    qs = urllib.parse.urlencode(params)
    url = f"{API_BASE}/repos/{c['owner']}/{c['repo']}/commits?{qs}"
    data, status = _request(url, _headers(c["token"]))

    if status == 200 and isinstance(data, list):
        return {
            "commits": [
                {"sha": cm["sha"], "message": cm["commit"]["message"].split("\n")[0],
                 "author": cm["commit"]["author"]["name"],
                 "date": cm["commit"]["author"]["date"],
                 "url": cm["html_url"]}
                for cm in data
            ]
        }
    return data


# ===================================================================
# Search
# ===================================================================

def search_repos(query, token=None, sort="stars", per_page=10):
    """Search GitHub repositories."""
    if not token:
        token = DEFAULT_TOKEN
    if not token:
        return {"error": "No GitHub token."}

    params = urllib.parse.urlencode({"q": query, "sort": sort, "per_page": per_page})
    url = f"{API_BASE}/search/repositories?{params}"
    data, status = _request(url, _headers(token))

    if status == 200:
        return {
            "total_count": data.get("total_count", 0),
            "results": [
                {"full_name": r["full_name"], "description": r.get("description"),
                 "stars": r["stargazers_count"], "language": r.get("language"),
                 "html_url": r["html_url"]}
                for r in data.get("items", [])
            ]
        }
    return data


# ===================================================================
# CLI
# ===================================================================

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="GitHub API CLI (Extended)")
    parser.add_argument("--token", default=DEFAULT_TOKEN)
    parser.add_argument("--owner", default=DEFAULT_OWNER)
    parser.add_argument("--repo", default=DEFAULT_REPO)
    parser.add_argument("--branch", default=DEFAULT_BRANCH)

    sub = parser.add_subparsers(dest="cmd")

    # File operations
    p = sub.add_parser("read")
    p.add_argument("path")
    p = sub.add_parser("write")
    p.add_argument("path"); p.add_argument("content"); p.add_argument("--message", default="Update")
    p = sub.add_parser("delete")
    p.add_argument("path"); p.add_argument("--message", default="Delete file")
    p = sub.add_parser("append")
    p.add_argument("path"); p.add_argument("content"); p.add_argument("--message", default="Append")
    p = sub.add_parser("list")
    p.add_argument("path", nargs="?", default="")
    p = sub.add_parser("info")
    p.add_argument("path")

    # Repo
    sub.add_parser("repo-info")

    # Issues
    p = sub.add_parser("issues")
    p.add_argument("--state", default="open")
    p = sub.add_parser("create-issue")
    p.add_argument("title"); p.add_argument("--body", default="")

    # PRs
    p = sub.add_parser("prs")
    p.add_argument("--state", default="open")

    # Releases
    sub.add_parser("releases")

    # Commits
    sub.add_parser("commits")

    # Search
    p = sub.add_parser("search")
    p.add_argument("query")

    args = parser.parse_args()
    if not args.token:
        print("ERROR: No token. Use --token or GITHUB_TOKEN env var.")
        sys.exit(1)

    kw = {"owner": args.owner, "repo": args.repo, "branch": args.branch, "token": args.token}

    if args.cmd == "read":
        r = read_file(args.path, **kw)
        print(r.get("decoded_content", json.dumps(r, indent=2)))
    elif args.cmd == "write":
        r = write_file(args.path, args.content, args.message, **kw)
        print(json.dumps(r, indent=2))
    elif args.cmd == "delete":
        r = delete_file(args.path, args.message, **kw)
        print(json.dumps(r, indent=2))
    elif args.cmd == "append":
        r = append_to_file(args.path, args.content, args.message, **kw)
        print(json.dumps(r, indent=2))
    elif args.cmd == "list":
        r = list_directory(args.path, **kw)
        print(json.dumps(r, indent=2))
    elif args.cmd == "info":
        r = get_file_info(args.path, **kw)
        print(json.dumps(r, indent=2))
    elif args.cmd == "repo-info":
        r = get_repo(**{k: kw[k] for k in ["owner", "repo", "token"]})
        print(json.dumps(r, indent=2))
    elif args.cmd == "issues":
        r = list_issues(state=args.state, **{k: kw[k] for k in ["owner", "repo", "token"]})
        print(json.dumps(r, indent=2))
    elif args.cmd == "create-issue":
        r = create_issue(args.title, args.body, **{k: kw[k] for k in ["owner", "repo", "token"]})
        print(json.dumps(r, indent=2))
    elif args.cmd == "prs":
        r = list_pull_requests(state=args.state, **{k: kw[k] for k in ["owner", "repo", "token"]})
        print(json.dumps(r, indent=2))
    elif args.cmd == "releases":
        r = list_releases(**{k: kw[k] for k in ["owner", "repo", "token"]})
        print(json.dumps(r, indent=2))
    elif args.cmd == "commits":
        r = list_commits(**{k: kw[k] for k in ["owner", "repo", "token"]})
        print(json.dumps(r, indent=2))
    elif args.cmd == "search":
        r = search_repos(args.query, token=args.token)
        print(json.dumps(r, indent=2))
    else:
        parser.print_help()
