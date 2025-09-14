from dataclasses import dataclass

@dataclass(order=True)
class News:
    headline: str
    summary: str
    sentiment: float  # -1 (very negative) to +1 (very positive)