import AWS from "aws-sdk";

import { Cita } from "../domain/entities/Cita";
import { CitaRepository } from "../infrastructure/adapters/CitaRepositoryDynamo";
import { CitaService } from "../domain/services/CitaService";
import { CitaRepositoryMysql } from "../infrastructure/adapters/CitaRepositoryMysql";
import { CitaUseCase } from "../application/use-cases/CitaUseCase";
const citaRepo = new CitaRepository();
const citaService = new CitaService();
const citaRepoMysql = new CitaRepositoryMysql();
const citaUseCase = new CitaUseCase(citaRepo, citaService, citaRepoMysql);

const sqs = new AWS.SQS();
const QUEUE_URL = "https://sqs.us-east-2.amazonaws.com/196900111372/SQS_PE";

const recibirMensajes = async () => {
    console.log("📥 recibirMensajes() se está ejecutando...");
    const params = { QueueUrl: QUEUE_URL, MaxNumberOfMessages: 5 };
    const response = await sqs.receiveMessage(params).promise();

    response.Messages?.map(async m => {
        let msg =  JSON.parse(m.Body!)
        let cita =  JSON.parse(msg.Message) as Cita;
        let nuevaCita = new Cita(cita.insuredId, cita.scheduleId, cita.countryISO, cita.statusReg);
        await citaUseCase.guardarCitaMysql(nuevaCita);
    });

    console.log('mensages[] => ',response.Messages || []);
};


export default recibirMensajes;
