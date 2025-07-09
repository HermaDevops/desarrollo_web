

const apiKeys: Record<string, string | undefined> = {
    Hermaprove: process.env.DATIL_API_KEY_HERMAPROVE,
    Euro: process.env.DATIL_API_KEY_EURO,
    Obranova: process.env.DATIL_API_KEY_OBRANOVA,
    Villacomunidad: process.env.DATIL_API_KEY_VILLACOMUNIDAD,
    '001': process.env.DATIL_API_KEY_QUEVEDO,
    '002': process.env.DATIL_API_KEY_AMLT,
    '003': process.env.DATIL_API_KEY_PORTETE,
    '004': process.env.DATIL_API_KEY_VIADAULE,
};

const DATIL_API_BASE_URL = process.env.DATIL_API_BASE_URL || '';

export function getHeaders(empresa: string): Record<string, string> {
  const apiKey = apiKeys[empresa];

  if (!apiKey) {
    throw new Error(`API Key no definida para la empresa: ${empresa}`);
  }
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': apiKey,
  };
}

async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('Content-Type');

  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (e) {
      return await response.text();
    }
  } else {
    return await response.text();
  }
}


export async function makeGetRequest(endpoint: string, params: Record<string, string>, empresa: string) {
  const headers = getHeaders(empresa);
  const query = new URLSearchParams(params).toString();
  const url = `${DATIL_API_BASE_URL}/${endpoint}?${query}`;

  const response = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GET request failed: ${response.status} ${errorText}`);
  }

  return await parseResponse(response);
}

export async function makePostRequest(endpoint: string, data: any, empresa: string) {
  const headers = getHeaders(empresa); 
  const url = `${DATIL_API_BASE_URL}/${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`POST request failed: ${response.status} ${errorText}`);
  }

  return await parseResponse(response);
}
