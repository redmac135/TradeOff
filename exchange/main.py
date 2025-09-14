# This file is the main infinate loop for the backend
# It will be called by QNX on startup and stay running forever


from classes.DBHandler import DBHandler
from classes.NewsGenerator import NewsGenerator
from classes.MarketSimulator import MarketSimulator
from classes.OrderBook import OrderBook

import time


def main():
    db_handler = DBHandler()
    news_generator = NewsGenerator()
    order_book = OrderBook()
    market_simulator = MarketSimulator(order_book=order_book, news_generator=news_generator, db_handler=db_handler)

    print("[Backend] Backend started. Waiting for game start signal...")

    while True:
        try:
            if True:
                print("[Backend] Game start detected! Running market simulator...")
                market_simulator.run()
                print("[Backend] Market simulator finished. Waiting for next game...")

                # reset orderbook and marketsimulator for next game
                order_book = OrderBook()
                market_simulator = MarketSimulator(order_book=order_book, news_generator=news_generator, db_handler=db_handler)
            else:
                # no game yet → sleep briefly before checking again
                time.sleep(1)

        except KeyboardInterrupt:
            print("\n[Backend] Shutting down cleanly.")
            break
        except Exception as e:
            print(f"[Backend] Warning: caught exception in main loop: {e}")
            time.sleep(5)  # avoid tight loop on repeated errors


if __name__ == "__main__":
    main()
