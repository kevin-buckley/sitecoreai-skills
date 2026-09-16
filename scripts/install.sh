#!/usr/bin/env bash
# Install or update the SitecoreAI skills into an agent's skills directory.
#
# Most people do not need this script. Prefer:
#   gh skill install kevin-buckley/sitecoreai-skills --agent <agent>   # any agent
#   /plugin install sitecoreai-skills@sitecoreai-skills                # Claude Code
# Use this when you want a subset, a symlinked working copy, or an agent
# `gh skill` does not cover.
#
# --dest defaults to ~/.claude/skills, which is right only for Claude Code.
# Codex reads ~/.agents/skills; Copilot reads ~/.copilot/skills or ~/.agents/skills.
#
#   ./scripts/install.sh                          # all skills -> ~/.claude/skills
#   ./scripts/install.sh --dest ~/.cursor/skills  # somewhere else
#   ./scripts/install.sh --category migration     # just the migration set
#   ./scripts/install.sh --only sitecoreai-media,sitecoreai-workflow
#   ./scripts/install.sh --link                   # symlink instead of copy
#   ./scripts/install.sh --dry-run

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/skills"

DEST="${HOME}/.claude/skills"
CATEGORY=""
ONLY=""
LINK=0
DRY=0
FORCE=0

die() { printf 'error: %s\n' "$1" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --dest)     DEST="${2:?--dest needs a directory}"; shift 2 ;;
    --category) CATEGORY="${2:?--category needs a value}"; shift 2 ;;
    --only)     ONLY="${2:?--only needs a comma-separated list}"; shift 2 ;;
    --link)     LINK=1; shift ;;
    --dry-run)  DRY=1; shift ;;
    --force)    FORCE=1; shift ;;
    -h|--help)  awk 'NR>1 && /^#/ { sub(/^# ?/, ""); print; next } NR>1 { exit }' "$0"; exit 0 ;;
    *)          die "unknown option: $1" ;;
  esac
done

[ -d "$SRC" ] || die "no skills directory at $SRC"

# Resolve the selection.
selected=()
if [ -n "$ONLY" ]; then
  IFS=',' read -ra want <<< "$ONLY"
  for w in "${want[@]}"; do
    w="$(printf '%s' "$w" | tr -d '[:space:]')"
    [ -d "$SRC/$w" ] || die "no such skill: $w"
    selected+=("$w")
  done
else
  for d in "$SRC"/*/; do
    name="$(basename "$d")"
    if [ -n "$CATEGORY" ]; then
      # category lives in the SKILL.md metadata block
      grep -qE "^[[:space:]]+category:[[:space:]]+${CATEGORY}[[:space:]]*$" "$d/SKILL.md" || continue
    fi
    selected+=("$name")
  done
fi

[ ${#selected[@]} -gt 0 ] || die "nothing selected${CATEGORY:+ for category '$CATEGORY'}"

printf 'Installing %d skill(s) into %s%s\n' "${#selected[@]}" "$DEST" \
  "$([ "$LINK" = 1 ] && printf ' (symlinks)')"
[ "$DRY" = 1 ] && printf '(dry run — nothing will be written)\n'

[ "$DRY" = 1 ] || mkdir -p "$DEST"

for name in "${selected[@]}"; do
  target="$DEST/$name"

  # Only ever replace a directory we recognise as one of ours.
  if [ -e "$target" ] || [ -L "$target" ]; then
    if [ "$FORCE" != 1 ] && [ ! -L "$target" ] && [ ! -f "$target/SKILL.md" ]; then
      die "$target exists and is not a skill directory — refusing to replace it (use --force)"
    fi
    action="update"
  else
    action="install"
  fi

  if [ "$DRY" = 1 ]; then
    printf '  %-8s %s\n' "$action" "$name"
    continue
  fi

  rm -rf "$target"
  if [ "$LINK" = 1 ]; then
    ln -s "$SRC/$name" "$target"
  else
    cp -R "$SRC/$name" "$target"
  fi
  printf '  %-8s %s\n' "$action" "$name"
done

printf 'Done. Restart your agent to pick up the changes.\n'
