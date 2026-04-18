---
name: github-manager
description: >
  Full GitHub repository management skill combining git CLI (clone, pull, push, branch, merge,
  log, stash, commit, tags, diff, status) with the GitHub REST API (read/write/delete files remotely,
  issues, pull requests, releases, repo info, commit history, search). Use this skill whenever the
  user mentions GitHub, git, repository, repo, clone, pull, push, commit, branch, merge, issue,
  pull request, PR, release, tag, fork, or any interaction with a GitHub repository. This includes
  connecting to a repo, reading files, pushing changes, pulling updates, managing branches, creating
  issues or PRs, and checking repo status. Even if the user just says "mi repo" or "el proyecto en
  GitHub", this skill should be triggered.
---

# GitHub Manager Skill

A comprehensive skill for managing GitHub repositories. It provides two complementary interfaces:

1. **git_operations.py** — Git CLI wrapper for local repo operations (clone, pull, push, add, commit, branch, merge, log, diff, stash, tags, config)
2. **github_api.py** — GitHub REST API client for remote operations (file CRUD, issues, PRs, releases, repo info, search)

## Configuration

The skill reads configuration from environment variables. The user must provide a GitHub Personal Access Token (PAT) with at minimum `repo` scope.

| Parameter | Env Var | Default | Description |
|-----------|---------|---------|-------------|
| Owner | `GITHUB_OWNER` | *(none)* | Repository owner (e.g. `octocat`) |
| Repo | `GITHUB_REPO` | *(none)* | Repository name (e.g. `hello-world`) |
| Branch | `GITHUB_BRANCH` | `main` | Default branch |
| Token | `GITHUB_TOKEN` | *(none)* | GitHub PAT with `repo` scope |

**Important**: If env vars are not set, the user must provide these values explicitly in each function call, or you should ask for them before proceeding.

## How to Use This Skill

When the user asks to interact with a GitHub repository, follow this workflow:

### Step 1: Gather Credentials

First, check if you have the necessary information:
- **Token**: Ask the user for their GitHub PAT if `GITHUB_TOKEN` is not set in the environment
- **Owner/Repo**: Determine from context (URL, conversation history, or ask the user)
- **Branch**: Usually `main` or `master`, confirm if unsure

Never hardcode or expose tokens in output. Always reference them as variables or env vars.

### Step 2: Choose the Right Tool

Decide whether to use **git_operations** (local) or **github_api** (remote):

| User Wants To | Use |
|---------------|-----|
| Clone a repo locally | `git_operations.clone()` |
| Pull latest changes | `git_operations.pull()` |
| Push local changes | `git_operations.push()` |
| Read a file without cloning | `github_api.read_file()` |
| Create/edit a file remotely | `github_api.write_file()` |
| Check repo status | `git_operations.status()` |
| View commit history | `git_operations.log()` or `github_api.list_commits()` |
| Manage branches | `git_operations.branch_*()` or `github_api.list_branches()` |
| Create/view issues | `github_api.create_issue()` / `list_issues()` |
| Create/view PRs | `github_api.create_pull_request()` / `list_pull_requests()` |
| Manage releases | `github_api.create_release()` / `list_releases()` |
| Search repos | `github_api.search_repos()` |

### Step 3: Execute and Report

Execute the operation using the appropriate script and report results clearly to the user. Always check for errors in the response dict (look for `"error"` key) before processing results.

## Import Pattern

To use the scripts, add the skill's `scripts/` directory to the Python path:

```python
import sys
sys.path.insert(0, "/home/z/my-project/skills/github-manager")
```

Then import what you need:

```python
# For local git operations
from scripts.git_operations import clone, pull, push, status, log, add, commit, ...

# For GitHub API operations
from scripts.github_api import read_file, write_file, list_issues, create_pull_request, ...
```

---

## Git Operations Reference

### Repository Setup

#### Clone a Repository

```python
from scripts.git_operations import clone

# Using owner/repo shorthand
result = clone("owner/repo", target_dir="/path/to/clone", token="ghp_xxx")

# Using full URL
result = clone("https://github.com/owner/repo.git", target_dir="/path/to/clone", token="ghp_xxx")

# Shallow clone (faster, no history)
result = clone("owner/repo", depth=1, token="ghp_xxx")
```

Returns: `{"success": True, "path": "/absolute/path", "output": "..."}` or `{"error": "..."}`

#### Initialize a New Repo

```python
from scripts.git_operations import init

result = init("/path/to/new/repo", initial_branch="main")
```

### Remote Management

```python
from scripts.git_operations import remote_add, remote_list, remote_set_url

# Add a remote (token auto-injected into HTTPS URL)
remote_add("/path/to/repo", "origin", "https://github.com/owner/repo.git", token="ghp_xxx")

# List remotes
remote_list("/path/to/repo")

# Change remote URL
remote_set_url("/path/to/repo", "origin", "https://github.com/new/repo.git", token="ghp_xxx")
```

### Pull & Push

```python
from scripts.git_operations import pull, push

# Pull latest changes
result = pull("/path/to/repo", token="ghp_xxx")
result = pull("/path/to/repo", remote="origin", branch="main", rebase=True, token="ghp_xxx")

# Push changes
result = push("/path/to/repo", token="ghp_xxx")
result = push("/path/to/repo", branch="feature-xyz", set_upstream=True, token="ghp_xxx")
result = push("/path/to/repo", force=True, tags=True, token="ghp_xxx")  # Force push with tags
```

### Branch Management

```python
from scripts.git_operations import branch_list, branch_create, branch_delete, checkout, merge

# List branches (local only, or include remote with remote=True)
branch_list("/path/to/repo")
branch_list("/path/to/repo", remote=True)

# Create and checkout a new branch
branch_create("/path/to/repo", "feature/new-thing")

# Create without checking out
branch_create("/path/to/repo", "feature/new-thing", checkout=False)

# Delete a branch
branch_delete("/path/to/repo", "old-branch")
branch_delete("/path/to/repo", "old-branch", force=True)  # Force delete

# Checkout
checkout("/path/to/repo", "develop")
checkout("/path/to/repo", "abc1234")  # By commit hash

# Merge
merge("/path/to/repo", "feature/new-thing")  # Merge into current branch
```

### Staging & Committing

```python
from scripts.git_operations import status, add, commit, add_and_commit

# Check status
status("/path/to/repo")

# Stage specific files or all
add("/path/to/repo", "src/main.py")
add("/path/to/repo", ["src/main.py", "README.md"])
add("/path/to/repo", ".")  # Stage everything

# Commit
commit("/path/to/repo", "feat: add new feature")
commit("/path/to/repo", "chore: initial commit", allow_empty=True)

# Stage + commit in one step
add_and_commit("/path/to/repo", "feat: add login page", paths="src/login.py")
```

### History & Diff

```python
from scripts.git_operations import log, diff

# View commit history
log("/path/to/repo", n=20)
log("/path/to/repo", author="john")
log("/path/to/repo", since="2 weeks ago")

# View changes
diff("/path/to/repo")
diff("/path/to/repo", staged=True)   # Show staged changes
diff("/path/to/repo", path="src/")   # Only for specific path
```

### Stash

```python
from scripts.git_operations import stash_push, stash_pop, stash_list, stash_drop

stash_push("/path/to/repo", message="WIP: feature X")
stash_pop("/path/to/repo")        # Pop latest
stash_list("/path/to/repo")       # List all stashes
stash_drop("/path/to/repo", "stash@{0}")  # Drop specific stash
```

### Tags

```python
from scripts.git_operations import tag_list, tag_create

tag_list("/path/to/repo")
tag_create("/path/to/repo", "v1.0.0", message="Release v1.0.0")  # Annotated
tag_create("/path/to/repo", "v1.0.0")  # Lightweight
```

### Utility

```python
from scripts.git_operations import get_current_branch, get_repo_root, is_git_repo, config_set

get_current_branch("/path/to/repo")
get_repo_root("/path/to/repo")
is_git_repo("/path/to/repo")

# Set git config
config_set("/path/to/repo", "user.name", "Your Name")
config_set("/path/to/repo", "user.email", "you@example.com")
```

---

## GitHub API Reference

### File Operations (Contents API)

```python
from scripts.github_api import read_file, write_file, delete_file, append_to_file
from scripts.github_api import list_directory, get_file_info

# Read a file remotely (no cloning needed)
result = read_file("path/to/file.md", owner="user", repo="myrepo", token="ghp_xxx")
print(result["decoded_content"])

# Write/create a file
result = write_file("path/to/file.md", "Hello!", "feat: create file",
                    owner="user", repo="myrepo", token="ghp_xxx")

# Append content
result = append_to_file("log.md", "\n- New entry", "chore: append",
                        owner="user", repo="myrepo", token="ghp_xxx")

# Delete a file
result = delete_file("old_file.md", "chore: remove old file",
                     owner="user", repo="myrepo", token="ghp_xxx")

# List directory contents
result = list_directory("src/", owner="user", repo="myrepo", token="ghp_xxx")

# Get file metadata without downloading
result = get_file_info("README.md", owner="user", repo="myrepo", token="ghp_xxx")
```

### Repository Info

```python
from scripts.github_api import get_repo, list_branches, list_commits

# Get repo metadata (stars, forks, description, etc.)
result = get_repo(owner="user", repo="myrepo", token="ghp_xxx")

# List all branches
result = list_branches(owner="user", repo="myrepo", token="ghp_xxx")

# Get commit history via API
result = list_commits(owner="user", repo="myrepo", token="ghp_xxx", per_page=15)
result = list_commits(owner="user", repo="myrepo", token="ghp_xxx", path="src/")  # For specific path
```

### Issues

```python
from scripts.github_api import list_issues, create_issue, get_issue, update_issue

# List issues (open, closed, or all)
result = list_issues(owner="user", repo="myrepo", token="ghp_xxx", state="open")

# Create a new issue
result = create_issue("Bug in login flow", "Steps to reproduce...\n1. Go to...\n2. Click...",
                      owner="user", repo="myrepo", token="ghp_xxx",
                      labels=["bug", "high-priority"], assignees=["username"])

# Get a specific issue
result = get_issue(42, owner="user", repo="myrepo", token="ghp_xxx")

# Update an issue (close, change labels, etc.)
result = update_issue(42, state="closed", owner="user", repo="myrepo", token="ghp_xxx")
```

### Pull Requests

```python
from scripts.github_api import list_pull_requests, create_pull_request, get_pull_request, list_pr_files

# List PRs
result = list_pull_requests(owner="user", repo="myrepo", token="ghp_xxx", state="open")

# Create a PR
result = create_pull_request(
    "Add user authentication",
    head="feature/auth",          # Source branch
    base="main",                   # Target branch
    body="Implements JWT auth with refresh tokens.",
    owner="user", repo="myrepo", token="ghp_xxx",
    draft=True                    # Create as draft
)

# Get PR details
result = get_pull_request(15, owner="user", repo="myrepo", token="ghp_xxx")

# List files changed in a PR
result = list_pr_files(15, owner="user", repo="myrepo", token="ghp_xxx")
```

### Releases

```python
from scripts.github_api import list_releases, create_release

# List releases
result = list_releases(owner="user", repo="myrepo", token="ghp_xxx")

# Create a release
result = create_release(
    "v2.0.0",
    name="Version 2.0.0",
    body="Major release with new features...",
    owner="user", repo="myrepo", token="ghp_xxx",
    prerelease=False
)
```

### Search

```python
from scripts.github_api import search_repos

result = search_repos("python web framework", token="ghp_xxx", sort="stars")
for repo in result["results"]:
    print(f"{repo['full_name']} - {repo['stars']} stars - {repo['description']}")
```

---

## Common Workflows

### Workflow 1: Clone, Edit, Commit, Push

This is the most common pattern. The user wants to clone a repo, make changes, and push them back.

```python
import sys
sys.path.insert(0, "/home/z/my-project/skills/github-manager")
from scripts.git_operations import clone, add, commit, push, status, log

TOKEN = "ghp_xxx"
REPO = "owner/repo"
DIR = "/home/z/my-project/repo-clone"

# 1. Clone
result = clone(REPO, target_dir=DIR, token=TOKEN)
if "error" in result:
    print(f"Clone failed: {result['error']}")
else:
    print(f"Cloned to {result['path']}")

# 2. Make changes to files (using Edit tool or Bash)

# 3. Stage and commit
add(DIR, ".")
commit(DIR, "feat: add new feature")

# 4. Push
result = push(DIR, token=TOKEN, set_upstream=True)
```

### Workflow 2: Quick Remote File Edit (No Cloning)

When the user just needs to read or edit a file remotely, use the API directly — no cloning needed.

```python
import sys
sys.path.insert(0, "/home/z/my-project/skills/github-manager")
from scripts.github_api import read_file, write_file, append_to_file

TOKEN = "ghp_xxx"

# Read
result = read_file("README.md", owner="user", repo="myrepo", token=TOKEN)
print(result["decoded_content"])

# Edit
result = write_file("README.md", "# New Content\nUpdated!", "docs: update README",
                    owner="user", repo="myrepo", token=TOKEN)

# Append
result = append_to_file("CHANGELOG.md", "\n- v1.1: Fixed bug X", "chore: update changelog",
                        owner="user", repo="myrepo", token=TOKEN)
```

### Workflow 3: Branch & PR Workflow

```python
import sys
sys.path.insert(0, "/home/z/my-project/skills/github-manager")
from scripts.git_operations import clone, branch_create, add_and_commit, push
from scripts.github_api import create_pull_request

TOKEN = "ghp_xxx"
OWNER = "user"
REPO = "myrepo"
DIR = "/home/z/my-project/repo-clone"

# 1. Clone main branch
clone(f"{OWNER}/{REPO}", target_dir=DIR, token=TOKEN)

# 2. Create feature branch
branch_create(DIR, "feature/new-api-endpoint")

# 3. Make changes and commit
add_and_commit(DIR, "feat: add new API endpoint", paths="src/api.py")

# 4. Push the branch
push(DIR, branch="feature/new-api-endpoint", set_upstream=True, token=TOKEN)

# 5. Create a PR via API
result = create_pull_request(
    "Add new API endpoint",
    head="feature/new-api-endpoint",
    base="main",
    body="This PR adds a new REST API endpoint for user profiles.",
    owner=OWNER, repo=REPO, token=TOKEN
)
print(f"PR created: {result.get('html_url')}")
```

### Workflow 4: Sync — Pull Latest Changes

```python
import sys
sys.path.insert(0, "/home/z/my-project/skills/github-manager")
from scripts.git_operations import pull, status, log

TOKEN = "ghp_xxx"
DIR = "/home/z/my-project/repo-clone"

# Check current status
print(status(DIR))

# Pull latest
result = pull(DIR, token=TOKEN)
if "error" in result:
    print(f"Pull failed: {result['error']}")
    # Maybe try rebase
    pull(DIR, token=TOKEN, rebase=True)
else:
    print("Pulled successfully!")

# Check what changed
print(log(DIR, n=5))
```

---

## Error Handling

All functions return either a success dict or an error dict. Always check for errors:

```python
result = pull("/path/to/repo", token="ghp_xxx")

if "error" in result:
    # Handle error
    print(f"Operation failed: {result['error']}")
else:
    # Success — access result fields
    print(f"Done! {result.get('output', '')}")
```

Common HTTP errors:
- **401**: Invalid or expired token
- **404**: Repository, file, or resource not found
- **409**: SHA conflict (file was modified externally since last read)
- **422**: Validation error (e.g., empty commit message, missing required fields)

## Notes

- The GitHub Contents API has a **100 MB file size limit** per file
- All text content is handled as UTF-8
- Each `write_file` / `append_to_file` API call creates exactly one commit
- `git_operations` uses the `GIT_ASKPASS` mechanism for authentication (no permanent credential storage)
- The `clone` function injects the token into the HTTPS URL for private repos — the token is never stored on disk persistently
- Always prefer API operations for simple file reads/writes to avoid cloning overhead
- Use git operations when the user needs full repo management (branches, history, multiple file changes, etc.)
