#!/usr/bin/env python3
"""Fire Hatchling autonomous production loop selector.

This script does not perform art edits by itself. It enforces the persistent production
state contract: read current phase/scores/backlog, select the highest-value ready task,
check stop/escalation conditions, and emit a pass directive that an autonomous agent can
execute without waiting for a manual next-slice prompt.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "project"


def load_json(name: str) -> dict:
    return json.loads((PROJECT / name).read_text(encoding="utf-8"))


def choose_task(backlog: dict) -> dict | None:
    ready = [t for t in backlog.get("tasks", []) if t.get("status") == "ready"]
    if not ready:
        return None
    return sorted(ready, key=lambda t: (t.get("priority", 999), t.get("id", "")))[0]


def check_escalation(scores: dict, task: dict | None) -> list[str]:
    warnings: list[str] = []
    latest = scores.get("latest") or {}
    deltas = scores.get("latest_deltas_vs_previous") or {}
    plateau = scores.get("plateau_watch", {}).get("metrics_currently_plateauing", [])

    if task is None:
        warnings.append("No ready backlog task exists; human/producer triage required.")
    if plateau:
        warnings.append(f"Plateau watch active for metrics: {', '.join(plateau)}")

    # Commercial/readability regression guard.
    for key in ("commercial_readiness", "readability"):
        if deltas.get(key, 0) <= -0.3:
            warnings.append(f"{key} regressed by {deltas[key]} — escalation required.")

    # Cosmetic-only guard for current phase.
    if task and task.get("phase") == "Production Mesh Truth Phase":
        objective = task.get("objective", "").lower()
        task_id = task.get("id", "").lower()
        required = " ".join(task.get("required_outputs", [])).lower()
        if "presentation cleanup" in objective or "cosmetic" in objective:
            warnings.append("Selected task appears cosmetic during Production Mesh Truth Phase.")
        # Asset-change evidence is mandatory for conversion/tuning tasks. A follow-up stress-test
        # task is allowed after an actual .spine change because its purpose is to validate that
        # changed asset, not create another directive-only pass.
        is_asset_edit_task = any(token in task_id + " " + objective for token in ["conversion", "weight-tune", "mesh conversion", "hand weight", "edited mesh"])
        is_stress_test_task = any(token in task_id + " " + objective for token in ["stress", "rerun", "validation"])
        if is_asset_edit_task and "actual .spine" not in required:
            warnings.append("Production Mesh Truth asset-edit task lacks actual .spine change evidence requirement.")
        if not is_asset_edit_task and not is_stress_test_task:
            warnings.append("Production Mesh Truth task is neither asset-edit nor direct validation of a changed asset.")

    return warnings


def main() -> None:
    scores = load_json("automation_scores.json")
    backlog = load_json("production_backlog.json")
    task = choose_task(backlog)
    warnings = check_escalation(scores, task)

    now = datetime.now(timezone.utc).isoformat()
    directive = {
        "generated_at": now,
        "mode": "Autonomous Production Loop",
        "asset": backlog.get("asset", "Fire Hatchling"),
        "active_phase": backlog.get("active_phase"),
        "current_scores": (scores.get("latest") or {}).get("scores"),
        "current_bottleneck_interpretation": scores.get("current_bottleneck_interpretation"),
        "selected_task": task,
        "regression_or_escalation_warnings": warnings,
        "escalation_recommendation": "escalate" if warnings else "continue_autonomously",
        "next_required_action": None,
    }
    if task:
        directive["next_required_action"] = (
            f"Execute {task['id']}: {task['objective']}"
        )
    else:
        directive["next_required_action"] = "Create or unblock a ready backlog task."

    out_dir = PROJECT / "autonomous_passes"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / "latest_autonomous_directive.json"
    out_path.write_text(json.dumps(directive, indent=2), encoding="utf-8")
    print(json.dumps(directive, indent=2))


if __name__ == "__main__":
    main()
