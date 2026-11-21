"""Verify the Supabase access token the frontend sends as `Authorization: Bearer ...`.

Supports both Supabase signing setups:
- Newer projects (asymmetric JWT signing keys): verified against the project's
  JWKS endpoint. Needs only SUPABASE_URL.
- Legacy projects (shared HS256 secret): set SUPABASE_JWT_SECRET
  (Supabase dashboard -> Project Settings -> API / JWT Keys).
"""

from __future__ import annotations

import asyncio
import os

import jwt
from jwt import PyJWKClient

_SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
_jwks = PyJWKClient(f"{_SUPABASE_URL}/auth/v1/.well-known/jwks.json", cache_keys=True)


class AuthError(Exception):
    pass


def _decode(token: str) -> dict:
    if _JWT_SECRET:
        return jwt.decode(token, _JWT_SECRET, algorithms=["HS256"], audience="authenticated")
    key = _jwks.get_signing_key_from_jwt(token).key
    return jwt.decode(token, key, algorithms=["ES256", "RS256"], audience="authenticated")


async def user_id_from_header(authorization: str | None) -> str | None:
    """Return the verified user id, None if no token was sent, or raise AuthError."""
    if not authorization:
        return None
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise AuthError("Malformed Authorization header")
    try:
        claims = await asyncio.to_thread(_decode, token)  # JWKS fetch is blocking
    except jwt.PyJWTError as e:
        raise AuthError(f"Invalid token: {e}") from e
    return claims["sub"]
