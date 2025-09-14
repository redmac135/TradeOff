import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras
from .News import News

load_dotenv()  # Load environment variables from .env file

class NewsGenerator:
    model_name = "qwen-3-235b-a22b-instruct-2507"

    def __init__(self):
        self.client = Cerebras(
            api_key=os.environ.get("CEREBRAS_API_KEY")
        )

    def generate_news(self, temperature=1.0, top_p=1.0, max_tokens=100):
        """
        Generates a news headline, summary, and sentiment score.
        """
        # --- 1. Generate headline ---
        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a financial news editor. Generate only a single, realistic news headline "
                        "about the company provided. Sometimes make the stock impact obvious (good or bad), "
                        "other times make it uncertain or mixed. Reply ONLY with a single news headline. "
                        "No explanations, no reasoning, no commentary."
                    )
                },
                {"role": "user", "content": f"Generate a news headline about: Facebook"}
            ],
            model=self.model_name,
            stream=False,
            max_completion_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
        )
        headline = response.choices[0].message.__dict__["content"].strip()

        # --- 2. Generate summary ---
        summary_response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a financial journalist. Write a short, one-sentence summary "
                        "explaining the key idea of the headline. Keep it concise and objective. "
                        "Reply ONLY with the summary."
                    )
                },
                {"role": "user", "content": f"Headline: {headline}"}
            ],
            model=self.model_name,
            stream=False,
            max_completion_tokens=60,
            temperature=0.7,
        )
        summary = summary_response.choices[0].message.__dict__["content"].strip()

        # --- 3. Estimate sentiment ---
        sentiment_score = self.parse_news(headline)

        # --- 4. Return News object ---
        news = News(headline=headline, summary=summary, sentiment=sentiment_score)
        return news

    def parse_news(self, news, max_tokens=100):
        """
        Uses Cerebras to estimate a sentiment adjustment for the headline.
        Returns a float in range [-1.0, 1.0].
        """
        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a stock market analyst. Given a news headline, estimate its likely short-term "
                        "impact on the company's stock price. Output only a floating-point number between -1.0 "
                        "and 1.0, where negative values mean bearish, positive mean bullish, and 0 means neutral. "
                        "Be realistic: most headlines should be moderate (e.g., +0.3, -0.4), not extreme."
                    )
                },
                {"role": "user", "content": f"Headline: {news}"}
            ],
            model=self.model_name,
            stream=False,
            max_completion_tokens=max_tokens,
            temperature=0.3,
        )

        sentiment_str = response.choices[0].message.__dict__["content"].strip()

        try:
            return float(sentiment_str)
        except (TypeError, ValueError):
            print("Warning: Could not parse sentiment response, defaulting to 0.0")
            print("Response was:", sentiment_str)
            return 0.0
