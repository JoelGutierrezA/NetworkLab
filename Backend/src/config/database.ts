import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', // ← Asegúrate que esto esté así
    database: process.env.DB_NAME || 'networklab',
    connectionLimit: 10,
    // REMOVER acquireTimeout y timeout - no son válidos
};

const pool = mysql.createPool(dbConfig);

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
