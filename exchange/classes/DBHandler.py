class DBHandler:

    def __init__(self):
        # initializes the DynamoDB client and tables
        # hook up status stream handler here
        pass

    def reset_tables(self):
        # clears the OHLCV, news, players, and status table
        pass

    def push_candle_data(self, data):
        # pushes new candle data to the OHLCV table
        pass

    def push_news(self, headline):
        # pushes a new news headline to the news table
        pass

    # Handlers that attach to DynamoDB streams
    def status_stream_handler(self, record):
        # handles updates to the status table
        # waits for a "Start game" signal, then initializes the games
        pass