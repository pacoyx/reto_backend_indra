import express from "express";
import serverless from "serverless-http";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { APIGatewayEvent, SQSEvent } from "aws-lambda";
import { Cita } from "../domain/entities/Cita";
import { CitaUseCase } from "../application/use-cases/CitaUseCase";
import { CitaRepository } from "../infrastructure/adapters/CitaRepositoryDynamo";
import { CitaService } from "../domain/services/CitaService";
import { CitaRepositoryMysql } from "../infrastructure/adapters/CitaRepositoryMysql";



const app = express();
app.use(express.json());

const citaRepo = new CitaRepository();
const citaService = new CitaService();
const citaRepoMysql = new CitaRepositoryMysql();
const citaUseCase = new CitaUseCase(citaRepo, citaService, citaRepoMysql);

// 📌 Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Clientes",
            version: "1.0.0",
            description: "Documentación de API en AWS Lambda usando Express",
        },
    },
    apis: ["./src/lambda/handler.ts"], // Archivo donde están los endpoints
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /citas:
 *   post:
 *     summary: Crear una nueva cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               insuredId:
 *                 type: string
 *               scheduleId:
 *                 type: string
 *               countryISO:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 */
app.post("/citas", async (req, res) => {
    const bodyString = req.body.toString("utf8");
    const jsonData = JSON.parse(bodyString);
    const citaData = jsonData;
    const nuevaCita = new Cita(citaData.insuredId, citaData.scheduleId, citaData.countryISO, 'pending');
    res.status(201).json(await citaUseCase.crearCita(nuevaCita));
});


/**
 * @swagger
 * /citas/{id}:
 *   get:
 *     summary: Obtener una cita por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cita encontrada
 *       404:
 *         description: Cita no encontrada
 */
app.get("/citas/:id", async (req, res) => {
    const { id } = req.params;
    const cita = await citaUseCase.obtenerCita(id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });
    res.json(cita);
});

/**
 * @swagger
 * confirmarCita/{id}:
 *   post:
 *     summary: Confirmar una cita por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *          type: string
 *     responses:
 *      201:
 *        description: Cita confirmada
 *      404:
 *       description: Cita no encontrada
 *      500:
 *       description: Error interno del servidor
 *  
 */
app.post("/confirmarCita/:id", async (req, res) => {
    const { id } = req.params;
    await citaUseCase.confirmarCita(id);
    res.status(201).json({ status: "Cita confirmada" });
});


export const handler = async (event: APIGatewayEvent | SQSEvent) => {

    if ((event as APIGatewayEvent).httpMethod) {
        return serverless(app)(event as APIGatewayEvent, {} as any);
    }

    if ((event as SQSEvent).Records) {
        for (const record of (event as SQSEvent).Records) {

            const queueArn = record.eventSourceARN;            
            if (queueArn.toLowerCase().includes("sqs_confirmados")) {                
                const cita = JSON.parse(record.body);
                await citaUseCase.actualizarCitaDynamo(cita.insuredId);
            } else {
                const msgBody = JSON.parse(record.body);
                let cita = JSON.parse(msgBody.Message) as Cita;
                console.log("cita ==>", cita);
                
                let nuevaCita = new Cita(cita.insuredId, cita.scheduleId, cita.countryISO, cita.statusReg);
                await citaUseCase.guardarCitaMysql(nuevaCita);
            }
        }
    }

    return { statusCode: 200, body: "Procesado exitosamente" };
};