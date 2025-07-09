import sql from 'mssql';

// Tipo de salida de la configuracion para SQL
type SqlConnectionConfig = {
  user: string;
  password: string;
  server: string;
  database: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
};

// Constantes para la conexion a la BD y Configuracion
const sqlDatabases: Record<string, string | undefined> = {
    Hermaprove: process.env.SQL_DATABASE_HERMAPROVE!,
    HermaproveG: process.env.SQL_DATABASE_HERMAPROVE!,
    HermaproveQ: process.env.SQL_DATABASE_HERMAPROVE!,
    Euro: process.env.SQL_DATABASE_EURO!,
    Obranova: process.env.SQL_DATABASE_OBRANOVA!,
    Villacomunidad: process.env.SQL_DATABASE_VILLACOMUNIDAD!,
};

const config = {
  user: process.env.SQL_USERNAME!,
  password: process.env.SQL_PASSWORD!,
  server: process.env.SQL_SERVER_LOCAL!,
  database: process.env.SQL_DATABASE_HERMAPROVE!,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Funcion para validad Login
export async function conectarDB() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
    throw err;
  }
}

// Funcion para obtener la config a la BD de la empresa
import { getUserFromToken } from '@/utils/auth';
export function getDataBaseConnectFromReq(req: any): SqlConnectionConfig {
  
  const user = getUserFromToken(req);
  if (!user || !user.enterprise) {
    throw new Error('Token inválido o empresa no definida');
  }
  const dataBaseEnterprise = sqlDatabases[user.enterprise];
  if (!dataBaseEnterprise) {
    throw new Error(`No existe base para la empresa: ${user.enterprise}`);
  }

  return {
    user: process.env.SQL_USERNAME!,
    password: process.env.SQL_PASSWORD!,
    server: process.env.SQL_SERVER_LOCAL!,
    database: dataBaseEnterprise,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

// Funcion para conexion de la BD de la empesa
export async function conecction(req: any) {
  try {
    const config_connect = getDataBaseConnectFromReq(req); 
    const pool = await sql.connect(config_connect);
    return pool;
  } catch (error) {
    console.error("Error en conecction:", error);
    throw error;
  }
}

// Funcion para devolver secuencial de la BD
export async function generar_secuencial(req: any) {
  try {
    const config_connect = getDataBaseConnectFromReq(req); 
    const pool = await new sql.ConnectionPool(config_connect).connect();
    const resultado = await pool
      .request()
      .query('SELECT MAX(recibo) AS secuencial FROM incoming_payments');
      await pool.close();
    const rawSecuencial = resultado.recordset?.[0]?.secuencial;
    const secuencial = (rawSecuencial ?? 0) + 1;
    return secuencial;
  } catch (error) {
    console.error("Error en generar_secuencial:", error);
    throw error;
  }
}
