import re
from typing import Optional


def sanitize_query(query: str, max_length: int = 100) -> str:
    """Sanitize location search queries to prevent injection or invalid requests."""
    if not query:
        return ""
    # Strip dangerous characters, retain standard city and country name chars
    cleaned = re.sub(r"[^\w\s\-\,\.\'\(\)]", "", query, flags=re.UNICODE)
    # Remove consecutive hyphens used in SQL comment patterns
    cleaned = re.sub(r"-{2,}", "-", cleaned)
    return cleaned.strip(" -")[:max_length]


def validate_coordinates(lat: float, lon: float) -> bool:
    """Ensure latitude is within [-90, 90] and longitude is within [-180, 180]."""
    return (-90.0 <= lat <= 90.0) and (-180.0 <= lon <= 180.0)


def mask_secret(secret: Optional[str]) -> str:
    """Safely mask API keys for diagnostics and logging."""
    if not secret:
        return "<not set>"
    if len(secret) <= 8:
        return "***"
    return f"{secret[:4]}...{secret[-4:]}"
