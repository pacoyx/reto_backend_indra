import { Cita } from "../../domain/entities/Cita";
import { CitaService } from "../../domain/services/CitaService";
import { publicarEvento } from "../../domain/services/eventbridge";
import { publicarMensaje } from "../../domain/services/snsService";
import { CitaRepository } from "../../infrastructure/adapters/CitaRepositoryDynamo";
import { CitaRepositoryMysql } from "../../infrastructure/adapters/CitaRepositoryMysql";


export class CitaUseCase {
    constructor(
        private citaRepo: CitaRepository,
        private citaService: CitaService,
        private citaRepoMysql: CitaRepositoryMysql
    ) { }

    async crearCita(cita: Cita): Promise<Cita> {
        this.citaService.validarCita(cita);
        let resp = await this.citaRepo.crear(cita);
        await publicarMensaje(resp);
        return resp;
    }

    async obtenerCita(id: string): Promise<Cita | undefined> {
        return await this.citaRepo.obtenerPorId(id);
    }

    async guardarCitaMysql(cita: Cita): Promise<void> {
        await this.citaRepoMysql.guardarCita(cita);
    }

    async actualizarCitaDynamo(insuredId: string): Promise<void> {
        const citaExistente = await this.obtenerCita(insuredId);
        if (!citaExistente) {
            throw new Error("Cita no encontrada en DynamoDB");
        }

        citaExistente.statusReg = "confirmado"; // Actualiza el estado de la cita
        await this.citaRepo.actualizar(citaExistente);
    }

    async confirmarCita(id: string): Promise<Cita | undefined> {
        const cita = await this.citaRepo.obtenerPorId(id);
        if (!cita) {
            throw new Error("Cita no encontrada");
        }
        cita.statusReg = "confirmed";

        await publicarEvento(cita.insuredId);

        return cita;
    }
}
