import { useEffect, useState } from "react";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../aws/dynamoClient";

const TABLE_NAME = "TradeOffData";

export function useGameData() {
  const [candles, setCandles] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    let interval;

    async function fetchUpdates() {
      try {
        // Fetch latest candles
        const candleRes = await ddb.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "EntityType = :etype",
            ExpressionAttributeValues: { ":etype": "OHLCV" },
            ScanIndexForward: false, // newest first
            Limit: 20,
          })
        );

        // Fetch latest news
        const newsRes = await ddb.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "EntityType = :etype",
            ExpressionAttributeValues: { ":etype": "News" },
            ScanIndexForward: false,
            Limit: 10,
          })
        );

        if (candleRes.Items) setCandles(candleRes.Items.reverse());
        if (newsRes.Items) setNews(newsRes.Items.reverse());
      } catch (err) {
        console.error("Error fetching updates:", err);
      }
    }

    // Poll every 333ms
    interval = setInterval(fetchUpdates, 333);

    return () => clearInterval(interval);
  }, []);

  return { candles, news };
}
