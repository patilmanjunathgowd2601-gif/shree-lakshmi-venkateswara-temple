import jwt
from fastapi import Header, HTTPException, status

from .config import settings


def require_admin(authorization: str | None = Header(default=None)) -> dict:
    """Verifies the same JWT the Node backend issues on admin login, so one
    admin session works across both services."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized. Admin login required.",
        )

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
        ) from exc

    return payload
