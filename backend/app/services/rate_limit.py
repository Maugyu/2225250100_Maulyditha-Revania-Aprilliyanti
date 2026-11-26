"""Pembatasan percobaan login di memori proses (cukup untuk 1 worker; lihat SECURITY §3)."""

import time
from collections import defaultdict, deque

MAX_FAILURES = 5
WINDOW_SECONDS = 15 * 60

_failures: dict[str, deque[float]] = defaultdict(deque)


def _prune(key: str, now: float) -> deque[float]:
    q = _failures[key]
    while q and now - q[0] > WINDOW_SECONDS:
        q.popleft()
    return q


def is_blocked(key: str) -> bool:
    return len(_prune(key, time.monotonic())) >= MAX_FAILURES


def record_failure(key: str) -> None:
    now = time.monotonic()
    _prune(key, now).append(now)


def reset(key: str) -> None:
    _failures.pop(key, None)


def reset_all() -> None:
    _failures.clear()
