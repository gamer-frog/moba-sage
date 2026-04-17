# Skill: github-repo

## Description

Read, write, append, list, and inspect files in a GitHub repository using the GitHub REST Contents API. This skill uses only Python standard library (`urllib`, `base64`, `json`) — **zero external dependencies**.

It supports creating new files, updating existing files (with automatic SHA resolution), appending content to files, listing directory contents, and retrieving file metadata.

## Configuration

| Parameter | Default | Env Var |
|-----------|---------|---------|
| Owner | `bautiarmanicode` | `GITHUB_OWNER` |
| Repo | `personal-os` | `GITHUB_REPO` |
| Branch | `master` | `GITHUB_BRANCH` |
| Token | *(none)* | `GITHUB_TOKEN` |

The token should be a GitHub **Personal Access Token (PAT)** with `repo` scope.

## Functions

### `read_file(path, owner=None, repo=None, branch=None, token=None)`

Reads and decodes a file from the repo.

```python
from scripts.github_api import read_file

result = read_file("Personal_OS_LAB/00_System/QUEUE.md", token="ghp_xxx")
print(result["decoded_content"])
print(result["sha"])        # SHA for future updates
print(result["size"])       # Size in bytes
```

**Returns**: dict with `decoded_content`, `sha`, `name`, `path`, `size`, `encoding`, or `{"error": "..."}`.

---

### `write_file(path, content, message, owner=None, repo=None, branch=None, token=None, sha=None)`

Creates a new file or updates an existing one. If `sha` is not provided for an existing file, it is automatically fetched.

```python
from scripts.github_api import write_file

# Create new file
result = write_file("test/new_file.txt", "Hello World!", "Create new file", token="ghp_xxx")

# Update existing (SHA auto-fetched if omitted)
result = write_file("test/new_file.txt", "Updated content!", "Update file", token="ghp_xxx")
```

**Returns**: dict with `commit` info and `content` (new SHA), or `{"error": "..."}`.

---

### `append_to_file(path, content, message, owner=None, repo=None, branch=None, token=None)`

Reads the current file content, appends new content, and writes back in a single logical operation.

```python
from scripts.github_api import append_to_file

result = append_to_file(
    "Personal_OS_LAB/00_System/QUEUE.md",
    "\n- New task item added",
    "Append new task",
    token="ghp_xxx"
)
```

**Returns**: dict with `commit` info, or `{"error": "..."}`.

---

### `list_directory(path="", owner=None, repo=None, branch=None, token=None)`

Lists all files and subdirectories in a given directory path.

```python
from scripts.github_api import list_directory

# List root directory
root = list_directory("", token="ghp_xxx")
for item in root:
    print(f"[{item['type']}] {item['name']}")

# List specific subdirectory
contents = list_directory("Personal_OS_LAB/00_System/", token="ghp_xxx")
for item in contents:
    print(f"[{item['type']}] {item['name']} ({item['size']} bytes)")
```

**Returns**: list of dicts with `name`, `path`, `type`, `size`, `sha`, or `{"error": "..."}`.

---

### `get_file_info(path, owner=None, repo=None, branch=None, token=None)`

Retrieves metadata (SHA, size, URL, etc.) for a file without downloading the full content.

```python
from scripts.github_api import get_file_info

info = get_file_info("Personal_OS_LAB/00_System/QUEUE.md", token="ghp_xxx")
print(f"SHA: {info['sha']}")
print(f"Size: {info['size']} bytes")
print(f"URL: {info['html_url']}")
```

**Returns**: dict with `sha`, `name`, `path`, `size`, `type`, `encoding`, `url`, `html_url`, `download_url`, or `{"error": "..."}`.

---

## CLI Usage

The script also provides a CLI for direct testing:

```bash
# Read a file
python3 scripts/github_api.py --token "ghp_xxx" read "Personal_OS_LAB/00_System/QUEUE.md"

# Write a file
python3 scripts/github_api.py --token "ghp_xxx" write "test/file.txt" "Hello!" --message "Create file"

# Append to a file
python3 scripts/github_api.py --token "ghp_xxx" append "test/file.txt" "\nNew line" --message "Append"

# List a directory
python3 scripts/github_api.py --token "ghp_xxx" list "Personal_OS_LAB/00_System/"

# Get file metadata
python3 scripts/github_api.py --token "ghp_xxx" info "Personal_OS_LAB/00_System/QUEUE.md"
```

## Error Handling

All functions return a dict with an `error` key when something goes wrong:

```python
result = read_file("nonexistent_file.txt", token="ghp_xxx")
if "error" in result:
    print(f"Error {result.get('status')}: {result['error']}")
```

Common HTTP errors:
- **404**: File or directory not found
- **401**: Invalid or expired token
- **409**: SHA conflict (file was modified externally)
- **422**: Validation error (e.g., empty commit message)

## Notes

- The `write_file` function automatically fetches the current SHA when updating an existing file, so you don't need to manually call `get_file_info` first.
- All content is encoded/decoded as UTF-8.
- The GitHub Contents API has a **100 MB file size limit** per file.
- For binary files, the raw `content` field (base64) is available but `decoded_content` may not work correctly.
