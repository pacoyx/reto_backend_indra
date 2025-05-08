import swaggerJsDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Clientes",
            version: "1.0.0",
            description: "Documentación de API para el CRUD de clientes en AWS Lambda",
        },
        servers: [{ url: "https://tu-api.amazonaws.com" }],
    },
    apis: ["src/lambda/handler.ts"], // Archivos donde están los endpoints
};

export default swaggerJsDoc(options);