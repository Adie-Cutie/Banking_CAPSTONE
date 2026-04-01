import { test, expect } from '@playwright/test';

// Configuration: Adjust the base URL to match your server
const BASE_URL = 'http://localhost:3000/api';
const HISTORY_PATH = '/transactions/history';

test.describe('IBM Bank - History API Integration ', () => {

    let authToken = '';

    test.beforeAll(async ({ request }) => {
        const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
            data: {
                email: 'john@example.com',
                password: 'password123'
            }
        });
        const body = await loginResponse.json();
        authToken = body.token;
    });

    test('API-01: Unauthorized Access - Verify 401 without JWT', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${HISTORY_PATH}`);
        expect(response.status()).toBe(401);
    });

    test('API-02: Header Check - Content-Type validation', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${HISTORY_PATH}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        expect(response.headers()['content-type']).toContain('application/json');
    });

    test('API-03: Response Time - Verify latency is under 300ms', async ({ request }) => {
        const start = Date.now();
        await request.get(`${BASE_URL}${HISTORY_PATH}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(300);
    });

    test('API-04: Array Handling for Users', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${HISTORY_PATH}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const body = await response.json();
        
        expect(response.status()).toBe(200);
        expect(Array.isArray(body)).toBeTruthy();
    });

    test('API-05: Data Integrity - Validate MongoDB ObjectId format', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${HISTORY_PATH}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const body = await response.json();

        if (body.length > 0) {
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            expect(body[0]._id).toMatch(objectIdRegex);
        }
    });

    test('API-06: Populate Validation - Sender and Receiver scrubbing', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${HISTORY_PATH}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const body = await response.json();

        if (body.length > 0) {
            const sender = body[0].sender;
            const receiver = body[0].receiver;
            expect(sender).toHaveProperty('name');
            expect(sender).toHaveProperty('accountNumber');
            expect(receiver).toHaveProperty('name');
            expect(sender.password).toBeUndefined();
            expect(receiver.password).toBeUndefined();
            expect(sender.email).toBeUndefined();
        }
    });

    //BUSINESS LOGIC

    test('API-07: Chronological Sorting - Newest records first', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${HISTORY_PATH}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const body = await response.json();

        if (body.length >= 2) {
            const firstDate = new Date(body[0].createdAt).getTime();
            const secondDate = new Date(body[1].createdAt).getTime();
            expect(firstDate).toBeGreaterThanOrEqual(secondDate);
        }
    });

});