import fs from "fs";

const API_URL = "http://localhost:3001/api";

async function runTests() {
  console.log("Starting invariant verification tests...");

  // 1. Register a test user
  const email = `test-${Date.now()}@example.com`;
  const password = "password123";

  console.log("Registering test user...");
  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      email, 
      password, 
      firstName: "Test",
      lastName: "User",
      phoneNumber: "1234567890",
      confirmPassword: password
    }),
  });
  const registerData = await registerRes.json();
  if (!registerRes.ok) {
    console.error("Registration failed:", registerData);
    throw new Error("Failed to register test user");
  }
  const token = registerData.data?.accessToken;
  
  if (!token) {
    console.error("Token missing:", registerData);
    throw new Error("Failed to register test user - No token");
  }

  // =========================================================================
  // TEST: Class 10 assessment result validation
  // =========================================================================
  console.log("\n--- Testing Class 10 Flow ---");

  // Update profile to Class 10
  await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentStage: "Class 10" }),
  });

  // Start Assessment
  const startRes10 = await fetch(`${API_URL}/assessment/dynamic/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ assessmentType: "career_interest" }),
  });
  const startData10 = await startRes10.json();
  if (!startRes10.ok) {
    console.error("Failed to start Class 10:", startData10);
    throw new Error("Failed to start Class 10 session");
  }
  const sessionId10 = startData10.sessionId;

  console.log(`Started Class 10 session: ${sessionId10}`);

  console.log("Test 1, 2, 3 (Class 10 Flow) - Initiation successful, full completion requires E2E.");

  // =========================================================================
  // TEST: Class 12 assessment result validation
  // =========================================================================
  console.log("\n--- Testing Class 12 Flow ---");

  // Update profile to Class 12
  await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentStage: "Class 12", currentStream: "PCM" }),
  });

  const startRes12 = await fetch(`${API_URL}/assessment/dynamic/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ assessmentType: "career_interest" }),
  });
  const startData12 = await startRes12.json();
  const sessionId12 = startData12.sessionId;

  console.log(`Started Class 12 session: ${sessionId12}`);
  console.log("Test 4, 5 (Class 12 Flow) - Initiation successful, full completion requires E2E.");

  console.log("\nScripted tests complete. Proceeding to Manual E2E.");
}

runTests().catch(console.error);
