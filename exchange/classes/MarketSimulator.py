import random
import time
import threading
from .Settings import (
    CANDLE_PERIOD, NEWS_PERIOD, INITIAL_SENTIMENT,
    BOT_ORDER_SPREAD_PERCENT, SENTIMENT_IMPACT,
    GROWTH_RATE, BASE_PRICE, SIMULATION_DURATION
)
from .OrderBook import OrderBook
from .DBHandler import DBHandler
from .NewsGenerator import NewsGenerator


class MarketSimulator:
    def __init__(self, order_book: OrderBook, news_generator: NewsGenerator, db_handler: DBHandler):
        self.base_price = BASE_PRICE
        self.growth_rate = GROWTH_RATE
        self.sentiment = INITIAL_SENTIMENT

        self.candle_period = CANDLE_PERIOD
        self.news_period = NEWS_PERIOD
        self.candle_count = 0
        self.simulation_duration = SIMULATION_DURATION

        self.order_book = order_book
        self.news_generator = news_generator
        self.db_handler = db_handler

        # Thread control / sync primitives
        self.running = False
        self.state_lock = threading.Lock()     # protect reads/writes of shared state (candle_count, sentiment)
        self.order_event = threading.Event()   # signalled by main clock when a new candle should be generated
        self.news_event = threading.Event()    # signalled by main clock when news thread should check

        # ensure each worker only processes each candle once
        self._last_order_processed = 0
        self._last_news_processed = 0

    def _snapshot_state(self):
        """Return (candle_count, sentiment) snapshot under lock."""
        with self.state_lock:
            return self.candle_count, self.sentiment

    def _true_price_for(self, candle_idx: int, sentiment_snapshot: float):
        """Compute true price for a given candle index & sentiment snapshot."""
        growth = self.base_price * (1 + self.growth_rate * candle_idx)
        return growth * (1 + sentiment_snapshot)

    def order_loop(self):
        """
        Waits for the clock event. When signalled, generates orders for that candle,
        creates the candle from the order book and pushes it to the DB.
        """
        while self.running:
            self.order_event.wait()
            if not self.running:
                break

            candle_idx, sentiment_snapshot = self._snapshot_state()
            if candle_idx == 0 or candle_idx == self._last_order_processed:
                self.order_event.clear()
                continue

            # Use last traded price or fallback to base
            last_price = self.order_book.get_prev_close() or self.base_price

            # Liquidity pressure toward base price
            deviation = (last_price - self.base_price) / self.base_price
            # Base buy probability
            buy_prob = 0.5

            # Momentum effect (slight bias if last candle up/down)
            prev_close = self.order_book.get_prev_close() or last_price
            if last_price > prev_close:
                buy_prob += 0.15  # tilt upward momentum
            else:
                buy_prob -= 0.15  # tilt downward momentum

            # Liquidity reversion (push back toward base)
            buy_prob -= deviation * 0.2  # stronger deviation = stronger push back

            # Clamp to keep probabilities sane
            buy_prob = max(0.1, min(0.9, buy_prob))

            # Generate orders
            num_orders = random.randint(50, 100)
            spread = 0.01  # +/-1% around last price

            for _ in range(num_orders):
                side = "buy" if random.random() < buy_prob else "sell"
                price_variation = last_price * random.uniform(-spread, spread)
                price = max(0.01, last_price + price_variation)  # never let price go <= 0
                self.order_book.add_order(side, price)

            # Build candle and push to DB
            candle = self.order_book.get_candle()
            try:
                self.db_handler.push_candle_data(candle)
            except Exception as e:
                print(f"Warning: push_candle_data failed for candle {candle_idx}: {e}")

            print(f"[OrderThread] Candle {candle_idx} generated and pushed: {candle}")

            self._last_order_processed = candle_idx
            self.order_event.clear()


    def news_loop(self):
        """
        Waits for the clock event. When signalled, checks whether news should be generated
        for this candle, and if so generates it and updates sentiment / DB.
        """
        while self.running:
            self.news_event.wait()
            if not self.running:
                break

            candle_idx, _ = self._snapshot_state()
            if candle_idx == 0 or candle_idx == self._last_news_processed:
                self.news_event.clear()
                continue

            # Only generate news on configured period
            if candle_idx % self.news_period == 0:
                try:
                    news = self.news_generator.generate_news()
                    # attempt to push via DB handler in a flexible way:
                    try:
                        # preferred: DB handler accepts the News object
                        self.db_handler.push_news(news)
                    except TypeError:
                        # fallback: push headline + summary if available
                        headline = getattr(news, "headline", str(news))
                        summary = getattr(news, "summary", "")
                        try:
                            self.db_handler.push_news(headline, summary)
                        except Exception:
                            # last fallback: push headline only
                            self.db_handler.push_news(headline)

                    # update sentiment atomically
                    with self.state_lock:
                        self.sentiment += getattr(news, "sentiment", 0.0) * SENTIMENT_IMPACT

                    print(f"[NewsThread] Candle {candle_idx}: News generated '{getattr(news,'headline',news)}' (sentiment {getattr(news,'sentiment',0.0)})")
                except Exception as e:
                    print(f"Warning: news generation failed at candle {candle_idx}: {e}")

            self._last_news_processed = candle_idx
            self.news_event.clear()

    def run(self):
        """
        Main clock loop: increments candle_count, signals worker threads, then sleeps.
        The order thread generates and pushes candles (so the main loop doesn't block).
        """
        max_candles = int(self.simulation_duration / self.candle_period)
        self.running = True

        order_thread = threading.Thread(target=self.order_loop, daemon=True)
        news_thread = threading.Thread(target=self.news_loop, daemon=True)
        order_thread.start()
        news_thread.start()

        try:
            while True:
                with self.state_lock:
                    if self.candle_count >= max_candles:
                        break
                    # increment the canonical candle index
                    self.candle_count += 1

                # broadcast tick to workers
                # workers snapshot the candle_count themselves
                self.order_event.set()
                self.news_event.set()

                # main thread acts only as the clock (sleep)
                time.sleep(self.candle_period)

        finally:
            # stop and wake threads so they can exit
            self.running = False
            self.order_event.set()
            self.news_event.set()

            # join (with timeout so join doesn't block forever in pathological cases)
            order_thread.join(timeout=2.0)
            news_thread.join(timeout=2.0)

            # self.db_handler.reset_tables()
            print("Simulation complete.")
