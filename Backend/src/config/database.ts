import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "networklab",
    connectionLimit: 10,
};

// ✅ Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

export default pool;

async function testConnection() {
    try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    console.log(`📊 Base de datos: ${process.env.DB_NAME || 'networklab'}`);
    connection.release();
    return true;
    } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    return false;
    }
}

export { pool, testConnection };
