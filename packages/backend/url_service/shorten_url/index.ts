import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { defaultHeaders, errorHandler } from "../_shared/errors";
import { shortenedUrl } from "./shorten_url";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const shortUrl = await shortenedUrl(event);

    return {
      body: shortUrl,
      statusCode: 200,
      headers: defaultHeaders,
    };
  } catch (error) {
    console.log(event);
    return errorHandler(error);
  }
};
