import heapq
import time
from Order import Order
from decimal import Decimal

class OrderBook:
    """
    Uses two heaps:
    - max-heap for buys (highest price first)
    - min-heap for sells (lowest price first)
    """

    def __init__(self):
        self.buys = []   # (-price, ts, order)
        self.sells = []  # (price, ts, order)
        self.last_price = Decimal("100.0")

    def add_order(self, order: Order):
        if order.side == "BUY":
            heapq.heappush(self.buys, (-order.price, order.ts, order))
        else:
            heapq.heappush(self.sells, (order.price, order.ts, order))

    def match(self):
        trades = []
        while self.buys and self.sells:
            best_buy = self.buys[0][2]
            best_sell = self.sells[0][2]

            if best_buy.price < best_sell.price:
                break  # no match possible

            qty = min(best_buy.qty, best_sell.qty)
            price = best_sell.price  # trade at sell price

            trades.append({
                "price": price,
                "qty": qty,
                "buy": best_buy.player_id,
                "sell": best_sell.player_id,
                "ts": int(time.time() * 1000)
            })

            self.last_price = price

            best_buy.qty -= qty
            best_sell.qty -= qty

            if best_buy.qty == 0:
                heapq.heappop(self.buys)
            if best_sell.qty == 0:
                heapq.heappop(self.sells)

        return trades
