// src/utils/auth.ts
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

export interface TokenData {
  userId: string;
  email: string;
  enterprise: string;
  property: string;
  rol: string;
}

// Esta función extrae y verifica el token desde las cookies
export function getUserFromToken(req: any): TokenData | null {
  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as TokenData;
    return decoded;
  } catch (err) {
    console.error('Error al verificar token:', err);
    return null;
  }
}


export function obtenerBaseyClave(empresa: string): {db: string, pwd: string}{
  const alias: Record<string, string> = {
    HermaproveG: 'Hermaprove',
    HermaproveQ: 'Hermaprove'
  };
  
  const clave = alias[empresa] || empresa;

  const dbs: Record<string, { db: string; pwd: string }> = {
    Hermaprove: {
      db: process.env.HERMAPROVE_DB || '',
      pwd: process.env.HERMAPROVE_PWD || ''
    },
    Euro: {
      db: process.env.EURO_DB || '',
      pwd: process.env.EURO_PWD || ''
    },
    Obranova: {
      db: process.env.OBRANOVA_DB || '',
      pwd: process.env.OBRANOVA_PWD || ''
    } 
  };
    return dbs[empresa];
}