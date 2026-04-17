#!/usr/bin/env python3
"""
GitHub Repo API Client — urllib only, no external dependencies.
Supports reading, writing, appending, listing, and inspecting files
in a GitHub repository via the REST Contents API.
"""

import base64
import json
import os
import urllib.request
import urllib.error
import urllib.parse
import ssl


# ---------------------------------------------------------------------------
# Configuration — override via env vars or pass to functions
# ---------------------------------------------------------------------------
DEFAULT_OWNER = "bautiarmanicode"
DEFAULT_REPO = "personal-os"
DEFAULT_BRANCH = "master"
DEFAULT_TOKEN = os.environ.get("GITHUB_TOKEN", "")


def _ctx(owner=None, repo=None, branch=None, token=None):
    """Return a dict with the resolved configuration."""
    return {
        "owner": owner or DEFAULT_OWNER,
        "repo": repo or DEFAULT_REPO,
        "branch": branch or DEFAULT_BRANCH,
        "token": token or DEFAULT_TOKEN,
    }


def _headers(token):
    """Build request headers with optional auth."""
    h = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "github-repo-skill/1.0",
    }
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def _request(url, headers, method="GET", data=None):
    """Low-level request helper using urllib."""
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
        return {"error": error_body, "status": e.code, "url": url}, e.code


def _api_url(owner, repo, path=""):
    """Build GitHub API URL for Contents API."""
    base = f"https://api.github.com/repos/{owner}/{repo}/contents"
    if path:
        path = path.lstrip("/")
        return f"{base}/{path}"
    return base


# ===================================================================
# Public API Functions
# ===================================================================

def read_file(path, owner=None, repo=None, branch=None, token=None):
    """
    Read and decode a file from the GitHub repo.

    Args:
        path: File path in the repo (e.g. "folder/file.md")
        owner, repo, branch, token: Override defaults

    Returns:
        dict with keys: content (str), sha, name, path, size, encoding, or error
    """
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token provided. Set GITHUB_TOKEN env var or pass token."}

    params = urllib.parse.urlencode({"ref": c["branch"]})
    url = f"{_api_url(c['owner'], c['repo'], path)}?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status != 200:
        return data

    if data.get("encoding") == "base64" and data.get("content"):
        decoded = base64.b64decode(data["content"].replace("\n", "")).decode("utf-8")
        data["decoded_content"] = decoded

    return data


def write_file(path, content, message, owner=None, repo=None, branch=None, token=None, sha=None):
    """
    Create or update a file in the GitHub repo.
    For updates, provide the current file SHA (or it will be auto-fetched).

    Args:
        path: Destination file path in the repo
        content: File content (string)
        message: Commit message
        sha: Current file SHA (required for updates, auto-fetched if None and file exists)
        owner, repo, branch, token: Override defaults

    Returns:
        dict with commit info and new file sha, or error
    """
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token provided. Set GITHUB_TOKEN env var or pass token."}

    # Auto-fetch SHA if not provided
    if sha is None:
        existing = get_file_info(path, owner=c["owner"], repo=c["repo"],
                                  branch=c["branch"], token=c["token"])
        if "error" not in existing and existing.get("sha"):
            sha = existing["sha"]

    encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")
    payload = {
        "message": message,
        "content": encoded,
        "branch": c["branch"],
    }
    if sha:
        payload["sha"] = sha

    url = _api_url(c["owner"], c["repo"], path)
    body = json.dumps(payload)
    headers = _headers(c["token"])
    headers["Content-Type"] = "application/json"

    data, status = _request(url, headers, method="PUT", data=body)
    return data


def append_to_file(path, content, message, owner=None, repo=None, branch=None, token=None):
    """
    Append content to an existing file in the GitHub repo.
    Reads the current file, concatenates the new content, and writes back.

    Args:
        path: File path in the repo
        content: Content to append (string)
        message: Commit message
        owner, repo, branch, token: Override defaults

    Returns:
        dict with commit info, or error
    """
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token provided. Set GITHUB_TOKEN env var or pass token."}

    # Read current content
    file_data = read_file(path, owner=c["owner"], repo=c["repo"],
                          branch=c["branch"], token=c["token"])

    if "error" in file_data:
        return file_data

    current_content = file_data.get("decoded_content", "")
    new_content = current_content + content

    return write_file(path, new_content, message, owner=c["owner"], repo=c["repo"],
                      branch=c["branch"], token=c["token"], sha=file_data.get("sha"))


def list_directory(path="", owner=None, repo=None, branch=None, token=None):
    """
    List contents of a directory in the GitHub repo.

    Args:
        path: Directory path (empty string for root)
        owner, repo, branch, token: Override defaults

    Returns:
        list of dicts with name, path, type (file/dir), size, sha, or error dict
    """
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token provided. Set GITHUB_TOKEN env var or pass token."}

    params = urllib.parse.urlencode({"ref": c["branch"]})
    url = f"{_api_url(c['owner'], c['repo'], path)}?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status != 200:
        return data

    # The API returns an array for directories
    if isinstance(data, list):
        return [
            {
                "name": item.get("name"),
                "path": item.get("path"),
                "type": item.get("type"),
                "size": item.get("size", 0),
                "sha": item.get("sha"),
            }
            for item in data
        ]

    return data


def get_file_info(path, owner=None, repo=None, branch=None, token=None):
    """
    Get metadata (SHA, size, etc.) for a file without downloading full content.

    Args:
        path: File path in the repo
        owner, repo, branch, token: Override defaults

    Returns:
        dict with sha, name, path, size, type, encoding, url, or error
    """
    c = _ctx(owner, repo, branch, token)
    if not c["token"]:
        return {"error": "No GitHub token provided. Set GITHUB_TOKEN env var or pass token."}

    params = urllib.parse.urlencode({"ref": c["branch"]})
    url = f"{_api_url(c['owner'], c['repo'], path)}?{params}"
    data, status = _request(url, _headers(c["token"]))

    if status != 200:
        return data

    # Return metadata only (strip content to save bandwidth)
    info = {
        "sha": data.get("sha"),
        "name": data.get("name"),
        "path": data.get("path"),
        "size": data.get("size"),
        "type": data.get("type"),
        "encoding": data.get("encoding"),
        "url": data.get("url"),
        "html_url": data.get("html_url"),
        "download_url": data.get("download_url"),
    }

    return info


# ===================================================================
# CLI interface for direct testing
# ===================================================================

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="GitHub Repo CLI")
    parser.add_argument("--token", default=DEFAULT_TOKEN, help="GitHub PAT token")
    parser.add_argument("--owner", default=DEFAULT_OWNER)
    parser.add_argument("--repo", default=DEFAULT_REPO)
    parser.add_argument("--branch", default=DEFAULT_BRANCH)

    sub = parser.add_subparsers(dest="cmd")

    # read
    p_read = sub.add_parser("read", help="Read a file")
    p_read.add_argument("path")

    # write
    p_write = sub.add_parser("write", help="Write a file")
    p_write.add_argument("path")
    p_write.add_argument("content")
    p_write.add_argument("--message", default="Update file")

    # append
    p_append = sub.add_parser("append", help="Append to a file")
    p_append.add_argument("path")
    p_append.add_argument("content")
    p_append.add_argument("--message", default="Append to file")

    # list
    p_list = sub.add_parser("list", help="List directory")
    p_list.add_argument("path", nargs="?", default="")

    # info
    p_info = sub.add_parser("info", help="Get file info")
    p_info.add_argument("path")

    args = parser.parse_args()

    if not args.token:
        print("ERROR: No token provided. Use --token or GITHUB_TOKEN env var.")
        sys.exit(1)

    kwargs = {
        "owner": args.owner,
        "repo": args.repo,
        "branch": args.branch,
        "token": args.token,
    }

    if args.cmd == "read":
        result = read_file(args.path, **kwargs)
        if "decoded_content" in result:
            print(result["decoded_content"])
        else:
            print(json.dumps(result, indent=2))
    elif args.cmd == "write":
        result = write_file(args.path, args.content, args.message, **kwargs)
        print(json.dumps(result, indent=2))
    elif args.cmd == "append":
        result = append_to_file(args.path, args.content, args.message, **kwargs)
        print(json.dumps(result, indent=2))
    elif args.cmd == "list":
        result = list_directory(args.path, **kwargs)
        print(json.dumps(result, indent=2))
    elif args.cmd == "info":
        result = get_file_info(args.path, **kwargs)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()
