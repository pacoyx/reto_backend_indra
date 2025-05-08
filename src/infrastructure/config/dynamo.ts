import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "us-east-2",  // 📌 Región donde está tu tabla en AWS
});

export default dynamoDb;