import math
import re
import time
from collections import defaultdict
from typing import Dict, List, Optional


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
    """
    Ensure latitude is within [-90, 90] and longitude is within [-180, 180].
    Strictly rejects NaN, Inf, and non-finite floating point numbers.
    """
    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
        return False
    if not math.isfinite(lat) or not math.isfinite(lon):
        return False
    return (-90.0 <= lat <= 90.0) and (-180.0 <= lon <= 180.0)


def mask_secret(secret: Optional[str]) -> str:
    """Safely mask API keys for diagnostics and logging."""
    if not secret:
        return "<not set>"
    if len(secret) <= 8:
        return "***"
    return f"{secret[:4]}...{secret[-4:]}"


class InMemoryRateLimiter:
    """
    Lightweight sliding-window in-memory rate limiter to protect public endpoints
    against abuse and DoS without adding heavyweight external database dependencies.
    """
    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        
        # Filter timestamps outside the sliding window
        valid_timestamps = [t for t in self.requests[client_id] if t > cutoff]
        self.requests[client_id] = valid_timestamps
        
        if len(valid_timestamps) >= self.max_requests:
            return False
            
        self.requests[client_id].append(now)
        return True

    def reset(self):
        self.requests.clear()

