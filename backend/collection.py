"""Read-only access to a user's collection (public.artworks / public.profiles).

The backend connects to Postgres directly with DATABASE_URL, which bypasses
Supabase Row Level Security. Every query here therefore filters on a user_id
that came from a *verified* Supabase JWT (see auth.py), never from the request
body.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from sqlalchemy import bindparam, text
from sqlalchemy.ext.asyncio import AsyncEngine

# Columns the agent is allowed to see. Image URLs and internal ids of other
# tables are left out on purpose.
_SUMMARY_COLUMNS = (
    "id, title, artist, year, medium, dimensions, purchase_price, purchase_year, "
    "desired_price, status"
)
_DETAIL_COLUMNS = (
    _SUMMARY_COLUMNS
    + ", provenance, certificate, condition, description, signed, edition, "
    "edition_number, edition_size, invoice_available, additional_notes"
)

MAX_ARTWORKS = 200


def _clean(row: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in row.items():
        if value is None or value == "":
            continue
        if isinstance(value, Decimal):
            value = float(value)
        out[key] = str(value) if key == "id" else value
    return out


async def get_profile(engine: AsyncEngine, user_id: str) -> dict[str, Any]:
    async with engine.connect() as conn:
        row = (
            await conn.execute(
                text("select name, active_role from public.profiles where id = :uid"),
                {"uid": user_id},
            )
        ).mappings().first()
    return dict(row) if row else {}


async def get_collection_summary(engine: AsyncEngine, user_id: str) -> list[dict[str, Any]]:
    async with engine.connect() as conn:
        rows = (
            await conn.execute(
                text(
                    f"select {_SUMMARY_COLUMNS} from public.artworks "
                    "where user_id = :uid order by created_at desc limit :lim"
                ),
                {"uid": user_id, "lim": MAX_ARTWORKS},
            )
        ).mappings().all()
    return [_clean(dict(r)) for r in rows]


async def get_artwork_details(
    engine: AsyncEngine, user_id: str, artwork_ids: list[str]
) -> list[dict[str, Any]]:
    if not artwork_ids:
        return []
    stmt = text(
        f"select {_DETAIL_COLUMNS} from public.artworks "
        "where user_id = :uid and id::text in :ids"
    ).bindparams(bindparam("ids", expanding=True))
    async with engine.connect() as conn:
        rows = (
            await conn.execute(stmt, {"uid": user_id, "ids": artwork_ids[:20]})
        ).mappings().all()
    return [_clean(dict(r)) for r in rows]


def format_summary(artworks: list[dict[str, Any]]) -> str:
    """One compact line per artwork, for the system prompt."""
    if not artworks:
        return "The user has no artworks saved in their collection yet."
    lines = []
    for a in artworks:
        parts = [f'"{a.get("title", "Untitled")}" by {a.get("artist", "unknown")}']
        for key in ("year", "medium", "dimensions", "purchase_year", "status"):
            if key in a:
                parts.append(f"{key.replace('_', ' ')} {a[key]}")
        for key, label in (("purchase_price", "paid"), ("desired_price", "asking")):
            if isinstance(a.get(key), (int, float)):
                parts.append(f"{label} ${a[key]:,.0f}")
        lines.append(f"- [id {a['id']}] " + ", ".join(parts))
    return "\n".join(lines)
