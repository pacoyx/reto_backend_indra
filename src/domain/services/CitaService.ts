import { Cita } from "../entities/Cita";

export class CitaService {
    validarCita(cita: Cita): boolean {
        if (!cita.insuredId) {
            throw new Error("ID de asegurado inválido");
        }
        if (!cita.scheduleId) {
            throw new Error("ID de horario inválido");
        }
        if (!cita.countryISO) {
            throw new Error("Código de país inválido");
        }
        return true;
    }
}