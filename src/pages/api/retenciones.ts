// pages/api/retenciones.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ruc } = req.query;

  if (!ruc || typeof ruc !== 'string') {
    return res.status(400).json({ error: 'RUC inválido' });
  }

  // Simula consulta a base de datos o API externa
  const datos = [
    { WTCode: '001', WTName: 'Renta 1%' },
    { WTCode: '002', WTName: 'IVA 30%' }
  ];

  res.status(200).json(datos);
}
