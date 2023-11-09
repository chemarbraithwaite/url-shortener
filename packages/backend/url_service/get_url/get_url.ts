import { APIGatewayEvent } from "aws-lambda";
import { RequestError, StatusCode } from "../_shared/errors";
import { dbConfig, getDbClient } from "../_shared/configs";

const docClient = getDbClient();

export const getUrl: (event: APIGatewayEvent) => Promise<string> = async (
  event: APIGatewayEvent
) => {
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    console.log("Environment variable 'Table Name' is undefined");
    throw new Error("Internal server error");
  }

  validateEvent(event);

  const shortUrl = event.pathParameters!.shortUrl!;

  const longUrl = await getLongUrl(tableName, shortUrl);
  return longUrl;
};

const validateEvent = (event: APIGatewayEvent): void => {
  if (!event.pathParameters || !event.pathParameters.shortUrl) {
    throw new RequestError(StatusCode.badRequest, "Invalid url");
  }
};

const getLongUrl = async (tableName: string, shortUrl: string) => {
  const response = await docClient.get({
    TableName: tableName,
    Key: {
      url: shortUrl,
    },
  });

  if (!response.Item || !response.Item.longUrl) {
    throw new RequestError(StatusCode.notFound, "Cannot find matching URL");
  }

  return response.Item.longUrl;
};
