import mysql from "mysql2/promise";
import { Cita } from "../../domain/entities/Cita";
import AWS from "aws-sdk";

const eventBridge = new AWS.EventBridge();


export class CitaRepositoryMysql {
    private connection: mysql.Connection;

    constructor() {
        this.initDBConnection();
    }

    private async initDBConnection() {
        this.connection = await mysql.createConnection({
            host: "database-rimac.cry4isg20rje.us-east-2.rds.amazonaws.com", // Cambia esto por tu host de MySQL
            user: "admin", // Usuario de la base de datos
            password: "Lomejordetodo951*", // Contraseña de la base de datos
            database: "rimacdb", // Nombre de la base de datos
        });
    }

    async guardarCita(cita: Cita): Promise<void> {
        const query = `
            INSERT INTO citas (insuredId, scheduleId, countryISO, statusReg)
            VALUES (?, ?, ?, ?)
        `;
        const values = [cita.insuredId, cita.scheduleId, cita.countryISO, cita.statusReg];
        await this.connection.execute(query, values);        
    }

    async actualizarCita(cita: Cita): Promise<void> {
        const query = `
            UPDATE citas
            SET statusReg = ?
            WHERE insuredId = ? AND scheduleId = ?
        `;
        const values = [cita.statusReg, cita.insuredId, cita.scheduleId];
        await this.connection.execute(query, values);
    }
    
}