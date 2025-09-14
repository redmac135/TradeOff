const API_BASE_URL = 'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev';

// Get InvestUse Estimate
export async function getInvestUseEstimate(clientName, initialCash, riskTolerance) {
  const jwtToken = import.meta.env.VITE_JWT_SECRET;

  // Step 1: create client and get id
  const createClientUrl = `${API_BASE_URL}/clients`;
  const createClientHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
  const createClientBody = JSON.stringify({
    name: clientName,
    email: `${clientName.replace(/\s+/g, '_').toLowerCase() + new Date().getTime()}@example.com`,
    cash: initialCash,
    portfolios: [],
  });

  const createClientResponse = await fetch(createClientUrl, {
    method: 'POST',
    headers: createClientHeaders,
    body: createClientBody,
    mode: 'cors'
  });

  const jsonResponse = await createClientResponse.json()
  const clientId = jsonResponse.id;

  // Step 2: Create portfolio with initial cash
  const createPortfolioUrl = `${API_BASE_URL}/clients/${clientId}/portfolios`;
  const createPortfolioHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };

  // split range 0 - 100% into 5 buckets
  // 'aggressive_growth', 'growth', 'balanced', 'conservative', 'very_conservative'
  let risk_tolerance = 'balanced';
  if (riskTolerance <= 20) {
    risk_tolerance = 'very_conservative';
  } else if (riskTolerance <= 40) {
    risk_tolerance = 'conservative';
  } else if (riskTolerance <= 60) {
    risk_tolerance = 'balanced';
  } else if (riskTolerance <= 80) {
    risk_tolerance = 'growth';
  } else {
    risk_tolerance = 'aggressive_growth';
  }

  const createPortfolioBody = JSON.stringify({
    initialAmount: initialCash,
    type: risk_tolerance
  });

  const createPortfolioResponse = await fetch(createPortfolioUrl, {
    method: 'POST',
    headers: createPortfolioHeaders,
    body: createPortfolioBody,
    mode: 'cors'
  });

  const portfolioId = (await createPortfolioResponse.json()).id;

  // wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 3: Simulate portfolio for a year
  const simulatePortfolioUrl = `${API_BASE_URL}/client/${clientId}/simulate`;
  const simulatePortfolioHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  };
  const simulatePortfolioBody = JSON.stringify({
    months: 12 // Simulate for a full year
  });

  const simulatePortfolioResponse = await fetch(simulatePortfolioUrl, {
    method: 'POST',
    headers: simulatePortfolioHeaders,
    body: simulatePortfolioBody,
    mode: 'cors'
  });

  const projectedValue = (await simulatePortfolioResponse.json()).results[0].projectedValue;

  return projectedValue;
}
