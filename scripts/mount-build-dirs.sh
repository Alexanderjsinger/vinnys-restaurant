#!/bin/bash
# The project store is FUSE: no symlinks, no rename, and very slow deletes.
# Keep node_modules and .next on local ext4 by bind-mounting over the store paths.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
local_root="${VINNYS_BUILD_DIR:-$HOME/vinnys-build}"
mkdir -p "$local_root/node_modules" "$local_root/next" "$local_root/data" "$root/node_modules" "$root/.next" "$root/data"

mount_if_needed() {
  local source="$1"
  local target="$2"
  local fstype
  fstype="$(findmnt -n -o FSTYPE -T "$target" 2>/dev/null || true)"
  if [ "$fstype" = "ext4" ] || [ "$fstype" = "xfs" ] || [ "$fstype" = "btrfs" ]; then
    echo "$target already on $fstype"
    return 0
  fi
  sudo mount --bind "$source" "$target"
  echo "bind-mounted $source onto $target"
}

mount_if_needed "$local_root/node_modules" "$root/node_modules"
mount_if_needed "$local_root/next" "$root/.next"
mount_if_needed "$local_root/data" "$root/data"
