import { db } from "../src/db";
import { assessmentSessions, studentAssessmentProfiles, recommendationSets, userRecommendations, profiles } from "../src/db/schemas";
import { eq } from "drizzle-orm";

const API_URL = "http://localhost:3001/api";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runE2ETests() {
  console.log("====================================================");
  console.log("STARTING E2E INTEGRATION TEST FOR CLASS 10 & CLASS 12");
  console.log("====================================================");

  // =========================================================================
  // CLASS 10 FLOW
  // =========================================================================
  console.log("\n--- [CLASS 10 FLOW START] ---");
  const email10 = `test-class10-${Date.now()}@example.com`;
  const password = "password123";

  console.log(`Registering Class 10 test user: ${email10}`);
  const regRes10 = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      email: email10, 
      password, 
      firstName: "Test",
      lastName: "Class10",
      phoneNumber: "1234567890",
      confirmPassword: password
    }),
  });
  const regData10 = await regRes10.json();
  if (!regRes10.ok) throw new Error("Registration failed for Class 10 user: " + JSON.stringify(regData10));
  const token10 = regData10.data?.accessToken;

  // Set Profile stage to Class 10 via DB directly
  await db.update(profiles)
    .set({ currentStage: "Class 10" })
    .where(eq(profiles.userId, regData10.data.user.id));

  // Start Assessment
  const startRes10 = await fetch(`${API_URL}/assessment/dynamic/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token10}` },
    body: JSON.stringify({ assessmentType: "career_interest" }),
  });
  const startData10 = await startRes10.json();
  if (!startRes10.ok) throw new Error("Failed to start session: " + JSON.stringify(startData10));
  const sessionId10 = startData10.sessionId;
  console.log(`Started Class 10 Dynamic Session: ${sessionId10}`);

  let currentQuestion = startData10.nextQuestion ?? startData10.question;
  let currentQuestionId = startData10.nextQuestionId ?? startData10.questionId;
  let options = startData10.options;
  let status = startData10.status;
  let turnCount = 1;

  while (status === "continue") {
    // Pick the first option
    const answer = options[0];
    console.log(`[Class 10 - Q${turnCount}] ID: ${currentQuestionId} | Question: "${currentQuestion}"`);
    console.log(`Selecting answer: "${answer}"`);

    const answerRes = await fetch(`${API_URL}/assessment/dynamic/${sessionId10}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token10}` },
      body: JSON.stringify({
        answer,
        questionId: currentQuestionId
      }),
    });

    const answerData = await answerRes.json();
    if (!answerRes.ok) throw new Error("Failed to submit answer: " + JSON.stringify(answerData));

    status = answerData.status;
    currentQuestion = answerData.nextQuestion;
    currentQuestionId = answerData.nextQuestionId;
    options = answerData.options;
    turnCount++;

    if (status === "completed") {
      console.log(`[Class 10 Completion Payload] status: completed, recommendationStatus: ${answerData.recommendationStatus}`);
      break;
    }
  }

  // Fetch results 5 times to verify idempotency and correct types
  console.log("\nQuerying Results API 5 times for Class 10 session...");
  let firstRecSetId = null;
  for (let i = 1; i <= 5; i++) {
    const resPage = await fetch(`${API_URL}/assessment/dynamic/${sessionId10}/result`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token10}` }
    });
    const resData = await resPage.json();
    if (!resPage.ok) {
      throw new Error(`Results query ${i} failed: ` + JSON.stringify(resData));
    }
    
    console.log(`[Result Query ${i}] HTTP ${resPage.status}`);
    console.log(`  recommendationSetId: ${resData.recommendationSetId}`);
    console.log(`  academicStage: ${resData.academicStage}`);
    console.log(`  recommendationType: ${resData.recommendationType}`);
    console.log(`  recommendationCount: ${resData.recommendations?.length}`);
    if (resData.recommendations?.length > 0) {
      const types = Array.from(new Set(resData.recommendations.map((r: any) => r.recommendation_type)));
      console.log(`  unique recommendation types in list:`, types);
      // Validate Class 10 constraints
      for (const rec of resData.recommendations) {
        if (rec.recommendation_type !== "ACADEMIC_DIRECTION") {
          throw new Error(`Invalid Class 10 recommendation type detected: ${rec.recommendation_type}`);
        }
      }
    }

    if (i === 1) {
      firstRecSetId = resData.recommendationSetId;
    } else {
      if (resData.recommendationSetId !== firstRecSetId) {
        throw new Error("Idempotency failed: recommendationSetId changed on query " + i);
      }
    }
  }

  // =========================================================================
  // CLASS 12 FLOW
  // =========================================================================
  console.log("\n--- [CLASS 12 FLOW START] ---");
  const email12 = `test-class12-${Date.now()}@example.com`;

  console.log(`Registering Class 12 test user: ${email12}`);
  const regRes12 = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      email: email12, 
      password, 
      firstName: "Test",
      lastName: "Class12",
      phoneNumber: "1234567890",
      confirmPassword: password
    }),
  });
  const regData12 = await regRes12.json();
  if (!regRes12.ok) throw new Error("Registration failed for Class 12 user: " + JSON.stringify(regData12));
  const token12 = regData12.data?.accessToken;

  // Set Profile stage to Class 12, stream to PCM via DB directly
  await db.update(profiles)
    .set({ currentStage: "Class 12", currentStream: "PCM" })
    .where(eq(profiles.userId, regData12.data.user.id));

  // Start Assessment
  const startRes12 = await fetch(`${API_URL}/assessment/dynamic/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token12}` },
    body: JSON.stringify({ assessmentType: "career_interest" }),
  });
  const startData12 = await startRes12.json();
  if (!startRes12.ok) throw new Error("Failed to start session: " + JSON.stringify(startData12));
  const sessionId12 = startData12.sessionId;
  console.log(`Started Class 12 Dynamic Session: ${sessionId12}`);

  currentQuestion = startData12.nextQuestion ?? startData12.question;
  currentQuestionId = startData12.nextQuestionId ?? startData12.questionId;
  options = startData12.options;
  status = startData12.status;
  turnCount = 1;

  while (status === "continue") {
    // Pick the first option
    const answer = options[0];
    console.log(`[Class 12 - Q${turnCount}] ID: ${currentQuestionId} | Question: "${currentQuestion}"`);
    console.log(`Selecting answer: "${answer}"`);

    const answerRes = await fetch(`${API_URL}/assessment/dynamic/${sessionId12}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token12}` },
      body: JSON.stringify({
        answer,
        questionId: currentQuestionId
      }),
    });

    const answerData = await answerRes.json();
    if (!answerRes.ok) throw new Error("Failed to submit answer: " + JSON.stringify(answerData));

    status = answerData.status;
    currentQuestion = answerData.nextQuestion;
    currentQuestionId = answerData.nextQuestionId;
    options = answerData.options;
    turnCount++;

    if (status === "completed") {
      console.log(`[Class 12 Completion Payload] status: completed, recommendationStatus: ${answerData.recommendationStatus}`);
      break;
    }
  }

  // Fetch results 5 times to verify idempotency and correct types
  console.log("\nQuerying Results API 5 times for Class 12 session...");
  let firstRecSetId12 = null;
  for (let i = 1; i <= 5; i++) {
    const resPage = await fetch(`${API_URL}/assessment/dynamic/${sessionId12}/result`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token12}` }
    });
    const resData = await resPage.json();
    if (!resPage.ok) {
      throw new Error(`Results query ${i} failed: ` + JSON.stringify(resData));
    }
    
    console.log(`[Result Query ${i}] HTTP ${resPage.status}`);
    console.log(`  recommendationSetId: ${resData.recommendationSetId}`);
    console.log(`  academicStage: ${resData.academicStage}`);
    console.log(`  recommendationType: ${resData.recommendationType}`);
    console.log(`  recommendationCount: ${resData.recommendations?.length}`);
    if (resData.recommendations?.length > 0) {
      const types = Array.from(new Set(resData.recommendations.map((r: any) => r.recommendation_type)));
      console.log(`  unique recommendation types in list:`, types);
      // Validate Class 12 constraints
      for (const rec of resData.recommendations) {
        if (rec.recommendation_type !== "CAREER" && rec.recommendation_type !== "COURSE") {
          throw new Error(`Invalid Class 12 recommendation type detected: ${rec.recommendation_type}`);
        }
      }
    }

    if (i === 1) {
      firstRecSetId12 = resData.recommendationSetId;
    } else {
      if (resData.recommendationSetId !== firstRecSetId12) {
        throw new Error("Idempotency failed: recommendationSetId changed on query " + i);
      }
    }
  }

  console.log("\n====================================================");
  console.log("ALL E2E INTEGRATION TESTS PASSED SUCCESSFULLY!");
  console.log("====================================================");
}

runE2ETests().catch((err) => {
  console.error("\n❌ E2E TEST FAILED:");
  console.error(err);
  process.exit(1);
});
