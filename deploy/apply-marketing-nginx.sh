#!/usr/bin/env bash

set -euo pipefail

SOURCE_CONFIG="${1:?Source nginx config is required}"
CONFIG_PATH="${2:?Active nginx config path is required}"
ENABLED_PATH="${3:?Enabled nginx config path is required}"
BACKUP_DIR="${4:?Backup directory is required}"

if [[ ! -f "$SOURCE_CONFIG" ]]; then
  echo "Marketing nginx source config not found" >&2
  exit 1
fi

if [[ ! -f "$CONFIG_PATH" ]] || [[ -L "$CONFIG_PATH" ]]; then
  echo "Marketing nginx config path is not an existing regular file" >&2
  exit 1
fi

if [[ ! -L "$ENABLED_PATH" ]]; then
  echo "Marketing nginx enabled path is not an existing symlink" >&2
  exit 1
fi

if [[ "$(readlink -f "$ENABLED_PATH")" != "$(readlink -f "$CONFIG_PATH")" ]]; then
  echo "Marketing nginx enabled symlink points to an unexpected config" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
install -m 0644 "$CONFIG_PATH" "$BACKUP_DIR/marketing-nginx.conf"

rollback() {
  trap - ERR
  install -m 0644 "$BACKUP_DIR/marketing-nginx.conf" "$CONFIG_PATH"
  nginx -t
  systemctl reload nginx
}

trap rollback ERR

install -m 0644 "$SOURCE_CONFIG" "$CONFIG_PATH"
nginx -t
systemctl reload nginx

trap - ERR
