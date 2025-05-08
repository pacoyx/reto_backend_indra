import AWS from "aws-sdk";
import { Cliente } from "../../domain/entities/Cliente";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "Clientes";
const sns = new AWS.SNS();



export class ClienteRepository {

    async crear(cliente: Cliente): Promise<Cliente> {
        const params = {
            TableName: TABLE_NAME,
            Item: cliente,
        };
        await dynamoDb.put(params).promise();

        // 📌 Publicar en SNS según el país del cliente
        // const topicArn = `arn:aws:sns:us-east-1:123456789012:clientes-${cliente.pais.toLowerCase()}`;
        const topicArn = `arn:aws:sns:us-east-1:123456789012:clientes-PE`;

        const snsParams = {
            TopicArn: topicArn,
            Message: JSON.stringify(cliente),
            Subject: `Nuevo Cliente: ${cliente.nombre}`,
        };

        await sns.publish(snsParams).promise();

        return cliente;
    }

    async obtenerPorId(id: string): Promise<Cliente | undefined> {
        const params = {
            TableName: TABLE_NAME,
            Key: { id },
        };
        const result = await dynamoDb.get(params).promise();
        return result.Item as Cliente | undefined;
    }

    async actualizar(id: string, data: Partial<Cliente>): Promise<Cliente | undefined> {
        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set nombre = :nombre, email = :email, edad = :edad",
            ExpressionAttributeValues: {
                ":nombre": data.nombre,
                ":email": data.email,
                ":edad": data.edad,
            },
            ReturnValues: "ALL_NEW",
        };
        const result = await dynamoDb.update(params).promise();
        return result.Attributes as Cliente | undefined;
    }

    async eliminar(id: string): Promise<boolean> {
        const params = {
            TableName: TABLE_NAME,
            Key: { id },
        };
        await dynamoDb.delete(params).promise();
        return true;
    }
}