import { APIGatewayEvent } from "aws-lambda";
import { RequestError, StatusCode } from "../_shared/errors";
import { dbConfig, getDbClient, getTableName } from "../_shared/configs";

const docClient = getDbClient();

export const getUrl: (event: APIGatewayEvent) => Promise<string> = async (
  event: APIGatewayEvent
) => {
  const tableName = getTableName();

  if (!tableName) {
    console.log("Environment variable 'Table Name' is undefined");
    throw new Error("Internal server error");
  }

  if (!event.pathParameters || !event.pathParameters.shortUrl) {
    throw new RequestError(
      StatusCode.badRequest,
      "Invalid url",
      event?.headers?.Referer ?? ""
    );
  }

  const shortUrl = event.pathParameters.shortUrl;

  const response = await docClient.get({
    TableName: tableName,
    Key: {
      url: shortUrl,
    },
  });

  if (!response.Item || !response.Item.longUrl) {
    return `${event.headers.Referer}404/${shortUrl}`;
  }

  return response.Item.longUrl;
};
