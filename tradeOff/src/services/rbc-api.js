const API_BASE_URL = 'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev';

// Get the JWT token from environment variables
const JWT_TOKEN = import.meta.env.VITE_RBC_API_TOKEN;

/**
 * Create a new client in the RBC API
 * @param {string} clientName - Name of the client
 * @param {number} initialCash - Initial investment amount
 * @returns {Promise<string>} - Client ID
 */
export async function createClient(clientName, initialCash) {
  const url = `${API_BASE_URL}/clients`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`
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

/**
 * Simulate portfolio performance for one year
 * @param {string} clientId - Client ID from createClient
 * @returns {Promise<Object>} - Simulation results
 */
export async function simulatePortfolio(clientId) {
  const url = `${API_BASE_URL}/client/${clientId}/simulate`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`
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

// Example usage placeholder - replace this with your actual implementation
export async function initializeGameState(clientName = "Test User", initialCash = 10000) {
  try {
    // Create new client
    const clientId = await createClient(clientName, initialCash);
    console.log('Created client with ID:', clientId);

    // Simulate portfolio
    const simulation = await simulatePortfolio(clientId);
    console.log('Simulation results:', simulation);

    return {
      clientId,
      initialCash,
      projectedValue: simulation.results[0]?.projectedValue,
      simulationResults: simulation.results
    };
  } catch (error) {
    console.error('Failed to initialize game state:', error);
    throw error;
  }
}