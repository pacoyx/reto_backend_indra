import request from "supertest";
import { app } from "../src/lambda/handler";
import { Cita } from "../src/domain/entities/Cita";
import { CitaUseCase } from "../src/application/use-cases/CitaUseCase";
import { CitaRepository } from "../src/infrastructure/adapters/CitaRepositoryDynamo";
import { CitaService } from "../src/domain/services/CitaService";
import { CitaRepositoryMysql } from "../src/infrastructure/adapters/CitaRepositoryMysql";

jest.mock("../src/application/use-cases/CitaUseCase");

describe("Handler", () => {
    let citaUseCaseMock: jest.Mocked<CitaUseCase>;

    beforeEach(() => {
        const citaRepoMock = {} as jest.Mocked<CitaRepository>;
        const citaServiceMock = {} as jest.Mocked<CitaService>;
        const citaRepoMysqlMock = {} as jest.Mocked<CitaRepositoryMysql>;
        citaUseCaseMock = new CitaUseCase(citaRepoMock, citaServiceMock, citaRepoMysqlMock) as jest.Mocked<CitaUseCase>;
    });

    it("debería crear una nueva cita", async () => {
        const nuevaCita = new Cita("12345", 67890, "US", "pending");
        citaUseCaseMock.crearCita.mockResolvedValue(nuevaCita);

        const response = await request(app)
            .post("/citas")
            .send({
                insuredId: "12345",
                scheduleId: "67890",
                countryISO: "US",
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(nuevaCita);
        expect(citaUseCaseMock.crearCita).toHaveBeenCalledWith(nuevaCita);
    });

    it("debería obtener una cita por ID", async () => {
        const citaExistente = new Cita("12345", 67890, "US", "confirmed");
        citaUseCaseMock.obtenerCita.mockResolvedValue(citaExistente);

        const response = await request(app).get("/citas/12345");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(citaExistente);
        expect(citaUseCaseMock.obtenerCita).toHaveBeenCalledWith("12345");
    });
});