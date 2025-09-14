import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createClient, simulatePortfolio } from './apiService';

// Mock fetch and localStorage
globalThis.fetch = jest.fn();
Object.defineProperty(globalThis, 'localStorage', {
    value: {
        getItem: jest.fn(() => 'mock_token'),
    },
    writable: true,
});

describe('Investment API Service', () => {
    beforeEach(() => {
        fetch.mockClear();
        localStorage.getItem.mockClear();
    });

    describe('createClient', () => {
        it('should create a new client successfully', async () => {
            const mockResponse = { clientId: 'client-123' };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const clientId = await createClient('mock_token', 'Test User', 100000);
            expect(clientId).toEqual(mockResponse.clientId);
            expect(fetch).toHaveBeenCalledWith(
                'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev/clients',
                expect.any(Object)
            );
        });
    });

    describe('simulatePortfolio for 1 year', () => {
        it('should return simulation results for a 1-year investment', async () => {
            const mockClientId = 'client-123';
            const mockResponse = {
                message: "Simulations completed successfully.",
                results: [{
                    portfolioId: "portfolio-abc",
                    strategy: "balanced",
                    monthsSimulated: 12,
                    initialValue: 100000,
                    projectedValue: 110000,
                }]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await simulatePortfolio('mock_token', mockClientId);
            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                `https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev/client/${mockClientId}/simulate`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ months: 12 })
                })
            );

            console.log('Expected return after 1 year:', result.results[0].projectedValue);
        });
    });
});