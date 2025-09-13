import heapq
from typing import List
from Order import Order
from decimal import Decimal

class OrderBook:
    def __init__(self):
        # max-heap for buys (invert price), min-heap for sells
        self.buy_orders: List[tuple] = []
        self.sell_orders: List[tuple] = []
        self.trades: List[float] = []  # list of trade prices
        self.current_candle: List[float] = []
        self.next_order_id = 0

    def add_order(self, side: str, price: float):
        """Add an order and attempt to match it."""
        order = Order(price=price, order_id=self.next_order_id, side=side)
        self.next_order_id += 1

        if side == "buy":
            heapq.heappush(self.buy_orders, (-order.price, order.order_id, order))
        else:
            heapq.heappush(self.sell_orders, (order.price, order.order_id, order))

        self.match_orders()

    def match_orders(self):
        """Match highest buy with lowest sell if possible."""
        while self.buy_orders and self.sell_orders:
            best_buy = self.buy_orders[0][2]
            best_sell = self.sell_orders[0][2]

            if best_buy.price >= best_sell.price:
                # Execute trade at midpoint (or best sell — up to you)
                trade_price = (best_buy.price + best_sell.price) / 2

                # Record trade price
                self.trades.append(trade_price)
                self.current_candle.append(trade_price)

                # Remove both orders (since we don’t track volume)
                heapq.heappop(self.buy_orders)
                heapq.heappop(self.sell_orders)
            else:
                break

    def get_candle(self, reset=True):
        """Return OHLC for current trades in interval."""
        if not self.current_candle:
            return None

        prices = self.current_candle
        candle = {
            "open": prices[0],
            "high": max(prices),
            "low": min(prices),
            "close": prices[-1],
        }

        if reset:
            self.current_candle = []

        return candle