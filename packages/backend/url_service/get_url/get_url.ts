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
    throw new RequestError(
      StatusCode.internalServerError,
      "Internal server error",
      event?.headers?.Origin ?? ""
    );
  }

  if (!event.pathParameters || !event.pathParameters.shortUrl) {
    throw new RequestError(
      StatusCode.badRequest,
      "Invalid url",
      event?.headers?.Origin ?? ""
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
    return `${event.headers.Origin}/404/${shortUrl}`;
  }

  return response.Item.longUrl;
};
