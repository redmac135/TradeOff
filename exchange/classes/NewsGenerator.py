import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras
from .News import News
import json
import random
from .Settings import SENTIMENT_SHOCK_PROB

load_dotenv()  # Load environment variables from .env file


class NewsGenerator:
    model_name = "llama-4-scout-17b-16e-instruct"

    def __init__(self):
        self.client = Cerebras(api_key=os.environ.get("CEREBRAS_API_KEY"))

    def next_sentiment(self):
        import random

        if random.random() < SENTIMENT_SHOCK_PROB:
            # big event
            sentiment = random.choice([-1.0, 1.0])
        else:
            # small random walk around last
            sentiment = random.uniform(-0.5, 0.5)

        return sentiment

    def generate_news(self, temperature=1.0, top_p=1.0, max_tokens=100):
        """
        Generates a news headline, summary, and sentiment score.
        """
        news_schema = {
            "type": "object",
            "properties": {
                "headline": {"type": "string"},
                "summary": {"type": "string"},
            },
            "required": ["headline", "summary"],
            "additionalProperties": False,
        }

        target_sentiment = self.next_sentiment()

        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a financial news editor. "
                        "Generate a realistic news headline about the company provided. "
                        "You will be given a target sentiment score. "
                        "The sentiment of the headline and summary MUST align with this target sentiment. "
                        "Do not override it, even if it feels unrealistic. "
                    ),
                },
                {
                    "role": "user",
                    "content": f"Company: Facebook. Target sentiment: {target_sentiment:.2f}",
                },
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "news_schema",
                    "strict": True,
                    "schema": news_schema,
                },
            },
            model=self.model_name,
            stream=False,
            temperature=temperature,
            top_p=top_p,
        )

        result = json.loads(response.choices[0].message.content)

        news = News(
            headline=result["headline"],
            summary=result["summary"],
            sentiment=round(target_sentiment, 2),
        )

        return news
