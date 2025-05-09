
import AWS from "aws-sdk";
import { Cita } from "../entities/Cita";
const sns = new AWS.SNS({ region: "us-east-2" });


export const publicarMensaje = async (cita: Cita) => {
    console.log("Iniciando publicarMensaje ==>", cita);
    // 
    
    const topicArn = `arn:aws:sns:us-east-2:196900111372:citaPE`;        
    const snsParams = {
        TopicArn: topicArn,
        Message: JSON.stringify(cita),
        Subject: `Nueva Cita: ${cita.insuredId}`,
    };    
    await sns.publish(snsParams).promise();
}

