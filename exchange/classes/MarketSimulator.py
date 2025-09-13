import random
import uuid
from decimal import Decimal
from Order import Order

class MarketSimulator:
    def __init__(self, order_book, base_price=100.0):
        self.book = order_book
        self.base_price = Decimal(str(base_price))
        self.sentiment = 0.0
        self.tick_count = 0

    def true_order_price(self):
        """
        Base price grows slowly over time (e.g. 0.01% per tick),
        adjusted by current sentiment.
        """
        drift = Decimal("0.0001") * self.tick_count  # slow growth
        sentiment_factor = Decimal(str(self.sentiment)) * Decimal("0.5")
        return self.base_price + drift + sentiment_factor

    def generate_agent_order(self, agent_id):
        true_price = self.true_order_price()
        price = true_price * Decimal(str(1 + random.uniform(-0.01, 0.01)))
        side = "BUY" if random.random() < 0.5 else "SELL"
        qty = random.randint(1, 10)

        order = Order(
            order_id=str(uuid.uuid4()),
            player_id=agent_id,
            side=side,
            qty=qty,
            price=price
        )
        self.book.add_order(order)

    def tick(self, n_agents=5):
        # update sentiment slowly drifting
        self.sentiment = self.sentiment * 0.9 + random.uniform(-0.2, 0.2)

        for i in range(n_agents):
            self.generate_agent_order(agent_id=f"agent{i}")

        trades = self.book.match()
        self.tick_count += 1
        return trades