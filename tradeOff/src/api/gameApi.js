import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../aws/dynamoClient";

const TABLE_NAME = "TradeOffData";

// Get game state
export async function getGameState() {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { EntityType: "Status", EntityID: "Status" }, // assuming your schema uses pk/sk
    })
  );
  return res.Item?.is_running || false;
}

// Start the game (set is_running = true)
export async function startGame() {
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        EntityType: "Status",
        EntityID: "Status",
        is_running: true,
      },
    })
  );
}
