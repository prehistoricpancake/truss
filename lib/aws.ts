import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { STSClient, AssumeRoleWithWebIdentityCommand } from "@aws-sdk/client-sts";

type CachedCreds = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiry: number;
};

let _cachedCreds: CachedCreds | null = null;

function buildCredentialProvider() {
  const webIdentityToken = process.env.AWS_WEB_IDENTITY_TOKEN;
  const roleArn = process.env.AWS_ROLE_ARN;
  if (!webIdentityToken || !roleArn) return undefined;

  return async (): Promise<CachedCreds> => {
    const now = Date.now();
    if (_cachedCreds && _cachedCreds.expiry > now + 60_000) return _cachedCreds;

    const sts = new STSClient({ region: process.env.AWS_REGION });
    const res = await sts.send(
      new AssumeRoleWithWebIdentityCommand({
        RoleArn: roleArn,
        RoleSessionName: "truss-session",
        WebIdentityToken: webIdentityToken,
      })
    );

    if (!res.Credentials) throw new Error("STS AssumeRoleWithWebIdentity returned no credentials");

    _cachedCreds = {
      accessKeyId: res.Credentials.AccessKeyId!,
      secretAccessKey: res.Credentials.SecretAccessKey!,
      sessionToken: res.Credentials.SessionToken!,
      expiry: res.Credentials.Expiration?.getTime() ?? now + 3_600_000,
    };
    return _cachedCreds;
  };
}

const credentialProvider = buildCredentialProvider();

const sharedConfig = () => ({
  region: process.env.AWS_REGION,
  ...(credentialProvider ? { credentials: credentialProvider } : {}),
});

let _docClient: DynamoDBDocumentClient | null = null;

export function getDynamoDocClient(): DynamoDBDocumentClient {
  if (!_docClient) {
    _docClient = DynamoDBDocumentClient.from(new DynamoDBClient(sharedConfig()));
  }
  return _docClient;
}

export function getS3Client(): S3Client {
  return new S3Client(sharedConfig());
}
