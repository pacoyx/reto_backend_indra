import { Cliente } from "../entities/Cliente";

export class ClienteService {
    validarCliente(cliente: Cliente): boolean {
        if (!cliente.email.includes("@")) {
            throw new Error("Correo inválido");
        }
        if (cliente.edad < 18) {
            throw new Error("El cliente debe ser mayor de edad");
        }
        return true;
    }

}