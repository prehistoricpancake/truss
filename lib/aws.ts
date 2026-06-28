import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// OIDC-based credential provider for Vercel deployments
// Falls back to default credential chain for local development
async function getOIDCCredentials() {
  const webIdentityToken = process.env.AWS_WEB_IDENTITY_TOKEN;
  const roleArn = process.env.AWS_ROLE_ARN;

  if (!webIdentityToken || !roleArn) {
    // Local dev: use default credential chain (AWS CLI profile, env vars, etc.)
    return undefined;
  }

  const sts = new STSClient({ region: process.env.AWS_REGION });
  const command = new AssumeRoleWithWebIdentityCommand({
    RoleArn: roleArn,
    RoleSessionName: "truss-session",
    WebIdentityToken: webIdentityToken,
  });

  const response = await command.input ? await sts.send(command) : undefined;

  if (!response?.Credentials) {
    throw new Error("Failed to assume role via OIDC");
  }

  return {
    accessKeyId: response.Credentials.AccessKeyId!,
    secretAccessKey: response.Credentials.SecretAccessKey!,
    sessionToken: response.Credentials.SessionToken!,
  };
}

export async function getS3Client() {
  const credentials = await getOIDCCredentials();
  return new S3Client({
    region: process.env.AWS_REGION,
    ...(credentials ? { credentials } : {}),
  });
}

export async function getDynamoClient() {
  const credentials = await getOIDCCredentials();
  return new DynamoDBClient({
    region: process.env.AWS_REGION,
    ...(credentials ? { credentials } : {}),
  });
}
