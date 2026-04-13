const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Create base client
const client = new DynamoDBClient({
  region: "ap-south-1"
});

// Convert to DocumentClient (like v2)
const dynamoDB = DynamoDBDocumentClient.from(client);

module.exports = dynamoDB;