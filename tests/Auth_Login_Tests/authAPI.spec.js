import { test, expect } from '@playwright/test';

test.describe.serial('Auth Module - API Test Cases', () => {
  let authToken;
  const testUser = {
    name: "Aditi",
    email: `test_${Date.now()}@ibm.com`, 
    password: "password123"
  };

  test('API-01: Successful Registration', async ({ request }) => {
    const response = await request.post('/api/auth/register', { data: testUser });
    const body = await response.json();
    
    expect(response.status()).toBe(201);
    expect(body.message).toBe('User registered successfully');
    expect(body).toHaveProperty('accountNumber');
  });

  test('API-02: Fail on Duplicate Email (400 Bad Request)', async ({ request }) => {
    const response = await request.post('/api/auth/register', { data: testUser });
    const body = await response.json();
    
    expect(response.status()).toBe(400);
    expect(body.message).toBe('User already exists'); 
  });

  test('API-03: Fail on Missing Password', async ({ request }) => {
    const response = await request.post('/api/auth/register', { 
        data: { name: "NoPass", email: "nopass@test.com" } 
    });
    expect(response.status()).toBe(500);
  });

  test('API-04: Fail on Invalid Email Format', async ({ request }) => {
    const response = await request.post('/api/auth/register', { 
        data: { email: "not-an-email" } 
    });
    expect(response.status()).toBe(400);
  });

  // --- LOGIN ---
  test('API-05: Successful Login & Token Generation', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: testUser.email, password: testUser.password }
    });
    const body = await response.json();
    
    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('token');
    authToken = body.token; // Save for protected routes
  });

  test('API-06: Login Fail - Wrong Password', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: testUser.email, password: "WrongPassword" }
    });
    expect(response.status()).toBe(400);
    const body= await response.json();
    expect(body.message).toBe('Invalid Credentials')
  });

  test('API-07: Login Fail - Unregistered User', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: "ghost@test.com", password: "any" }
    });
    expect(response.status()).toBe(400);
  });

  test('API-08: Verify Initial Balance is $1000', async ({ request }) => {
     const response = await request.post('/api/auth/login', {
      data: { email: testUser.email, password: testUser.password }
    });
    const body = await response.json();
    const balance = body.user ? body.user.balance : body.balance;
    expect(balance).toBe(1000);
  });

  test('API-09: Verify Account Number is 10 Digits', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: testUser.email, password: testUser.password }
    });
    const body = await response.json();
    const accNum = body.user ? body.user.accountNumber : body.accountNumber;
    expect(accNum).toHaveLength(10);
  });



});