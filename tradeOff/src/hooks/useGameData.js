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
        console.log('Fetching updates from DynamoDB...');

        // Fetch latest candles
        const candleRes = await ddb.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "EntityType = :etype",
            ExpressionAttributeValues: { ":etype": "OHLCV" },
            ScanIndexForward: false, // newest first
            Limit: 50,
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

        console.log('DynamoDB response - candles:', candleRes.Items?.length || 0, 'news:', newsRes.Items?.length || 0);
        
        if (candleRes.Items) {
          console.log('Sample candle from DynamoDB:', candleRes.Items[0]);
          setCandles(candleRes.Items.reverse());
        }
        if (newsRes.Items) setNews(newsRes.Items);
      } catch (err) {
        console.error("Error fetching updates:", err);
        console.error("Error details:", err.message);
      }
    }

    // Poll every 333ms
    interval = setInterval(fetchUpdates, 333);

    return () => clearInterval(interval);
  }, []);

  return { candles, news };
}
