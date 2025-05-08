import { ClienteRepository } from "../../src/infrastructure/adapters/ClienteRepository";
import { Cliente } from "../../src/domain/entities/Cliente";

describe("ClienteRepository", () => {
    let clienteRepo: ClienteRepository;

    beforeEach(() => {
        clienteRepo = new ClienteRepository();
    });

    it("Debe almacenar y recuperar un cliente", () => {
        const cliente = new Cliente("1", "Carlos", "carlos@example.com", 30);
        clienteRepo.crear(cliente);
        expect(clienteRepo.obtenerPorId("1")).toEqual(cliente);
    });

    it("Debe actualizar un cliente correctamente", () => {
        const cliente = new Cliente("2", "Ana", "ana@example.com", 25);
        clienteRepo.crear(cliente);
        clienteRepo.actualizar("2", { edad: 26 });
        expect(clienteRepo.obtenerPorId("2")?.edad).toBe(26);
    });

    it("Debe eliminar un cliente correctamente", () => {
        const cliente = new Cliente("3", "Luis", "luis@example.com", 40);
        clienteRepo.crear(cliente);
        expect(clienteRepo.eliminar("3")).toBe(true);
        expect(clienteRepo.obtenerPorId("3")).toBeUndefined();
    });

    it("Debe retornar undefined si el cliente no existe", () => {
        expect(clienteRepo.obtenerPorId("999")).toBeUndefined();
    });
});