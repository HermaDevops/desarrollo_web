'use-client';
import { useState } from 'react';
import { useRouter } from "next/router";

type Props = {
  invoices : Record<string, any>[];
  cuentasContables: { code: string; value: string }[];
  centrosCostos: { code: string; value: string }[];
  codigosRetenncion: string;
  error?: string | null;
};

export default function registroFacturasPage({ invoices, cuentasContables, centrosCostos, error }: Props) {
  const [fechaBusqueda, setFechaBusqueda] = useState('');
  const router = useRouter();
  const [filaActiva, setFilaActiva] = useState<string | null>(null);
  const [loadingFila, setLoadingFila] = useState<string | null>(null);
  const [retencionesPorFila, setRetencionesPorFila] = useState<Record<string, any[]>>({});

  const handleSubmit = (e: { preventDefault: () => void; }) => {
  e.preventDefault(); // evita recargar la página

  // Redirigir o hacer algo con la fecha
  if (fechaBusqueda) {
    router.push(`/registro_facturas?fecha=${fechaBusqueda}`);
    setFechaBusqueda(fechaBusqueda)
  }
  };

  const obtenerRetenciones = async (ruc: string, facturaId: string) => {
    console.log('buscando', ruc);
    setLoadingFila(facturaId);

    // Simula carga (reemplaza con fetch real si hace falta)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulamos datos de retenciones
    const retencionesMock = [
      { WTCode: '001', WTName: 'Renta 1%' },
      { WTCode: '002', WTName: 'IVA 30%' },
    ];

    // Actualizamos estado
    setRetencionesPorFila((prev) => ({
      ...prev,
      [facturaId]: retencionesMock,
    }));
    setFilaActiva(facturaId);
    setLoadingFila(null);
  };


return(
  <div>
    <h1 >Comprobantes Recibidos</h1>
    <div >
        <nav>
          <button className="btn-facturas" >Facturas</button>
          <button className="btn-facturas" >Notas de Crédito</button>
        </nav>
    </div>
    <div className='info-container'>
    </div>
    
    <form method="POST"  onSubmit={handleSubmit}>
      <div >
          <input type="date" id="fecha" value={fechaBusqueda} onChange={(e) => setFechaBusqueda(e.target.value)}/>
          <button type="submit" className="btn-buscar">Buscar</button>
      </div>
    </form>
      <div >
        <table >
          <thead>
              <tr>
                <th>NÚMERO</th>
                <th>EMITIDO</th>
                <th>EMISOR</th>
                <th>TOTAL</th>
                <th>TIPO DE GASTO</th>
                <th>CENTRO DE COSTO</th>
                <th>LLEVA RETENCION</th>
                <th>CODIGOS DE RETENCION</th>
                <th>COMENTARIO</th>
                <th>ACCIONES</th>
              </tr>
          </thead>
          <tbody>
            {invoices?.map((factura) =>
              <tr>
                <td>{ factura.number }</td>
                <td>{ factura.issue_date }</td>
                <td>{ factura.supplier?.legal_name }</td>
                <td>$ {factura.totals?.total_amount }</td>
                <td>
                  <select required>
                    <option value=' '>Seleccione</option>
                      {cuentasContables.map(({code, value}) => (
                        <option key={code} value={code}>{value}</option>
                      ))}
                  </select>
                </td>
                <td>
                  <select required>
                    <option value=''>Seleccione</option>
                      {centrosCostos.map(({code, value}) =>
                        <option key={code} value={code} > {value} </option>
                      )}
                  </select>
                </td>
                <td>
                  <select className='retencion' required>
                    <option value="" >Seleccione</option>
                    <option value="si">Si</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td>
              {loadingFila === factura.id && <span>Cargando...</span>}

              {filaActiva !== factura.id ? (
                <button
                  className="btn-retenciones"
                  onClick={() =>
                    obtenerRetenciones(
                      factura.supplier?.tax_identification || '',
                      factura.id
                    )
                  }
                >
                  Ver Retenciones
                </button>
              ) : (
                <select multiple size={5} className="codRetencion">
                  {retencionesPorFila[factura.id]?.map((retencion) => (
                    <option key={retencion.WTCode} value={retencion.WTCode}>
                      {retencion.WTName}
                    </option>
                  ))}
                </select>
              )}
            </td>
                <td>
                  <textarea className='comentario' placeholder="Comentario"></textarea>
                </td>
                <td>
                  <button className='btn-ver'>Ver</button>
                  <button className='btn-ingresar'>Ingresar</button>
                </td>
              </tr>
            )} 
          </tbody>
        </table>
      </div>
  </div>
);
}

import { GetServerSideProps } from 'next';
import { GetServerSidePropsContext } from 'next';
import { getUserFromToken, obtenerBaseyClave } from '@/utils/auth';
import { makeGetRequest } from '@/lib/apidatil';
import { cuentas_contables_por_empresa, centros_costos_por_empresa } from '@/lib/config';
import { constrainedMemory } from 'process';

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1); // resta 1 día
  return date.toISOString().split('T')[0]; // formato YYYY-MM-DD
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const rawFecha = context.query.fecha;
  const fecha = typeof rawFecha === 'string' ? rawFecha : getYesterday();

  //const fecha = context.query.fecha || getYesterday();
  const params = { 'issue_from': fecha, 'issue_to': fecha }
  const endpoint = 'purchases/invoices/'

  try{
    const user = getUserFromToken(context.req);
      if (!user || !user.enterprise) {
        return {
          redirect: {
            destination: '/',
            permanent: false
            }
        };
      }
      const { db, pwd } = obtenerBaseyClave(user.enterprise);
      const response = await makeGetRequest(endpoint, params, user.enterprise);
      const invoices = response?.results ?? [];

      //Busqueda de cuentas contables y centros de costos
      const rawCuentas = cuentas_contables_por_empresa[user.enterprise]
      const cuentasContables = Object.entries(rawCuentas).map(([code, value]) => ({code, value,}));

      const rawCentosCostos = centros_costos_por_empresa[user.enterprise]
      const centrosCostos = Object.entries(rawCentosCostos).map(([code, value]) => ({code, value,}));


      return {
        props: {
          invoices: invoices,
          cuentasContables: cuentasContables, 
          centrosCostos: centrosCostos,
          error: null
        }
      };
  } catch (error: any) {
      return {
        props: {
          error: error.message || 'Error desconocido en el servidor'
        }
      };
    }
}

