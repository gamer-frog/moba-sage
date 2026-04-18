#!/usr/bin/env python3
"""
Git Operations CLI Wrapper
Provides a clean Python interface for common git operations:
clone, pull, push, add, commit, branch, checkout, merge, log, status, diff, stash, remote.
"""

import os
import subprocess
import json
import shutil
import tempfile


def _run_git(*args, cwd=None, env_extra=None):
    """
    Run a git command and return (stdout, returncode).

    Args:
        *args: Git subcommand and arguments (e.g., "status", "--short")
        cwd: Working directory (repo root). If None, uses current dir.
        env_extra: Dict of extra environment variables.

    Returns:
        tuple: (stdout_str, returncode)
    """
    cmd = ["git"] + list(args)
    env = os.environ.copy()
    if env_extra:
        env.update(env_extra)
    try:
        result = subprocess.run(
            cmd, cwd=cwd, capture_output=True, text=True, env=env, timeout=120
        )
        return result.stdout.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "Error: git command timed out", 1
    except FileNotFoundError:
        return "Error: git is not installed", 1


def _run_git_json(*args, cwd=None):
    """Run a git command that outputs JSON and parse it."""
    stdout, rc = _run_git(*args, cwd=cwd)
    if rc != 0:
        return {"error": stdout, "returncode": rc}
    try:
        return json.loads(stdout)
    except json.JSONDecodeError:
        return {"raw": stdout, "returncode": rc}


# ===================================================================
# Repository Setup
# ===================================================================

def clone(repo_url, target_dir=None, branch=None, token=None, depth=None):
    """
    Clone a repository.

    Args:
        repo_url: HTTPS URL or owner/repo shorthand (e.g. "user/repo")
        target_dir: Where to clone (default: current dir + repo name)
        branch: Specific branch to checkout
        token: GitHub PAT (for private repos, injected into HTTPS URL)
        depth: Shallow clone depth (None for full clone)

    Returns:
        dict with "success", "path", "output" or "error"
    """
    # Handle owner/repo shorthand
    if "/" in repo_url and not repo_url.startswith("http") and not repo_url.startswith("git@"):
        repo_url = f"https://github.com/{repo_url}"

    # Inject token into HTTPS URL if provided
    if token and "github.com" in repo_url and "@" not in repo_url.split("//")[1]:
        repo_url = repo_url.replace("https://", f"https://{token}@")

    args = ["clone", "--recursive"]
    if branch:
        args.extend(["--branch", branch])
    if depth:
        args.extend(["--depth", str(depth)])
    args.append(repo_url)

    if target_dir:
        args.append(target_dir)

    stdout, rc = _run_git(*args)
    if rc == 0:
        clone_path = target_dir or repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        abs_path = os.path.abspath(clone_path)
        return {"success": True, "path": abs_path, "output": stdout}
    return {"error": stdout, "returncode": rc}


def init(repo_dir, initial_branch="main"):
    """
    Initialize a new git repository.

    Args:
        repo_dir: Directory to initialize
        initial_branch: Name of the initial branch

    Returns:
        dict with "success", "path" or "error"
    """
    os.makedirs(repo_dir, exist_ok=True)
    stdout, rc = _run_git("init", "-b", initial_branch, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "path": os.path.abspath(repo_dir)}
    return {"error": stdout, "returncode": rc}


# ===================================================================
# Remote Operations
# ===================================================================

def remote_add(repo_dir, name, url, token=None):
    """Add a remote. Token is injected into HTTPS URLs."""
    if token and "github.com" in url:
        url = url.replace("https://", f"https://{token}@")
    stdout, rc = _run_git("remote", "add", name, url, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "name": name, "url": url}
    return {"error": stdout, "returncode": rc}


def remote_list(repo_dir):
    """List all remotes."""
    stdout, rc = _run_git("remote", "-v", cwd=repo_dir)
    if rc == 0:
        remotes = []
        for line in stdout.split("\n"):
            if line.strip():
                parts = line.split("\t")
                name = parts[0].strip()
                url_fetch = parts[1].split(" ")[0] if len(parts) > 1 else ""
                remotes.append({"name": name, "url": url_fetch})
        return {"remotes": remotes}
    return {"error": stdout, "returncode": rc}


def remote_set_url(repo_dir, name, url, token=None):
    """Change a remote's URL."""
    if token and "github.com" in url:
        url = url.replace("https://", f"https://{token}@")
    stdout, rc = _run_git("remote", "set-url", name, url, cwd=repo_dir)
    if rc == 0:
        return {"success": True}
    return {"error": stdout, "returncode": rc}


# ===================================================================
# Fetch / Pull / Push
# ===================================================================

def fetch(repo_dir, remote="origin", branch=None, token=None):
    """
    Fetch from a remote without merging.

    Args:
        repo_dir: Path to the repo
        remote: Remote name (default: "origin")
        branch: Specific branch (None for all)
        token: PAT for auth (set as env var for credential helper)

    Returns:
        dict with "success", "output" or "error"
    """
    env_extra = {}
    if token:
        # Use GIT_ASKPASS trick for authentication
        env_extra["GIT_ASKPASS"] = _askpass_script(token)

    args = ["fetch", remote]
    if branch:
        args.append(branch)

    stdout, rc = _run_git(*args, cwd=repo_dir, env_extra=env_extra)
    if rc == 0:
        return {"success": True, "output": stdout}
    return {"error": stdout, "returncode": rc}


def pull(repo_dir, remote="origin", branch=None, token=None, rebase=False):
    """
    Pull (fetch + merge) from a remote.

    Args:
        repo_dir: Path to the repo
        remote: Remote name
        branch: Branch to pull (None for current)
        token: PAT for auth
        rebase: Use rebase instead of merge

    Returns:
        dict with "success", "output" or "error"
    """
    env_extra = {}
    if token:
        env_extra["GIT_ASKPASS"] = _askpass_script(token)

    args = ["pull"]
    if rebase:
        args.append("--rebase")
    args.append(remote)
    if branch:
        args.append(branch)

    stdout, rc = _run_git(*args, cwd=repo_dir, env_extra=env_extra)
    if rc == 0:
        return {"success": True, "output": stdout}
    return {"error": stdout, "returncode": rc}


def push(repo_dir, remote="origin", branch=None, token=None, force=False,
         set_upstream=False, tags=False):
    """
    Push to a remote.

    Args:
        repo_dir: Path to the repo
        remote: Remote name
        branch: Branch to push (None for current)
        token: PAT for auth
        force: Force push
        set_upstream: Set upstream tracking
        tags: Also push tags

    Returns:
        dict with "success", "output" or "error"
    """
    env_extra = {}
    if token:
        env_extra["GIT_ASKPASS"] = _askpass_script(token)

    args = ["push"]
    if force:
        args.append("--force")
    if set_upstream:
        args.append("--set-upstream")
    if tags:
        args.append("--tags")
    args.append(remote)
    if branch:
        args.append(branch)

    stdout, rc = _run_git(*args, cwd=repo_dir, env_extra=env_extra)
    if rc == 0:
        return {"success": True, "output": stdout}
    return {"error": stdout, "returncode": rc}


# ===================================================================
# Branch Management
# ===================================================================

def branch_list(repo_dir, remote=False):
    """List branches. Set remote=True to include remote branches."""
    args = ["branch", "-v"]
    if remote:
        args.append("-a")
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        branches = []
        current_marker = "* "
        for line in stdout.split("\n"):
            if line.strip():
                is_current = line.strip().startswith("*")
                clean = line.strip().lstrip("* ")
                parts = clean.split(None, 1)
                name = parts[0]
                info = parts[1] if len(parts) > 1 else ""
                branches.append({
                    "name": name,
                    "current": is_current,
                    "info": info
                })
        return {"branches": branches}
    return {"error": stdout, "returncode": rc}


def branch_create(repo_dir, name, checkout=True):
    """Create a new branch and optionally checkout."""
    stdout, rc = _run_git("checkout", "-b", name, cwd=repo_dir) if checkout else _run_git("branch", name, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "branch": name, "output": stdout}
    return {"error": stdout, "returncode": rc}


def branch_delete(repo_dir, name, force=False):
    """Delete a branch."""
    flag = "-D" if force else "-d"
    stdout, rc = _run_git("branch", flag, name, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "deleted": name}
    return {"error": stdout, "returncode": rc}


def checkout(repo_dir, target):
    """Checkout a branch, tag, or commit."""
    stdout, rc = _run_git("checkout", target, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "checkout": target}
    return {"error": stdout, "returncode": rc}


def merge(repo_dir, branch):
    """Merge a branch into the current branch."""
    stdout, rc = _run_git("merge", branch, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "output": stdout}
    return {"error": stdout, "returncode": rc}


# ===================================================================
# Staging & Committing
# ===================================================================

def status(repo_dir, short=True):
    """Show working tree status."""
    args = ["status"]
    if short:
        args.append("--short")
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"status": stdout}
    return {"error": stdout, "returncode": rc}


def add(repo_dir, paths="."):
    """
    Stage files. Paths can be a string (single file/dir) or list.

    Args:
        repo_dir: Repo path
        paths: File path, directory, or list of paths. "." for all.

    Returns:
        dict with "success" or "error"
    """
    if isinstance(paths, str):
        paths = [paths]
    args = ["add"] + paths
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"success": True}
    return {"error": stdout, "returncode": rc}


def commit(repo_dir, message, allow_empty=False):
    """Commit staged changes."""
    args = ["commit", "-m", message]
    if allow_empty:
        args.append("--allow-empty")
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "output": stdout}
    return {"error": stdout, "returncode": rc}


def add_and_commit(repo_dir, message, paths="."):
    """Stage and commit in one step."""
    result = add(repo_dir, paths)
    if "error" in result:
        return result
    return commit(repo_dir, message)


# ===================================================================
# History & Diff
# ===================================================================

def log(repo_dir, n=10, format_str=None, oneline=False, author=None, since=None):
    """
    Show commit history.

    Args:
        repo_dir: Repo path
        n: Number of commits
        format_str: Custom format string (git log --format)
        oneline: One line per commit
        author: Filter by author
        since: Since date (e.g. "2 weeks ago")

    Returns:
        dict with "commits" list or "error"
    """
    if format_str is None:
        # Default: structured JSON-ish output
        format_str = '%H|%h|%an|%ae|%ai|%s'

    args = ["log", f"-{n}", f"--format={format_str}"]
    if author:
        args.extend(["--author", author])
    if since:
        args.extend(["--since", since])

    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        commits = []
        for line in stdout.split("\n"):
            if line.strip():
                parts = line.split("|", 5)
                if len(parts) >= 6:
                    commits.append({
                        "hash": parts[0],
                        "short_hash": parts[1],
                        "author": parts[2],
                        "email": parts[3],
                        "date": parts[4],
                        "message": parts[5]
                    })
        return {"commits": commits}
    return {"error": stdout, "returncode": rc}


def diff(repo_dir, staged=False, cached=False, path=None):
    """
    Show diff of changes.

    Args:
        repo_dir: Repo path
        staged: Show staged changes (--staged)
        cached: Alias for staged
        path: Specific file or directory

    Returns:
        dict with "diff" string or "error"
    """
    args = ["diff"]
    if staged or cached:
        args.append("--staged")
    if path:
        args.append(path)
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"diff": stdout if stdout else "(no changes)"}
    return {"error": stdout, "returncode": rc}


# ===================================================================
# Stash
# ===================================================================

def stash_push(repo_dir, message=None):
    """Stash current changes."""
    args = ["stash", "push"]
    if message:
        args.extend(["-m", message])
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "output": stdout}
    return {"error": stdout, "returncode": rc}


def stash_pop(repo_dir, stash_ref=None):
    """Pop (apply and remove) a stash. Default: latest stash."""
    args = ["stash", "pop"]
    if stash_ref:
        args.append(stash_ref)
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "output": stdout}
    return {"error": stdout, "returncode": rc}


def stash_list(repo_dir):
    """List all stashes."""
    stdout, rc = _run_git("stash", "list", cwd=repo_dir)
    if rc == 0:
        stashes = [line for line in stdout.split("\n") if line.strip()]
        return {"stashes": stashes}
    return {"error": stdout, "returncode": rc}


def stash_drop(repo_dir, stash_ref=None):
    """Drop a stash."""
    args = ["stash", "drop"]
    if stash_ref:
        args.append(stash_ref)
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"success": True}
    return {"error": stdout, "returncode": rc}


# ===================================================================
# Tags
# ===================================================================

def tag_list(repo_dir):
    """List all tags."""
    stdout, rc = _run_git("tag", "-l", cwd=repo_dir)
    if rc == 0:
        tags = [t for t in stdout.split("\n") if t.strip()]
        return {"tags": tags}
    return {"error": stdout, "returncode": rc}


def tag_create(repo_dir, name, message=None):
    """Create a tag. If message is provided, creates annotated tag."""
    args = ["tag"]
    if message:
        args.extend(["-a", name, "-m", message])
    else:
        args.append(name)
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "tag": name}
    return {"error": stdout, "returncode": rc}


# ===================================================================
# Utility
# ===================================================================

def get_current_branch(repo_dir):
    """Get the name of the current branch."""
    stdout, rc = _run_git("branch", "--show-current", cwd=repo_dir)
    if rc == 0:
        return {"branch": stdout}
    return {"error": stdout, "returncode": rc}


def get_repo_root(repo_dir):
    """Find the root directory of the git repo."""
    stdout, rc = _run_git("rev-parse", "--show-toplevel", cwd=repo_dir)
    if rc == 0:
        return {"root": stdout}
    return {"error": stdout, "returncode": rc}


def is_git_repo(repo_dir):
    """Check if a directory is a git repository."""
    stdout, rc = _run_git("rev-parse", "--is-inside-work-tree", cwd=repo_dir)
    return {"is_git_repo": rc == 0 and stdout.strip() == "true"}


def config_get(repo_dir, key):
    """Get a git config value."""
    stdout, rc = _run_git("config", "--get", key, cwd=repo_dir)
    if rc == 0:
        return {"key": key, "value": stdout}
    return {"error": f"Config '{key}' not found", "returncode": rc}


def config_set(repo_dir, key, value, global_=False):
    """Set a git config value."""
    args = ["config"]
    if global_:
        args.append("--global")
    args.extend([key, value])
    stdout, rc = _run_git(*args, cwd=repo_dir)
    if rc == 0:
        return {"success": True, "key": key, "value": value}
    return {"error": stdout, "returncode": rc}


def _askpass_script(token):
    """
    Create a temporary askpass script for git authentication.
    Returns the path to the script.
    """
    script_path = os.path.join(tempfile.gettempdir(), "git_askpass.sh")
    with open(script_path, "w") as f:
        f.write(f"#!/bin/bash\necho '{token}'\n")
    os.chmod(script_path, 0o755)
    return script_path


# ===================================================================
# CLI
# ===================================================================

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="Git Operations CLI")
    parser.add_argument("--dir", "-d", default=".", help="Repository directory")
    sub = parser.add_subparsers(dest="cmd")

    # clone
    p = sub.add_parser("clone", help="Clone a repository")
    p.add_argument("url")
    p.add_argument("--target", help="Target directory")
    p.add_argument("--branch", "-b")
    p.add_argument("--token")

    # init
    p = sub.add_parser("init", help="Initialize a new repo")
    p.add_argument("dir")
    p.add_argument("--branch", default="main")

    # pull
    p = sub.add_parser("pull", help="Pull from remote")
    p.add_argument("--remote", default="origin")
    p.add_argument("--branch")
    p.add_argument("--token")
    p.add_argument("--rebase", action="store_true")

    # push
    p = sub.add_parser("push", help="Push to remote")
    p.add_argument("--remote", default="origin")
    p.add_argument("--branch")
    p.add_argument("--token")
    p.add_argument("--force", action="store_true")
    p.add_argument("--set-upstream", action="store_true")
    p.add_argument("--tags", action="store_true")

    # branch
    p = sub.add_parser("branch", help="List branches")
    p.add_argument("--remote", action="store_true")

    # checkout
    p = sub.add_parser("checkout", help="Checkout branch/commit")
    p.add_argument("target")

    # status
    sub.add_parser("status", help="Show status")

    # add
    p = sub.add_parser("add", help="Stage files")
    p.add_argument("paths", nargs="*", default=["."])

    # commit
    p = sub.add_parser("commit", help="Commit staged changes")
    p.add_argument("-m", "--message", required=True)

    # log
    p = sub.add_parser("log", help="Show commit history")
    p.add_argument("-n", type=int, default=10)

    # diff
    p = sub.add_parser("diff", help="Show diff")
    p.add_argument("--staged", action="store_true")
    p.add_argument("path", nargs="?")

    # stash
    sub.add_parser("stash", help="Stash changes")

    args = parser.parse_args()

    if args.cmd == "clone":
        result = clone(args.url, args.target, args.branch, args.token)
    elif args.cmd == "init":
        result = init(args.dir, args.branch)
    elif args.cmd == "pull":
        result = pull(args.dir, args.remote, args.branch, args.token, args.rebase)
    elif args.cmd == "push":
        result = push(args.dir, args.remote, args.branch, args.token, args.force, args.set_upstream, args.tags)
    elif args.cmd == "branch":
        result = branch_list(args.dir, args.remote)
    elif args.cmd == "checkout":
        result = checkout(args.dir, args.target)
    elif args.cmd == "status":
        result = status(args.dir)
    elif args.cmd == "add":
        result = add(args.dir, args.paths)
    elif args.cmd == "commit":
        result = commit(args.dir, args.message)
    elif args.cmd == "log":
        result = log(args.dir, args.n)
    elif args.cmd == "diff":
        result = diff(args.dir, staged=args.staged, path=args.path)
    elif args.cmd == "stash":
        result = stash_list(args.dir)
    else:
        parser.print_help()
        sys.exit(1)

    print(json.dumps(result, indent=2, ensure_ascii=False))
