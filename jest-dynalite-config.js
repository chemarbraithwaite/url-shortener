module.exports = {
  tables: [
    {
      TableName: `Urls`,
      KeySchema: [{ AttributeName: "url", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "url", AttributeType: "S" }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
  ],
  basePort: 8002,
};
