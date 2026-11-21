"""FastAPI entry point: POST /api/chat, called by lib/api.ts in the Next.js app.

Run:  uvicorn server:app --reload --port 5000   (from the backend/ directory)
"""

from __future__ import annotations

import logging
import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Header, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402

import art_agent  # noqa: E402
from auth import AuthError, user_id_from_header  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="OFFA API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


class ChatRequest(BaseModel):
    message: str
    conversationId: str | None = None


class ChatResponse(BaseModel):
    message: str
    conversationId: str


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, authorization: str | None = Header(default=None)):
    try:
        user_id = await user_id_from_header(authorization)
    except AuthError as e:
        raise HTTPException(status_code=401, detail=str(e))

    try:
        return await art_agent.run(req.message, req.conversationId or None, user_id)
    except Exception:
        logger.exception("Agent run failed")
        raise HTTPException(status_code=502, detail="The advisor is unavailable right now.")
