# This file is the main infinate loop for the backend
# It will be called by QNX on startup and stay running forever


from classes.DBHandler import DBHandler
from classes.NewsGenerator import NewsGenerator
from classes.MarketSimulator import MarketSimulator
from classes.OrderBook import OrderBook


db_handler = DBHandler()
news_generator = NewsGenerator()
order_book = OrderBook()
market_simulator = MarketSimulator(order_book=order_book, news_generator=news_generator, db_handler=db_handler)

market_simulator.run()