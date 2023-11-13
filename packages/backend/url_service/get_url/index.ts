import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatusCode, getHeader, errorHandler } from "../_shared/errors";
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
        ...getHeader(event?.headers?.origin || event?.headers?.Origin || ""),
        Location: longUrl,
      },
    };
  } catch (error) {
    console.log(event);
    return errorHandler(
      error,
      event?.headers?.origin || event?.headers?.Origin || ""
    );
  }
};
