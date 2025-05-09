import { Cita } from "../../domain/entities/Cita";
import dynamoDb from "../config/dynamo";


const TABLE_NAME = "Appointments";

export class CitaRepository {
    async crear(cita: Cita): Promise<Cita> {

        const params = {
            TableName: TABLE_NAME,
            Item: cita,
        };
        await dynamoDb.put(params).promise();

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
