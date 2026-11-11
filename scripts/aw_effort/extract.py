"""Bloques de actividad real de un día, desde ActivityWatch (solo lectura, solo stdlib).

Cruza `not-afk` con las ventanas activas, agrupa por (app, carpeta de trabajo)
y puentea huecos cortos. No toca ningún tablero. Ver
runbooks/2026-10-30-spike-tiempo-efectivo-activitywatch-vscode.md (paso S2).
"""
import argparse
import json
import urllib.request
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timedelta

AW = "http://localhost:5600/api/0"
EDITOR_SUFFIX = "Visual Studio Code"
QUERY = [
    'afk = flood(query_bucket(find_bucket("aw-watcher-afk_")));',
    'win = flood(query_bucket(find_bucket("aw-watcher-window_")));',
    'act = filter_keyvals(afk, "status", ["not-afk"]);',
    "RETURN = filter_period_intersect(win, act);",
]


@dataclass
class Block:
    app: str
    workspace: Optional[str]
    start: datetime
    end: datetime
    active_s: float = 0.0

    @property
    def span_s(self):
        return (self.end - self.start).total_seconds()


def split_title(title):
    """'● archivo — carpeta — Visual Studio Code' -> ('archivo', 'carpeta')."""
    parts = [p.strip() for p in (title or "").split(" — ")]
    if len(parts) > 1 and parts[-1] == EDITOR_SUFFIX:
        parts.pop()
    if len(parts) < 2:
        return (parts[0].lstrip("● ").strip() if parts else "", None)
    return (parts[0].lstrip("● ").strip(), parts[-1])


def _parse(ts):
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def build_blocks(events, max_gap_s=300):
    """Une eventos consecutivos de la misma (app, carpeta) con hueco <= max_gap_s."""
    blocks = []
    for e in sorted(events, key=lambda e: e["timestamp"]):
        start = _parse(e["timestamp"])
        end = start + timedelta(seconds=e["duration"])
        app = e["data"].get("app", "")
        _, ws = split_title(e["data"].get("title", ""))
        last = next((b for b in reversed(blocks) if b.app == app and b.workspace == ws), None)
        if last and (start - last.end).total_seconds() <= max_gap_s:
            last.end = max(last.end, end)
            last.active_s += e["duration"]
        else:
            blocks.append(Block(app, ws, start, end, e["duration"]))
    return blocks


def summarize(blocks):
    """{(app, carpeta): minutos activos}."""
    rows = defaultdict(float)
    for b in blocks:
        rows[(b.app, b.workspace)] += b.active_s / 60
    return dict(rows)


def fetch(day):
    start = datetime.strptime(day, "%Y-%m-%d").astimezone()
    period = f"{start.isoformat()}/{(start + timedelta(days=1)).isoformat()}"
    body = json.dumps({"timeperiods": [period], "query": QUERY}).encode()
    req = urllib.request.Request(f"{AW}/query/", body, {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.load(r)[0]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"))
    ap.add_argument("--max-gap", type=int, default=300, help="segundos de hueco que se puentean")
    a = ap.parse_args()
    blocks = build_blocks(fetch(a.date), a.max_gap)
    rows = summarize(blocks)
    print(f"{a.date}: {len(blocks)} bloques, {sum(rows.values()):.1f} min activos")
    for (app, ws), m in sorted(rows.items(), key=lambda kv: -kv[1]):
        print(f"{m:7.1f} min  {app:18} {ws or '-'}")


if __name__ == "__main__":
    main()
