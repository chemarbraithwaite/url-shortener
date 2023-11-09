import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCode, defaultHeaders, errorHandler } from "../_shared/errors";
import { getUrl } from "./get_url";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const shortenedUrl = await getUrl(event);

    return {
      body: "",
      statusCode: StatusCode.redirect,
      headers: {
        ...defaultHeaders,
        Location: shortenedUrl,
      },
    };
  } catch (error) {
    console.log(event);
    return errorHandler(error);
  }
};
