import { APIGatewayEvent } from "aws-lambda";
import { getDbClient, getTableName } from "../_shared/configs";
import { RequestError, StatusCode } from "../_shared/errors";
import { getShortUrl, isValidUrl } from "./helpers";
const CONDITION_CHECK_FIALED = "ConditionalCheckFailedException";

const docClient = getDbClient();

export const shortenedUrl: (event: APIGatewayEvent) => Promise<string> = async (
  event: APIGatewayEvent
) => {
  const tableName = getTableName();

  if (!tableName) {
    console.log("Environment variable 'Table Name' is undefined");
    throw new Error("Internal server error");
  }

  const longUrl = getLongUrl(event);
  let isUrlUnique = false;
  let url: string = "";

  const isUrlValid = await isValidUrl(longUrl);

  if (!isUrlValid) {
    throw new RequestError(
      StatusCode.badRequest,
      "Invalid url",
      event?.headers?.Referer ?? ""
    );
  }

  // Keep generating short urls until we find one that is unique
  while (!isUrlUnique) {
    url = getShortUrl();

    try {
      await docClient.put({
        TableName: tableName,
        Item: {
          url: url,
          longUrl: longUrl,
          expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
        },
        ConditionExpression: "attribute_not_exists(#url)",
        ExpressionAttributeNames: {
          "#url": "url",
        },
      });
      isUrlUnique = true;
    } catch (error) {
      if ((error as any)?.name !== CONDITION_CHECK_FIALED) {
        throw error;
      }
    }
  }

  return url;
};

const getLongUrl = (event: APIGatewayEvent) => {
  if (!event.body) {
    throw new RequestError(
      StatusCode.badRequest,
      "Invalid request body",
      event?.headers?.Referer ?? ""
    );
  }

  const requestBody = JSON.parse(event.body);

  if (!requestBody.url) {
    throw new RequestError(
      StatusCode.badRequest,
      "Invalid request body",
      event?.headers?.Referer ?? ""
    );
  }

  return requestBody.url;
};
