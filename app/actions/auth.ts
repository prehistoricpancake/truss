"use server";

import { createHmac } from "crypto";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!;

function computeSecretHash(username: string): string {
  return createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

export async function cognitoSignUp(email: string, password: string) {
  try {
    const result = await client.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        SecretHash: computeSecretHash(email),
        Username: email,
        Password: password,
        UserAttributes: [{ Name: "email", Value: email }],
      })
    );
    return { success: true, userSub: result.UserSub };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return { success: false, error: message };
  }
}

export async function cognitoConfirmSignUp(email: string, code: string) {
  try {
    await client.send(
      new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        SecretHash: computeSecretHash(email),
        Username: email,
        ConfirmationCode: code,
      })
    );
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return { success: false, error: message };
  }
}

export async function cognitoSignIn(email: string, password: string) {
  try {
    const result = await client.send(
      new InitiateAuthCommand({
        ClientId: CLIENT_ID,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: computeSecretHash(email),
        },
      })
    );
    return {
      success: true,
      idToken: result.AuthenticationResult?.IdToken,
      accessToken: result.AuthenticationResult?.AccessToken,
      refreshToken: result.AuthenticationResult?.RefreshToken,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sign in failed";
    return { success: false, error: message };
  }
}

export async function cognitoResendCode(email: string) {
  try {
    await client.send(
      new ResendConfirmationCodeCommand({
        ClientId: CLIENT_ID,
        SecretHash: computeSecretHash(email),
        Username: email,
      })
    );
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resend code";
    return { success: false, error: message };
  }
}

export async function cognitoForgotPassword(email: string) {
  try {
    await client.send(
      new ForgotPasswordCommand({
        ClientId: CLIENT_ID,
        SecretHash: computeSecretHash(email),
        Username: email,
      })
    );
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initiate password reset";
    return { success: false, error: message };
  }
}
