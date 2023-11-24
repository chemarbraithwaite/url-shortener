import { shortenedUrl } from "./shorten_url";
import { getShortUrl, isValidUrl } from "./helpers";
import { getDbClient } from "../_shared/configs";

const shortUrl = "anyShortUrl";

jest.mock("./helpers", () => {
  return {
    getShortUrl: jest.fn(() => shortUrl),
    isValidUrl: jest.fn(() => true),
  };
});

describe("Shorten URL", () => {
  const OLD_ENV = process.env;
  let event: any;
  const longUrl = "anyLongUrl";
  const TABLE_NAME = "Urls";

  beforeEach(() => {
    jest.resetModules();
    event = {
      body: JSON.stringify({
        url: longUrl,
      }),
    };

    process.env = {
      ...OLD_ENV,
      TABLE_NAME: TABLE_NAME,
    };

    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("Throws if table name is not set in environment variables", async () => {
    delete process.env.TABLE_NAME;
    await expect(shortenedUrl(event)).rejects.toThrow("Internal server error");
  });

  it("Throws if request body is undefined", async () => {
    delete event.body;
    await expect(shortenedUrl(event)).rejects.toThrow("Invalid request body");
  });

  it("Throws if request body does not have url", async () => {
    event.body = JSON.stringify({
      field: "all non-matching field(s)",
    });

    await expect(shortenedUrl(event)).rejects.toThrow("Invalid request body");
  });

  it("Throws if url is invalid", async () => {
    (isValidUrl as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve(false)
    );

    await expect(shortenedUrl(event)).rejects.toThrow("Invalid url");
  });

  it("Returns shortened url", async () => {
    const returnedUrl = await shortenedUrl(event);
    expect(returnedUrl).toEqual(shortUrl);
  });

  it("Handles collision for shortened url", async () => {
    const collidingUrl = shortUrl;
    const nonCollidingUrl = "any non colliding url";

    (getShortUrl as jest.Mock)
      .mockReturnValueOnce(collidingUrl)
      .mockReturnValueOnce(nonCollidingUrl);
    const docClient = getDbClient();
    await docClient.put({
      TableName: TABLE_NAME,
      Item: {
        url: collidingUrl,
        longUrl: longUrl,
      },
      ConditionExpression: "attribute_not_exists(#url)",
      ExpressionAttributeNames: {
        "#url": "url",
      },
    });

    const returnedUrl = await shortenedUrl(event);
    expect(returnedUrl).toEqual(nonCollidingUrl);
    expect(getShortUrl).toHaveBeenCalledTimes(2);

    docClient.destroy();
  });

  it("Saves shortened url in db", async () => {
    await shortenedUrl(event);

    const docClient = getDbClient();

    const response = await docClient.get({
      TableName: TABLE_NAME,
      Key: {
        url: shortUrl,
      },
    });

    expect(response.Item).toEqual({
      url: shortUrl,
      longUrl,
      expiresAt: expect.any(Number),
    });

    docClient.destroy();
  });
});
