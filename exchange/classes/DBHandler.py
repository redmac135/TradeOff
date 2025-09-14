import boto3
import time
from boto3.dynamodb.conditions import Key
from decimal import Decimal, ROUND_HALF_UP
from .News import News


class DBHandler:
    def __init__(self, region_name="us-east-2"):
        self.dynamodb = boto3.resource("dynamodb", region_name=region_name)
        self.table = self.dynamodb.Table("TradeOffData")

        # Ensure Status row exists
        resp = self.table.get_item(
            Key={"EntityType": "Status", "EntityID": "Current"}
        )
        if "Item" not in resp:
            self.table.put_item(
                Item={
                    "EntityType": "Status",
                    "EntityID": "Current",
                    "is_running": False,
                }
            )

    def reset_tables(self):
        entity_types = ["OHLCV", "News", "Status"]

        for etype in entity_types:
            resp = self.table.query(
                KeyConditionExpression=Key("EntityType").eq(etype)
            )
            with self.table.batch_writer() as batch:
                for item in resp.get("Items", []):
                    batch.delete_item(
                        Key={
                            "EntityType": item["EntityType"],
                            "EntityID": item["EntityID"],
                        }
                    )

        # Reset status row
        self.table.put_item(
            Item={
                "EntityType": "Status",
                "EntityID": "Current",
                "is_running": False,
            }
        )

    def _to_decimal(self, value: float) -> Decimal:
        """
        Converts float to Decimal with 2 decimal places.
        """
        return Decimal(str(round(value, 2))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def push_candle_data(self, data):
        """
        Expects data = { "Open":..., "High":..., "Low":..., "Close":..., "Volume":... }
        Converts floats to Decimal (2 dp).
        """
        timestamp = str(int(time.time() * 1000))
        item = {
            "EntityType": "OHLCV",
            "EntityID": timestamp,
            "Open": self._to_decimal(data["open"]),
            "High": self._to_decimal(data["high"]),
            "Low": self._to_decimal(data["low"]),
            "Close": self._to_decimal(data["close"]),
            "Volume": self._to_decimal(data["volume"]),
        }
        self.table.put_item(Item=item)

    def push_news(self, news: News):
        news_id = str(int(time.time()))
        item = {
            "EntityType": "News",
            "EntityID": news_id,
            "Headline": news.headline,
            "Summary": str(news.summary),
        }
        self.table.put_item(Item=item)

    def set_status(self, is_running: bool):
        item = {
            "EntityType": "Status",
            "EntityID": "Current",
            "is_running": is_running,
        }
        self.table.put_item(Item=item)

    def get_is_ingame(self) -> bool:
        resp = self.table.get_item(
            Key={"EntityType": "Status", "EntityID": "Current"}
        )
        item = resp.get("Item")
        if not item:
            return False
        return bool(item.get("is_running", False))
