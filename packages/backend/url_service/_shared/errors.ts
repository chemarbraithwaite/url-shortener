import { APIGatewayProxyResult } from "aws-lambda";

export const defaultHeaders = {
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with",
  "Access-Control-Allow-Origin": process.env.CORS_ORIGINS ?? "",
};

export enum StatusCode {
  redirect = 302,
  notFound = 404,
  badRequest = 400,
  internalServerError = 500,
}

export class RequestError extends Error {
  statusCode: number;
  headers: any;

  constructor(statusCode: StatusCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.headers = defaultHeaders;
  }
}

export const errorHandler = (error: any): APIGatewayProxyResult => {
  console.log(error);

  if (error instanceof RequestError) {
    return {
      statusCode: error.statusCode,
      body: error.message,
      headers: error.headers,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: StatusCode.internalServerError,
      body: error.message,
      headers: defaultHeaders,
    };
  }

  return {
    statusCode: StatusCode.internalServerError,
    body: "Internal server error",
    headers: defaultHeaders,
  };
};
