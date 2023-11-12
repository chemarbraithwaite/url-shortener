import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCode, defaultHeaders, errorHandler } from "../_shared/errors";
import { getUrl } from "./get_url";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const longUrl = await getUrl(event);

    return {
      body: "",
      statusCode: StatusCode.redirect,
      headers: {
        ...defaultHeaders,
        Location: longUrl,
      },
    };
  } catch (error) {
    console.log(event);
    return errorHandler(error);
  }
};
