import AWS from "aws-sdk";
import { Cita } from "../../domain/entities/Cita";
import dynamoDb from "../config/dynamo";


// const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Appointments";
const sns = new AWS.SNS({ region: "us-east-2" });

export class CitaRepository {
    async crear(cita: Cita): Promise<Cita> {

        const params = {
            TableName: TABLE_NAME,
            Item: cita,
        };
        await dynamoDb.put(params).promise();

        const topicArn = `arn:aws:sns:us-east-2:196900111372:citaPE`;

        const snsParams = {
            TopicArn: topicArn,
            Message: JSON.stringify(cita),
            Subject: `Nueva Cita: ${cita.insuredId}`,
        };

        await sns.publish(snsParams).promise();

        return cita;

    }

    async obtenerPorId(id: string): Promise<Cita | undefined> {
        const params = {
            TableName: TABLE_NAME,
            Key: { insuredId: id },
        };                
        const result = await dynamoDb.get(params).promise();        
        return result.Item as Cita | undefined;
    }

    async actualizar(cita: Cita): Promise<Cita> {
        const params = {
            TableName: TABLE_NAME,
            Key: { insuredId: cita.insuredId },
            UpdateExpression: "set #status = :status",
            ExpressionAttributeNames: {
                "#status": "statusReg",
            },
            ExpressionAttributeValues: {
                ":status": cita.statusReg,
            },
            ReturnValues: "ALL_NEW",
        };
        const result = await dynamoDb.update(params).promise();
        return result.Attributes as Cita;
    }

}
