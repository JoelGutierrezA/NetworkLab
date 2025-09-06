import { testConnection } from './config/database';

async function main() {
    console.log('🧪 Probando conexión a la base de datos...');
    const connected = await testConnection();

    if (connected) {
    console.log('✅ Prueba exitosa - La base de datos está conectada');
    process.exit(0);
    } else {
    console.log('❌ Prueba fallida - No se pudo conectar a la base de datos');
    process.exit(1);
    }
}

main();