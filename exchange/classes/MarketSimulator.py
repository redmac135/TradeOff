import random
from .OrderBook import OrderBook

class MarketSimulator:
    def __init__(self, base_price=100.0, growth_rate=0.001, sentiment=0.0, candle_interval=10):
        self.base_price = base_price
        self.growth_rate = growth_rate
        self.sentiment = sentiment
        self.tick = 0
        self.order_book = OrderBook()
        self.candle_interval = candle_interval

    def true_price(self):
        """True price = base growth + sentiment effect."""
        growth = self.base_price * (1 + self.growth_rate * self.tick)
        return growth * (1 + self.sentiment)

    def simulate_tick(self):
        """Simulate one tick by generating a random buy and sell order."""
        self.tick += 1
        true_p = self.true_price()

        # Generate random number of orders (10-20)
        num_orders = random.randint(10, 20)

        for _ in range(num_orders):
            # Randomly decide buy or sell
            side = "buy" if random.random() < 0.5 else "sell"
            # Price within ±1% of true price
            price_variation = true_p * random.uniform(-0.01, 0.01)
            price = true_p + price_variation
            self.order_book.add_order(side, price)

        # Every N ticks, export a candle
        if self.tick % self.candle_interval == 0:
            return self.order_book.get_candle()
        return None
