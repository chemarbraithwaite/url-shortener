import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const getHeaders = (origin: string) => ({
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with",
  "Access-Control-Allow-Origin": process.env.CORS_ORIGINS?.split(",")?.includes(
    origin
  )
    ? origin
    : "",
});

export const getOrigin = (event: APIGatewayEvent) =>
  event?.headers?.origin || event?.headers?.Origin || "";

export enum StatusCode {
  redirect = 302,
  notFound = 404,
  badRequest = 400,
  internalServerError = 500,
}

export class RequestError extends Error {
  statusCode: number;
  headers: any;

  constructor(statusCode: StatusCode, message: string, origin: string) {
    super(message);
    this.statusCode = statusCode;
    this.headers = getHeaders(origin);
  }
}

export const errorHandler = (
  error: any,
  origin: string
): APIGatewayProxyResult => {
  console.log(error);

  if (error instanceof RequestError) {
    return {
      statusCode: error.statusCode,
      body: error.message,
      headers: error.headers,
    };
  }

  const headers = getHeaders(origin);

  if (error instanceof Error) {
    return {
      statusCode: StatusCode.internalServerError,
      body: error.message,
      headers,
    };
  }

  return {
    statusCode: StatusCode.internalServerError,
    body: "Internal server error",
    headers,
  };
};
