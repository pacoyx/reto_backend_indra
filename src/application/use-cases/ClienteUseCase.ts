import { Cliente } from "../../domain/entities/Cliente";
import { ClienteService } from "../../domain/services/ClienteService";
import { ClienteRepository } from "../../infrastructure/adapters/ClienteRepository";

export class ClienteUseCase {
    constructor(private clienteRepo: ClienteRepository, private clienteService: ClienteService) {}

    async crearCliente(cliente: Cliente): Promise<Cliente> {
        this.clienteService.validarCliente(cliente);  // ✅ Validación antes de guardar
        return await this.clienteRepo.crear(cliente);
    }

    async obtenerCliente(id: string): Promise<Cliente | undefined> {
        return await this.clienteRepo.obtenerPorId(id);
    }

    async actualizarCliente(id: string, data: Partial<Cliente>): Promise<Cliente | undefined> {
        const clienteExistente = await this.clienteRepo.obtenerPorId(id);
        if (!clienteExistente) throw new Error("Cliente no encontrado");

        const clienteActualizado = { ...clienteExistente, ...data };
        this.clienteService.validarCliente(clienteActualizado);  // ✅ Validación antes de actualizar

        return await this.clienteRepo.actualizar(id, data);
    }

    async eliminarCliente(id: string): Promise<boolean> {
        return await this.clienteRepo.eliminar(id);
    }
}