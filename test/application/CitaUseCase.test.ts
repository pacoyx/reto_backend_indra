import { CitaUseCase } from "../../src/application/use-cases/CitaUseCase";
import { Cita } from "../../src/domain/entities/Cita";
import { CitaRepository } from "../../src/infrastructure/adapters/CitaRepositoryDynamo";
import { CitaRepositoryMysql } from "../../src/infrastructure/adapters/CitaRepositoryMysql";
import { CitaService } from "../../src/domain/services/CitaService";
import { publicarEvento } from "../../src/domain/services/eventbridge";

jest.mock("../../src/infrastructure/adapters/CitaRepositoryDynamo");
jest.mock("../../src/infrastructure/adapters/CitaRepositoryMysql");
jest.mock("../../src/domain/services/CitaService");
jest.mock("../../src/domain/services/eventbridge");

describe("CitaUseCase", () => {
    let citaUseCase: CitaUseCase;
    let citaRepoMock: jest.Mocked<CitaRepository>;
    let citaRepoMysqlMock: jest.Mocked<CitaRepositoryMysql>;
    let citaServiceMock: jest.Mocked<CitaService>;

    beforeEach(() => {
        citaRepoMock = new CitaRepository() as jest.Mocked<CitaRepository>;
        citaRepoMysqlMock = new CitaRepositoryMysql() as jest.Mocked<CitaRepositoryMysql>;
        citaServiceMock = new CitaService() as jest.Mocked<CitaService>;
        citaUseCase = new CitaUseCase(citaRepoMock, citaServiceMock, citaRepoMysqlMock);
    });

    it("debería crear una nueva cita", async () => {
        const nuevaCita = new Cita("12345", 67890, "US", "pending");
        citaServiceMock.validarCita.mockImplementation(() => true);
        citaRepoMock.crear.mockResolvedValue(nuevaCita);

        const resultado = await citaUseCase.crearCita(nuevaCita);

        expect(citaServiceMock.validarCita).toHaveBeenCalledWith(nuevaCita);
        expect(citaRepoMock.crear).toHaveBeenCalledWith(nuevaCita);
        expect(resultado).toEqual(nuevaCita);
    });

    it("debería obtener una cita por ID", async () => {
        const citaExistente = new Cita("12345", 67890, "US", "confirmed");
        citaRepoMock.obtenerPorId.mockResolvedValue(citaExistente);

        const resultado = await citaUseCase.obtenerCita("12345");

        expect(citaRepoMock.obtenerPorId).toHaveBeenCalledWith("12345");
        expect(resultado).toEqual(citaExistente);
    });

    it("debería guardar una cita en MySQL", async () => {
        const cita = new Cita("12345", 67890, "US", "pending");

        await citaUseCase.guardarCitaMysql(cita);

        expect(citaRepoMysqlMock.guardarCita).toHaveBeenCalledWith(cita);
    });

    it("debería actualizar una cita en DynamoDB", async () => {
        const citaExistente = new Cita("12345", 67890, "US", "pending");
        citaRepoMock.obtenerPorId.mockResolvedValue(citaExistente);
        citaRepoMock.actualizar.mockResolvedValue(citaExistente);

        await citaUseCase.actualizarCitaDynamo("12345");

        expect(citaRepoMock.obtenerPorId).toHaveBeenCalledWith("12345");
        expect(citaRepoMock.actualizar).toHaveBeenCalledWith({
            ...citaExistente,
            statusReg: "confirmado",
        });
    });

    it("debería lanzar un error si la cita no existe en DynamoDB al actualizar", async () => {
        citaRepoMock.obtenerPorId.mockResolvedValue(undefined);

        await expect(citaUseCase.actualizarCitaDynamo("12345")).rejects.toThrow("Cita no encontrada en DynamoDB");

        expect(citaRepoMock.obtenerPorId).toHaveBeenCalledWith("12345");
        expect(citaRepoMock.actualizar).not.toHaveBeenCalled();
    });

    it("debería confirmar una cita y publicar un evento", async () => {
        const citaExistente = new Cita("12345", 67890, "US", "pending");
        citaRepoMock.obtenerPorId.mockResolvedValue(citaExistente);
        (publicarEvento as jest.Mock).mockResolvedValue(undefined);

        const resultado = await citaUseCase.confirmarCita("12345");

        expect(citaRepoMock.obtenerPorId).toHaveBeenCalledWith("12345");
        expect(publicarEvento).toHaveBeenCalledWith("12345");
        expect(resultado).toEqual({
            ...citaExistente,
            statusReg: "confirmed",
        });
    });

    it("debería lanzar un error si la cita no existe al confirmar", async () => {
        citaRepoMock.obtenerPorId.mockResolvedValue(undefined);

        await expect(citaUseCase.confirmarCita("12345")).rejects.toThrow("Cita no encontrada");

        expect(citaRepoMock.obtenerPorId).toHaveBeenCalledWith("12345");
        expect(publicarEvento).not.toHaveBeenCalled();
    });
});