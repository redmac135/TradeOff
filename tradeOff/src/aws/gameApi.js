import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../aws/dynamoClient";

const TABLE_NAME = "TradeOffData";

// Get game state
export async function getGameState() {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { EntityType: "Status", EntityID: "Current" }, // assuming your schema uses pk/sk
    })
  );
  return res.Item?.is_running || false;
}

// Start the game (set is_running = true)
export async function startGame() {
  console.log("Starting game...");
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        EntityType: "Status",
        EntityID: "Current",
        is_running: true,
      },
    })
  );
}

// Stop the game (set is_running = false)
export async function stopGame() {
  console.log("Stopping game...");
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        EntityType: "Status",
        EntityID: "Current",
        is_running: false,
      },
    })
  );
}