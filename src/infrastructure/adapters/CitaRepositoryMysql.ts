import mysql from "mysql2/promise";
import { Cita } from "../../domain/entities/Cita";
import pool from "../config/database";


export class CitaRepositoryMysql {
    private connection: mysql.Connection;

    constructor() {
    
    }

    async guardarCita(cita: Cita): Promise<void> {
        const connection = await pool.getConnection();
        const query = `
            INSERT INTO citas (insuredId, scheduleId, countryISO, statusReg)
            VALUES (?, ?, ?, ?)
        `;
        const values = [cita.insuredId, cita.scheduleId, cita.countryISO, cita.statusReg];
        await connection.execute(query, values);        
    }

    async actualizarCita(cita: Cita): Promise<void> {
        const connection = await pool.getConnection();
        const query = `
            UPDATE citas
            SET statusReg = ?
            WHERE insuredId = ? AND scheduleId = ?
        `;
        const values = [cita.statusReg, cita.insuredId, cita.scheduleId];
        await connection.execute(query, values);
    }
    
}