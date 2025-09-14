#!/usr/bin/env node

// corrected_test_rbc_api.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in project root
dotenv.config({ path: join(__dirname, '../../.env') });

// --- Configuration ---
const API_TOKEN = process.env.VITE_RBC_API_TOKEN;
const API_BASE_URL = 'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev';

if (!API_TOKEN) {
    console.error('Error: VITE_RBC_API_TOKEN not found in environment variables');
    process.exit(1);
}

// Global headers for endpoints that work correctly
const headersWithBearer = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN.trim()}`
};

// --- FIX IS HERE: Create a separate header for the simulation endpoint ---
// This header sends the raw token without the 'Bearer ' prefix, which seems to be what the API expects
const headersForSimulation = {
    'Content-Type': 'application/json',
    'Authorization': API_TOKEN.trim() // Pass only the token string
};
// --- END OF FIX ---

async function testRBCAPI() {
    console.log('🚀 Starting RBC API Test...');
    console.log('=' .repeat(60));
    console.log('📊 API Base URL:', API_BASE_URL);
    console.log('🔑 Token loaded:', API_TOKEN ? '✅ Yes' : '❌ No');
    console.log('📏 Token length:', API_TOKEN?.length || 0);
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Create a new client (works with Bearer token)
        console.log('\n📝 Step 1: Creating client with $10,000 cash...');
        const clientPayload = {
            name: "Test Investor",
            email: `test.investor.${Date.now()}@example.com`,
            cash: 10000
        };
        
        console.log('Client payload:', JSON.stringify(clientPayload, null, 2));
        
        const clientResponse = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: headersWithBearer,
            body: JSON.stringify(clientPayload)
        });

        console.log(`Response Status: ${clientResponse.status} ${clientResponse.statusText}`);

        if (!clientResponse.ok) {
            const errorText = await clientResponse.text();
            throw new Error(`Client creation failed (${clientResponse.status}): ${errorText}`);
        }

        const client = await clientResponse.json();
        const clientId = client.id;
        console.log('✅ Client created successfully!');
        console.log(`👤 Client ID: ${clientId}`);
        console.log(`💰 Client cash balance: $${client.cash}`);

        // Step 2: Create a portfolio (works with Bearer token)
        console.log('\n📁 Step 2: Creating balanced portfolio with $10,000 initial investment...');
        const portfolioPayload = {
            type: "balanced",
            initialAmount: 10000
        };
        
        const portfolioResponse = await fetch(`${API_BASE_URL}/clients/${clientId}/portfolios`, {
            method: 'POST',
            headers: headersWithBearer,
            body: JSON.stringify(portfolioPayload)
        });

        console.log(`Response Status: ${portfolioResponse.status} ${portfolioResponse.statusText}`);

        if (!portfolioResponse.ok) {
            const errorText = await portfolioResponse.text();
            throw new Error(`Portfolio creation failed (${portfolioResponse.status}): ${errorText}`);
        }

        const portfolio = await portfolioResponse.json();
        const portfolioId = portfolio.id;
        console.log('✅ Portfolio created successfully!');
        console.log(`📁 Portfolio ID: ${portfolioId}`);

        // Step 3: Get updated client info (works with Bearer token)
        console.log('\n📋 Step 3: Checking updated client cash balance...');
        const updatedClientResponse = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
            method: 'GET',
            headers: headersWithBearer
        });

        if (updatedClientResponse.ok) {
            const updatedClient = await updatedClientResponse.json();
            console.log(`💰 Client remaining cash: $${updatedClient.cash}`);
            console.log(`📈 Client portfolios count: ${updatedClient.portfolios?.length || 0}`);
        }

        // Step 4: Run 12-month investment simulation (uses Bearer JWT like others)
        console.log('\n⏱️ Step 4: Running 12-month investment simulation...');
        const simulationPayload = {
            months: 12
        };

        const simulationResponse = await fetch(`${API_BASE_URL}/client/${clientId}/simulate`, { // FIX: singular `client`
            method: 'POST',
            headers: headersWithBearer, // FIX: use same Bearer header
            body: JSON.stringify(simulationPayload)
        });

        console.log(`Response Status: ${simulationResponse.status} ${simulationResponse.statusText}`);

        if (!simulationResponse.ok) {
            const errorText = await simulationResponse.text();
            throw new Error(`Simulation failed (${simulationResponse.status}): ${errorText}`);
        }

        const simulationResult = await simulationResponse.json();
        console.log('✅ Simulation completed successfully!');


        // Step 5: Display comprehensive results
        console.log('\n' + '=' .repeat(60));
        console.log('📈 INVESTMENT SIMULATION RESULTS');
        console.log('=' .repeat(60));
        
        if (simulationResult.results && simulationResult.results.length > 0) {
            const result = simulationResult.results[0];
            const profit = result.projectedValue - result.initialValue;
            const returnRate = (profit / result.initialValue) * 100;

            console.log(`🎯 Portfolio Strategy: ${result.strategy}`);
            console.log(`📅 Simulation Period: ${result.monthsSimulated} months (${result.daysSimulated} days)`);
            console.log(`💵 Initial Investment: $${result.initialValue.toLocaleString('en-US', {minimumFractionDigits: 2})}`);
            console.log(`📊 Final Portfolio Value: $${result.projectedValue.toLocaleString('en-US', {minimumFractionDigits: 2})}`);
            console.log(`💰 Total Profit/Loss: $${profit.toLocaleString('en-US', {minimumFractionDigits: 2})}`);
            console.log(`📈 Total Return: ${returnRate.toFixed(2)}%`);
        } else {
            console.log('❓ No simulation results found in response');
        }

        console.log('\n🎊 RBC API Test completed successfully!');
        console.log('=' .repeat(60));

    } catch (error) {
        console.error('\n❌ RBC API TEST FAILED');
        console.error('=' .repeat(60));
        console.error('💥 Error Message:', error.message);
        console.error('\n🔧 Troubleshooting Tips:');
        console.error('- Check if your JWT token is valid and not expired');
        console.error('- Verify the API endpoint URL is correct');
        console.error('- Ensure the request payload matches API documentation');
        console.error('- Check network connectivity');
        console.error('=' .repeat(60));
        process.exit(1);
    }
}

// Run the test
console.log('🏁 Initializing RBC API Test...\n');
testRBCAPI()
    .then(() => {
        console.log('\n✅ Script execution completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💀 Unhandled error:', error.message);
        process.exit(1);
    });