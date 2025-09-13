import time
from decimal import Decimal

class Order:
    def __init__(self, order_id, player_id, side, qty, price, ts=None):
        self.order_id = order_id
        self.player_id = player_id
        self.side = side  # "BUY" or "SELL"
        self.qty = qty
        self.price = Decimal(str(price))
        self.ts = ts or int(time.time() * 1000)

    def __repr__(self):
        return f"<Order {self.side} {self.qty}@{self.price} ({self.player_id})>"
