import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Trae las variables de entorno .env
dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT

});

const connectToDatabase = async () => {
    try {
        await db.getConnection();
        console.log('Conectado a la base de datos.');
    } catch (err) {
        console.error('Error de conexión a la base de datos:', err);
        throw err;
    }
};

connectToDatabase();

export default db;
