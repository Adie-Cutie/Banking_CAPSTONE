import { test, expect } from '@playwright/test';

test.describe.serial('IBM Bank - Backend API Tests', (m) => {
  let token;
  const testUser = {
    name: "Playwright Test",
    email: `api_test_${Date.now()}@ibm.com`,
    password: "Password123"
  };

  /**
   * SECTION 1: AUTHENTICATION
   */
  test('POST /auth/register - Should create a new user', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: testUser
    });
    console.log("DEBUG BACKEND RESPONSE:", body); 

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.user).toHaveProperty('name', testUser.name);
    expect(body).toHaveProperty('token');
    
    // Save token for later tests
    token = body.token;
  });

  test('POST /auth/login - Should return a token for valid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('token');
  });

  /**
   * SECTION 2: PROTECTED ROUTES (Requires Token)
   */
  test('GET /transactions/history - Should fail without a token', async ({ request }) => {
    const response = await request.get('/api/transactions/history');
    expect(response.status()).toBe(401);
  });

  test('GET /transactions/history - Should return empty array for new user', async ({ request }) => {
    const response = await request.get('/api/transactions/history', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  /**
   * SECTION 3: TRANSACTION LOGIC
   */
  test('POST /transactions/transfer - Should prevent negative amounts', async ({ request }) => {
    const response = await request.post('/api/transactions/transfer', {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        receiverAccountNumber: "8840286830",
        amount: -50
      }
    });

    // Your backend should return 400 for negative math
    expect(response.status()).toBe(400);
  });

  test('POST /transactions/transfer - Should fail if receiver does not exist', async ({ request }) => {
    const response = await request.post('/api/transactions/transfer', {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        receiverAccountNumber: "0000000000", // Non-existent
        amount: 100
      }
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.message).toContain('not found');
  });
});
