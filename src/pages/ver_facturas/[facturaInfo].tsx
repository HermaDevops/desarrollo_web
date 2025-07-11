// pages/ver_facturas/[facturaNumberDate].tsx

import { GetServerSideProps } from 'next';

type Props = {
  factura?: any;
  error?: string;
};

export default function VerFactura({ factura, error }: Props) {
  if (error) return <div>Error: {error}</div>;
  if (!factura) return <div>No se encontró la factura</div>;

  return (
    <div className="contenedor">
      <div className="encabezado">
        <div>
          <h1>{factura.supplier.business.legal_name}</h1>
          <p>RUC {factura.supplier.tax_identification}</p>
          <p>{factura.supplier.address}</p>
        </div>
        <div className="texto-derecha">
          <h2>Factura {factura.number}</h2>
          <p>Fecha {factura.issue_date}</p>
        </div>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>CÓDIGO</th>
            <th>PRODUCTO</th>
            <th>CANTIDAD</th>
            <th>PRECIO UNITARIO</th>
            <th>DESCUENTO UNITARIO</th>
            <th>SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {factura.items.map((item: { sku: string; description: string; quantity: string; unit_price: string; discount: string; taxes: { taxable_amount: string; }[]; }, index: Key | null | undefined) => (
            <tr key={index}>
              <td>{item.sku}</td>
              <td>{item.description}</td>
              <td>{parseFloat(item.quantity).toFixed(2)}</td>
              <td>${parseFloat(item.unit_price).toFixed(2)}</td>
              <td>${parseFloat(item.discount).toFixed(2)}</td>
              <td>${parseFloat(item.taxes[0].taxable_amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="texto-derecha">
        {factura.taxes.map((tax: { name: string ; taxable_amount: string ; amount: string }, index: Key | null | undefined) => (
          <div key={index}>
            <p>Subtotal {tax.name}: ${tax.taxable_amount}</p>
            <p>Valor {tax.name}: ${tax.amount}</p>
          </div>
        ))}
        <p>Total descuento: ${factura.totals.additional_discount}</p>
        <p>Total propina: ${factura.totals.tip_amount}</p>
        <h2>Total: ${factura.totals.total_amount}</h2>
      </div>

      <div>
        <h1>Información Adicional</h1>
        {factura.properties.map((property: { name: string; description: string }, index: Key | null | undefined) => (
          <div key={index} className="fila-info">
            <span>{property.name}</span>
            <span>{property.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getUserFromToken, obtenerBaseyClave } from '@/utils/auth';
import { makeGetRequest } from '@/lib/apidatil';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const facturaInfo = context.params?.facturaInfo;
  if (typeof facturaInfo !== 'string') {
    return {
      props: {
        error: 'Parámetros inválidos en la URL',
      },
    };
  }
  
  const user = getUserFromToken(context.req);
      if (!user || !user.enterprise) {
        return {
          redirect: {
            destination: '/',
            permanent: false
            }
        }; 
      }

  
  const [facturaNumber, issueDate, empresa] = facturaInfo.split('_');
  const endpoint = 'purchases/invoices/'
  const params = { 'issue_from': issueDate, 'issue_to': issueDate }

  // Aquí haces tu consulta real con esos 3 datos
  const response = await  makeGetRequest(endpoint, params, empresa);
  const data = response?.results ?? [];
  const factura = data.find((f: any) => f.number === facturaNumber) || null;
  //console.log(factura)

  return {
    props: { factura },
  }; []
};
