import { randomBytes } from "crypto";
import { PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDocClient } from "@/lib/aws";

const TABLE = () => process.env.DYNAMODB_TABLE_NAME!;
const TTL_SECONDS = 15 * 60;

export async function createMagicToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;

  await getDynamoDocClient().send(
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
  const result = await getDynamoDocClient().send(
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
  await getDynamoDocClient().send(
    new DeleteCommand({
      TableName: TABLE(),
      Key: { PK: `MAGIC#${token}`, SK: "VERIFY" },
    })
  );

  return true;
}
