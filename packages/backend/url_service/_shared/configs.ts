import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

export const dbConfig = {
  convertEmptyValues: true,
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  }),
  ...(process.env.AWS_SAM_LOCAL && {
    endpoint: "http://172.16.123.1:8000",
    sslEnabled: false,
    region: "localhost",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  }),
};

export const getDbClient = () => {
  const client = new DynamoDB(dbConfig);
  return DynamoDBDocument.from(client, {
    marshallOptions: {
      convertEmptyValues: true,
    },
  });
};

export const getTableName = () => {
  return process.env.AWS_SAM_LOCAL ? "Urls" : process.env.TABLE_NAME;
};
