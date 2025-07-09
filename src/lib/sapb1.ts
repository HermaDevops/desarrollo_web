import axios, { AxiosInstance } from 'axios';
import https from 'https';

export class SAPBusinessOneClient {
  private server: string;
  private username: string;
  private company_db: string;
  private password: string;
  private session_id: string | null = null;
  private route_id: string = '.node1';
  private axiosInstance: AxiosInstance;

  constructor(server: string, username: string, company_db: string, password: string) {
    this.server = server;
    this.username = username;
    this.company_db = company_db;
    this.password = password;

    // Configuración para ignorar el certificado SSL (como verify=False)
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      baseURL: `https://${server}:50000/b1s/v1/`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'B1S-PageSize': '0'
      }
    });
  }

  async login(): Promise<void> {
    const payload = {
      UserName: this.username,
      CompanyDB: this.company_db,
      Password: this.password,
    };
    try {
      const response = await this.axiosInstance.post('Login', payload);
      this.session_id = response.data.SessionId;
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.session_id) return;

    try {
      await this.axiosInstance.post(
        'Logout',
        {},
        {
          headers: this._getHeaders()
        }
      );
      this.session_id = null;
      this.route_id = '';
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed', error);
    }
  }

  private _getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Cookie': `B1SESSION=${this.session_id}; ROUTEID=${this.route_id}`,
      'B1S-PageSize': '0'
    };
  }

  async _request(method: string, endpoint: string, params?: any) {
  const headers = this._getHeaders();
  const url = `https://10.0.1.215:50000/b1s/v1/${endpoint}`;
    console.log('headers', headers)
    console.log('url', url)
    console.log('method', method, url, params, headers)
    console.log('params', params)
    console.log('headers', headers)

    console.log('aaaa', this.axiosInstance.request({
      method,
      url,
      data:'',
      params,
      headers
    }))
  try {
    const response = await this.axiosInstance.request({
      method,
      url,
      params,
      headers
    });
    console.log('antesreur', response)
    return response.data;
  } catch (error: any) {
    console.error(`Error en request [${method} ${url}]:`, {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message
    });
    throw error;
  }
}


  async createIncomingPayment(incoming_payment_data: any): Promise<any> {
    return this._request('POST', 'IncomingPayments', incoming_payment_data);
  }

  async createVendorPayment(vendor_payment_data: any): Promise<any> {
    return this._request('POST', 'VendorPayments', vendor_payment_data);
  }

  async createPurchaseInvoice(purchase_invoice_data: any): Promise<any> {
    return this._request('POST', 'PurchaseInvoices', purchase_invoice_data);
  }

  async createSupplierData(supplier_data: any): Promise<any> {
    return this._request('POST', 'BusinessPartners', supplier_data);
  }

  async queryData(endpoint: string, queryParams: Record<string, any>): Promise<any> {
    console.log("donde estoy: ", endpoint, queryParams)
  return this._request('GET', endpoint, queryParams);
}

}
