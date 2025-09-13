from dataclasses import dataclass

@dataclass(order=True)
class Order:
    price: float
    order_id: int
    side: str  # "buy" or "sell"