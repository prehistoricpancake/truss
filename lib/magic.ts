import { randomBytes } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

let _client: DynamoDBDocumentClient | null = null;
function getClient() {
  if (!_client) {
    _client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
  }
  return _client;
}

const TABLE = () => process.env.DYNAMODB_TABLE_NAME!;
const TTL_SECONDS = 15 * 60; // 15 minutes

export async function createMagicToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;

  await getClient().send(
    new PutCommand({
      TableName: TABLE(),
      Item: {
        PK: `MAGIC#${token}`,
        SK: "VERIFY",
        email,
        expiresAt,
        ttl: expiresAt,
      },
    })
  );

  return token;
}

export async function verifyMagicToken(email: string, token: string): Promise<boolean> {
  const result = await getClient().send(
    new GetCommand({
      TableName: TABLE(),
      Key: { PK: `MAGIC#${token}`, SK: "VERIFY" },
    })
  );

  const item = result.Item;
  if (!item) return false;
  if (item.email !== email) return false;
  if (item.expiresAt < Math.floor(Date.now() / 1000)) return false;

  // One-time use — delete immediately
  await getClient().send(
    new DeleteCommand({
      TableName: TABLE(),
      Key: { PK: `MAGIC#${token}`, SK: "VERIFY" },
    })
  );

  return true;
}
