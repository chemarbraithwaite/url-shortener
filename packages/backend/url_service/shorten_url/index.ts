import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { getHeaders, errorHandler, getOrigin } from "../_shared/errors";
import { shortenedUrl } from "./shorten_url";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const origin = getOrigin(event);
  try {
    const shortUrl = await shortenedUrl(event);

    return {
      body: shortUrl,
      statusCode: 200,
      headers: getHeaders(origin),
    };
  } catch (error) {
    console.log(event);
    return errorHandler(error, origin);
  }
};
