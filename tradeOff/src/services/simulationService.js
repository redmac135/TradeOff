import { createClient, createPortfolio, simulatePortfolio } from './apiService';

export class InvestmentSimulator {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
        this.simulationInterval = null;
        this.startTime = null;
    }

    async startSimulation(name, email, initialAmount, months, riskAppetite) {
        // Create client
        const client = await createClient(name, email, initialAmount);
        
        // Create portfolio based on risk appetite
        await createPortfolio(client.id, riskAppetite.toLowerCase(), initialAmount);
        
        // Get simulation results
        const simulation = await simulatePortfolio(client.id, months);
        
        // Start real-time updates
        this.startTime = Date.now();
        this.initialAmount = initialAmount;
        this.months = months;
        this.targetValue = simulation.results[0].projectedValue;
        
        // Update every 333ms (approximately 3 times per second)
        this.simulationInterval = setInterval(() => {
            this.updateSimulationValue();
        }, 333);

        return simulation;
    }

    updateSimulationValue() {
        const currentTime = Date.now();
        const progress = Math.min((currentTime - this.startTime) / (this.months * 30 * 24 * 60 * 60 * 1000), 1);
        
        // Calculate current value using exponential interpolation
        const currentValue = this.initialAmount + 
            (this.targetValue - this.initialAmount) * 
            (Math.pow(Math.E, 2 * progress) - 1) / (Math.E * Math.E - 1);

        if (this.updateCallback) {
            this.updateCallback(currentValue.toFixed(2));
        }

        // Stop simulation when complete
        if (progress >= 1) {
            this.stopSimulation();
        }
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    // Calculate return rate based on risk appetite
    getAnnualReturnRate(riskAppetite) {
        const rates = {
            'very conservative': 0.04,  // 4%
            'conservative': 0.06,       // 6%
            'balanced': 0.08,          // 8%
            'growth': 0.10,            // 10%
            'aggressive growth': 0.12   // 12%
        };
        return rates[riskAppetite.toLowerCase()] || 0.08;
    }
}