from exchange.classes.NewsGenerator import NewsGenerator
from time import sleep

def test_news_generator():
    generator = NewsGenerator()

    for _ in range(5):
        print(generator.generate_news())

    print("All tests passed.")

if __name__ == "__main__":
    test_news_generator()