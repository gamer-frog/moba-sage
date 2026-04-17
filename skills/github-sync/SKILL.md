---
name: github-sync
description: >
  Sync files between the local filesystem and a GitHub repository using the GitHub REST Contents API.
  This skill enables reading files from the repo (GET contents), creating or editing files (PUT contents),
  and managing commits — all via api.github.com. Use this skill whenever you need to interact with a GitHub
  repo for juegos-2 or any sandbox in the BOTARDO OS ecosystem. Triggers on phrases like "sync repo",
  "leer del repo", "escribir al repo", "commit", "push", "github", "leer archivo de github",
  "crear archivo en github", "actualizar repo", "guardar en github", or any request involving reading
  or writing files to/from a remote GitHub repository.
---

# GitHub Sync

Sync files between local filesystem and a GitHub repository using the GitHub REST Contents API (`api.github.com/repos/{owner}/{repo}/contents/{path}`).

This skill uses **only Python standard library** (`urllib`, `base64`, `json`) — zero external dependencies.

## Configuration

| Parameter | Env Var | Description |
|-----------|---------|-------------|
| Owner | `GITHUB_OWNER` | Repository owner (e.g. `bautiarmanicode`) |
| Repo | `GITHUB_REPO` | Repository name |
| Branch | `GITHUB_BRANCH` | Target branch (default: `main`) |
| Token | `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope |

If environment variables are not set, pass `owner`, `repo`, `branch`, and `token` explicitly to each function call.

## Core Operations

### 1. Read a file from the repo (GET contents)

```python
import sys
sys.path.insert(0, "/home/z/my-project/skills/github-sync")
from scripts.github_sync import read_file

result = read_file("path/to/file.md", token="ghp_xxx")
if "decoded_content" in result:
    print(result["decoded_content"])
elif "error" in result:
    print(f"Error: {result['error']}")
```

Returns a dict with `decoded_content` (str), `sha`, `name`, `path`, `size`. On error, returns `{"error": "...", "status": code}`.

### 2. Create or edit a file (PUT contents)

```python
from scripts.github_sync import write_file

# Create a new file
result = write_file("path/to/new_file.md", "Hello World!", "feat: create new file", token="ghp_xxx")

# Update an existing file (SHA is auto-fetched if not provided)
result = write_file("path/to/existing.md", "Updated content", "fix: update content", token="ghp_xxx")
```

The PUT request to the Contents API automatically creates a commit with the given message. No separate commit/push step is needed.

Returns a dict with `commit` info (sha, url, message) and `content` (new SHA). On error, returns `{"error": "...", "status": code}`.

### 3. Append content to an existing file

```python
from scripts.github_sync import append_to_file

result = append_to_file("path/to/log.md", "\n- New entry", "chore: append log entry", token="ghp_xxx")
```

Reads the current file, concatenates the new content, and writes back in a single logical operation (single commit).

### 4. List directory contents

```python
from scripts.github_sync import list_directory

items = list_directory("some/folder/", token="ghp_xxx")
for item in items:
    print(f"[{item['type']}] {item['name']} ({item.get('size', 0)} bytes)")
```

Returns a list of dicts with `name`, `path`, `type` (file/dir), `size`, `sha`.

### 5. Get file metadata (without full content)

```python
from scripts.github_sync import get_file_info

info = get_file_info("path/to/file.md", token="ghp_xxx")
print(f"SHA: {info['sha']}, Size: {info['size']} bytes")
```

## How to use this skill

When the user asks you to interact with a GitHub repo (read, write, sync, commit), follow this workflow:

1. **Check for credentials**: Ensure `GITHUB_TOKEN` is available (either as env var or passed by the user). If not available, ask the user to provide it.
2. **Identify the repo**: Determine the `owner`, `repo`, and `branch` from context, env vars, or user input.
3. **Execute the operation**: Use the appropriate function (`read_file`, `write_file`, `append_to_file`, `list_directory`, or `get_file_info`).
4. **Report results**: Show the user what was read, written, or the commit details.

For batch operations (multiple files), call the functions sequentially. Each `write_file` call creates its own commit.

## CLI Usage (for direct testing)

```bash
python3 /home/z/my-project/skills/github-sync/scripts/github_sync.py \
  --token "ghp_xxx" read "path/to/file.md"

python3 /home/z/my-project/skills/github-sync/scripts/github_sync.py \
  --token "ghp_xxx" write "path/to/file.md" "content" --message "commit msg"

python3 /home/z/my-project/skills/github-sync/scripts/github_sync.py \
  --token "ghp_xxx" list "some/folder/"
```

## Error Handling

All functions return a dict with an `error` key on failure:

- **404**: File or directory not found
- **401**: Invalid or expired token
- **409**: SHA conflict (file was modified externally since last read)
- **422**: Validation error (empty commit message, etc.)

Always check for `"error" in result` before accessing data fields.

## Important Notes

- The GitHub Contents API has a **100 MB file size limit** per file.
- All text content is handled as UTF-8.
- Binary files return raw base64 `content` but `decoded_content` may not be meaningful.
- Each `write_file` / `append_to_file` call creates exactly one commit on the target branch.
- No separate `git push` is needed — the Contents API handles the commit + push atomically.
