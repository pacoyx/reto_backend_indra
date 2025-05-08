import { ClienteService } from "../../src/domain/services/ClienteService";
import { Cliente } from "../../src/domain/entities/Cliente";

describe("ClienteService", () => {
    let clienteService: ClienteService;

    beforeEach(() => {
        clienteService = new ClienteService();
    });

    it("Debe validar correctamente un cliente con datos válidos", () => {
        const cliente = new Cliente("1", "Carlos", "carlos@example.com", 30);
        expect(clienteService.validarCliente(cliente)).toBe(true);
    });

    it("Debe lanzar error si el email es inválido", () => {
        const cliente = new Cliente("2", "Ana", "anaexample.com", 25);
        expect(() => clienteService.validarCliente(cliente)).toThrow("Correo inválido");
    });

    it("Debe lanzar error si el cliente es menor de edad", () => {
        const cliente = new Cliente("3", "Luis", "luis@example.com", 17);
        expect(() => clienteService.validarCliente(cliente)).toThrow("El cliente debe ser mayor de edad");
    });
});