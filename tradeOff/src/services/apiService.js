const API_BASE_URL = 'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev';const API_BASE_URL = 'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev';



// Client creation and management// Create a new client

export const createClient = async (name, email, initialCash) => {export async function createClient(jwtToken, clientName, initialCash) {

    const response = await fetch(`${API_BASE_URL}/clients`, {  const url = `${API_BASE_URL}/clients`;

        method: 'POST',  const headers = {

        headers: {    'Content-Type': 'application/json',

            'Content-Type': 'application/json',    'Authorization': `Bearer ${jwtToken}`

            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`  };

        },  const body = JSON.stringify({

        body: JSON.stringify({    client_name: clientName,

            name,    initial_cash: initialCash

            email,  });

            cash: initialCash,

            portfolios: []  try {

        })    const response = await fetch(url, {

    });      method: 'POST',

      headers: headers,

    if (!response.ok) {      body: body

        throw new Error('Failed to create client');    });

    }

    if (!response.ok) {

    return response.json();      throw new Error(`HTTP error! status: ${response.status}`);

};    }



// Portfolio management    const data = await response.json();

export const createPortfolio = async (clientId, strategy, initialInvestment) => {    return data.clientId;

    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/portfolios`, {  } catch (error) {

        method: 'POST',    console.error('Failed to create client:', error);

        headers: {    throw error;

            'Content-Type': 'application/json',  }

            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`}

        },

        body: JSON.stringify({// Simulate portfolio performance for a year

            strategy,export async function simulatePortfolio(jwtToken, clientId) {

            initialInvestment  const url = `${API_BASE_URL}/client/${clientId}/simulate`;

        })  const headers = {

    });    'Content-Type': 'application/json',

    'Authorization': `Bearer ${jwtToken}`

    if (!response.ok) {  };

        throw new Error('Failed to create portfolio');  const body = JSON.stringify({

    }    months: 12 // Simulate for a full year

  });

    return response.json();

};  try {

    const response = await fetch(url, {

// Simulation      method: 'POST',

export const simulatePortfolio = async (clientId, months) => {      headers: headers,

    const response = await fetch(`${API_BASE_URL}/client/${clientId}/simulate`, {      body: body

        method: 'POST',    });

        headers: {

            'Content-Type': 'application/json',    if (!response.ok) {

            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`      throw new Error(`HTTP error! status: ${response.status}`);

        },    }

        body: JSON.stringify({

            months    const data = await response.json();

        })    return {

    });      message: data.message,

      results: data.results

    if (!response.ok) {    };

        throw new Error('Failed to simulate portfolio');  } catch (error) {

    }    console.error('Simulation failed:', error);

    throw error;

    return response.json();  }

};}

// Helper function to calculate real-time portfolio value
export const calculateRealTimeValue = (initialValue, months, currentTimeMs, startTimeMs) => {
    const totalDuration = months * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds
    const elapsedTime = currentTimeMs - startTimeMs;
    const progress = Math.min(elapsedTime / totalDuration, 1);
    
    // Using exponential growth formula: A = P(1 + r)^t
    // Where:
    // A = Final amount
    // P = Principal (initial investment)
    // r = Growth rate (estimated based on risk appetite)
    // t = Time (normalized progress)
    
    const annualRate = 0.10; // 10% annual return (adjust based on risk appetite)
    const currentValue = initialValue * Math.pow(1 + annualRate, progress * months / 12);
    
    return currentValue;
};