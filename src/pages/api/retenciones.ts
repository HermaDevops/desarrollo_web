// pages/api/retencion.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRetencionesProveedor } from '@/lib/contacts';
import { obtenerBaseyClave } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ruc, facturaId , empresa} = req.query;

  if (typeof ruc !== 'string' || typeof facturaId !== 'string' || typeof empresa !== 'string') {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }
  const { db, pwd } = obtenerBaseyClave(empresa);
  try {
    const valores = getRetencionesProveedor(ruc, db, pwd)
    return res.status(200).json({ valores });
  } catch (error) {
    console.error('Error al consultar retenciones', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}
