import { db } from "./index";
import { assessmentSessions } from "./schemas";

async function run() {
  const sessions = await db.select().from(assessmentSessions);
  console.log("Sessions:", sessions);
  process.exit(0);
}

run().catch(console.error);
