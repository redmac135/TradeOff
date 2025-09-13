from exchange.classes.NewsGenerator import NewsGenerator
from time import sleep

def test_news_generator():
    generator = NewsGenerator()

    # remember to wait 1.5 seconds between each call to avoid rate limiting
    for _ in range(3):
        print(f"Generating news for topic: Facebook")
        headline = generator.generate_news()

        sleep(1.5)  # wait to avoid rate limiting

        sentiment = generator.parse_news(headline)

        sleep(1.5)  # wait to avoid rate limiting

        print(f"Headline: {headline}")
        print(f"Sentiment adjustment: {sentiment}")
        assert -1.0 <= sentiment <= 1.0, "Sentiment out of bounds"
    
    print("All tests passed.")

if __name__ == "__main__":
    test_news_generator()