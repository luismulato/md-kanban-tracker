#!/usr/bin/env bash
# Finds md-kanban-tracker boards (mng/*.kanban.md) under a search root,
# and appends a new task card to a section of a given board.
#
# Search root: $KANBAN_BOARDS_ROOT if set, otherwise the current
# directory. Point it at whatever directory holds your projects — a
# broad root such as $HOME can be slow and hit unrelated permission
# errors (Library, Mail, Trash, etc. on macOS).
#
# Usage:
#   kanban-task.sh find <query>
#     Searches for projects whose folder name matches <query> (exact,
#     substring, or fuzzy by token) and that have their own
#     mng/*.kanban.md board. Emits a JSON array on stdout:
#     [{project, root, board, match}, ...]
#     Only the best available match tier is returned: if any "exact"
#     match exists, only those; otherwise only "partial"; otherwise
#     only "fuzzy". If none, "[]".
#
#   kanban-task.sh add-card <board> <section> <title>
#     Appends "### <title>" as a new card at the end of <section>
#     (right before the next "## ..." section, or at end of file).
#     <section> matches case-insensitively against the "## " headers
#     that already exist in the board. If it doesn't exist, lists the
#     available sections on stderr and exits with an error (it never
#     creates one). Emits a JSON object on stdout:
#     {"board":..., "section":..., "title":...}
set -euo pipefail

SEARCH_ROOT="${KANBAN_BOARDS_ROOT:-$PWD}"

normalize() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

cmd="${1:-}"
shift || true

case "$cmd" in
  find)
    query="${1:-}"
    if [[ -z "$query" ]]; then
      echo "Usage: kanban-task.sh find <query>" >&2
      exit 1
    fi
    query_lc=$(normalize "$query")

    exact_matches=()
    partial_matches=()
    fuzzy_matches=()

    while IFS= read -r board; do
      [[ -z "$board" ]] && continue
      root=$(dirname "$(dirname "$board")")
      project=$(basename "$root")
      name_lc=$(normalize "$project")

      entry=$(jq -n --arg project "$project" --arg root "$root" --arg board "$board" \
        '{project:$project, root:$root, board:$board}')

      if [[ "$name_lc" == "$query_lc" ]]; then
        exact_matches+=("$entry")
      elif [[ "$name_lc" == *"$query_lc"* || "$query_lc" == *"$name_lc"* ]]; then
        partial_matches+=("$entry")
      else
        name_tokens=$(echo "$name_lc" | tr -cs 'a-z0-9' ' ')
        query_tokens=$(echo "$query_lc" | tr -cs 'a-z0-9' ' ')
        match_found=0
        for qt in $query_tokens; do
          [[ ${#qt} -lt 3 ]] && continue
          for nt in $name_tokens; do
            if [[ "$nt" == *"$qt"* || "$qt" == *"$nt"* ]]; then
              match_found=1
              break 2
            fi
          done
        done
        if [[ "$match_found" -eq 1 ]]; then
          fuzzy_matches+=("$entry")
        fi
      fi
    done < <(
      find "$SEARCH_ROOT" \( -path '*/node_modules/*' -o -path '*/.git/*' \) -prune \
        -o -path '*/mng/*.kanban.md' -type f -print 2>/dev/null | sort -u
    )

    if [[ ${#exact_matches[@]} -gt 0 ]]; then
      printf '%s\n' "${exact_matches[@]}" | jq -s 'map(. + {match:"exact"})'
    elif [[ ${#partial_matches[@]} -gt 0 ]]; then
      printf '%s\n' "${partial_matches[@]}" | jq -s 'map(. + {match:"partial"})'
    elif [[ ${#fuzzy_matches[@]} -gt 0 ]]; then
      printf '%s\n' "${fuzzy_matches[@]}" | jq -s 'map(. + {match:"fuzzy"})'
    else
      echo "[]"
    fi
    ;;

  add-card)
    board="${1:-}"
    section="${2:-}"
    title="${3:-}"
    if [[ -z "$board" || -z "$section" || -z "$title" ]]; then
      echo "Usage: kanban-task.sh add-card <board> <section> <title>" >&2
      exit 1
    fi
    if [[ ! -f "$board" ]]; then
      echo "Board not found: $board" >&2
      exit 1
    fi

    section_lc=$(normalize "$section")
    tmp=$(mktemp)

    set +e
    awk -v section_lc="$section_lc" -v title="$title" '
      BEGIN { in_section=0; inserted=0; found_section=0; lastline="" }
      {
        if ($0 ~ /^## /) {
          if (in_section == 1 && inserted == 0) {
            if (lastline != "") print ""
            print "### " title
            print ""
            inserted = 1
          }
          hdr = $0
          sub(/^## /, "", hdr)
          if (tolower(hdr) == section_lc) {
            in_section = 1
            found_section = 1
          } else {
            in_section = 0
          }
        }
        print $0
        lastline = $0
      }
      END {
        if (in_section == 1 && inserted == 0) {
          if (lastline != "") print ""
          print "### " title
          print ""
        }
        if (found_section == 0) exit 2
      }
    ' "$board" > "$tmp"
    status=$?
    set -e

    if [[ $status -eq 2 ]]; then
      rm -f "$tmp"
      echo "Section '$section' not found in $board. Available sections:" >&2
      grep '^## ' "$board" | sed 's/^## /  - /' >&2
      exit 1
    elif [[ $status -ne 0 ]]; then
      rm -f "$tmp"
      echo "Failed to edit $board (awk exit $status)." >&2
      exit 1
    fi

    mv "$tmp" "$board"
    jq -n --arg board "$board" --arg section "$section" --arg title "$title" \
      '{board:$board, section:$section, title:$title}'
    ;;

  *)
    echo "Usage: kanban-task.sh find <query> | kanban-task.sh add-card <board> <section> <title>" >&2
    exit 1
    ;;
esac
