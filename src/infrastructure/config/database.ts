import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "database-rimac.cry4isg20rje.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "Lomejordetodo951*",
    database: "rimacdb",
    waitForConnections: true,
    connectionLimit: 10, // Límite de conexiones simultáneas
    queueLimit: 0,
});

export default pool;