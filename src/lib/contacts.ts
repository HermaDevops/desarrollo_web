import { EXPORT_DETAIL } from 'next/dist/shared/lib/constants';
import { SAPBusinessOneClient } from './sapb1';

const SAP_HOST = process.env.SAP_HOST!;
const SAP_USERNAME = process.env.SAP_USERNAME!;

export function getClientDB(sapCompanyDB: string, sapPassword: string): SAPBusinessOneClient {
    console.log(SAP_HOST, SAP_USERNAME, sapCompanyDB, sapPassword)
  const client = new SAPBusinessOneClient(SAP_HOST, SAP_USERNAME, sapCompanyDB, sapPassword);
  return client;
}


/*
FUNCION PARA PAGOS RECIBIDOS
*/
export async function getContactsByProperty(
    property: string, 
    dbName: string, 
    dbPassword: string
): Promise<string | null> {
    const filter = {
        $filter: `Properties+${property} eq 'tYES' and CardType eq 'cCustomer' and `,
        $select: `CardCode,CardName,EmailAddress`,
        $orderby: `CardName asc`,
        $top: 10};
    let response:any = null;

    //try{
        const client = getClientDB(dbName, dbPassword);
        await client.login();
        console.log("client", client)
        const queryResult = await client.queryData('BusinessPartners', filter);
        console.log("QUERYTRESULT", queryResult)
        await client.logout();
        const values = queryResult?.values || [];
        console.log('values', values)
        if (values.length > 0) {
            response = values[0]?.CardCode || null;
        }
        await client.logout();
    //} catch (error) {
    //console.error('Propiedad sin clientes asignados', error);
    //}
    return response
}

/*
FUNCION PARA COMPRAS
*/

// Función para obtener el CardCode de un proveedor por su RUC (Tax ID)
export async function getCardCodeProveedor(
  taxId: string,
  dbName: string,
  dbPassword: string
): Promise<string | null> {
  const filter = {
    $filter: `FederalTaxID eq '${taxId}' and CardType eq 'cSupplier'`
  };

  let response: any = null;

  try {
    const client = getClientDB(dbName, dbPassword);
    const queryResult = await client.queryData('BusinessPartners', filter);

    const values = queryResult?.value || [];

    if (values.length > 0) {
      response = values[0]?.CardCode || null;
    }

    await client.logout();
  } catch (error) {
    console.error('No se encontraron ID', error);
  }

  return response;
}

