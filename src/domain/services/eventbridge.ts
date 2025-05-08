import AWS from "aws-sdk";

const eventBridge = new AWS.EventBridge();

export const publicarEvento = async (insuredId: string) => {
    const evento = {
        Entries: [
            {
                Source: "app.citas",
                DetailType: "CitaConfirmada",
                Detail: JSON.stringify({ insuredId: insuredId, estado: "confirmado" }),
                EventBusName: "default",
            },
        ],
    };

    await eventBridge.putEvents(evento).promise();
    console.log("📤 Evento enviado a EventBridge correctamente.");
};