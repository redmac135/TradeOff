const API_BASE_URL = 'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev';

// Create a new client
export async function createClient(jwtToken, clientName, initialCash) {
  const url = `${API_BASE_URL}/clients`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
  const body = JSON.stringify({
    client_name: clientName,
    initial_cash: initialCash
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.clientId;
  } catch (error) {
    console.error('Failed to create client:', error);
    throw error;
  }
}

// Simulate portfolio performance for a year
export async function simulatePortfolio(jwtToken, clientId) {
  const url = `${API_BASE_URL}/client/${clientId}/simulate`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
  const body = JSON.stringify({
    months: 12 // Simulate for a full year
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      message: data.message,
      results: data.results
    };
  } catch (error) {
    console.error('Simulation failed:', error);
    throw error;
  }
}