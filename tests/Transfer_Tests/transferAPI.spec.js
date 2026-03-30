import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let initialBalance = 0;

test.describe('Transfer API - IBM BANK (Dynamic Logic)', () => {

    test.beforeAll(async ({ request }) => {
        
        const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
            data: { email: 'john@example.com', password: 'password123' }
        });

        expect(loginResponse.ok()).toBeTruthy();
        const loginBody = await loginResponse.json();
        
        authToken = loginBody.token;
        initialBalance = loginBody.user.balance; 
    });

    test('API-TR-06: Valid Transfer and Balance Deduction', async ({ request }) => {
        const transferAmount = 25;
        const payload = {
            receiverAccountNumber: "8840286830",
            amount: transferAmount
        };

        const response = await request.post(`${BASE_URL}/transactions/transfer`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: payload
        });

        const body = await response.json();

        expect(response.status()).toBe(200);
        expect(body.message).toBe("Transfer successful");


        const expectedBalance = initialBalance - transferAmount;
        expect(body.newBalance).toBe(expectedBalance);
        initialBalance = body.newBalance;
    });

    test('API-TR-07: Reject Transfer if Amount > newBalance', async ({ request }) => {
        // Attempt to send more than what we currently have (initialBalance is now 750)
        const response = await request.post(`${BASE_URL}/transactions/transfer`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: {
                receiverAccountNumber: "8840286830",
                amount: initialBalance + 1 // 751
            }
        });

        // Expecting 400 Bad Request for insufficient funds
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.message).toMatch(/insufficient funds/i);
    });
    test('API-TR-08: Block Transfer with No Token', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/transactions/transfer`, {
            data: { receiverAccountNumber: "8840286830", amount: 10 }
        });
        expect(response.status()).toBe(401);
    });
    test('API-TR-09: Reject Non-Numeric Account Number', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/transactions/transfer`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            data: { receiverAccountNumber: "ABC-123-XYZ", amount: 10 }
        });
        expect(response.status()).toBe(404);
});
});