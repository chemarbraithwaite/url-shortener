import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  StatusCode,
  getHeaders,
  errorHandler,
  getOrigin,
} from "../_shared/errors";
import { getUrl } from "./get_url";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const origin = getOrigin(event);

  try {
    const longUrl = await getUrl(event);

    return {
      body: "",
      statusCode: StatusCode.redirect,
      headers: {
        ...getHeaders(origin),
        Location: longUrl,
      },
    };
  } catch (error) {
    console.log(event);
    return errorHandler(error, origin);
  }
};
