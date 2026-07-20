import { db } from "./index";
import { personalizedInsights } from "./schemas";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Truncating personalized_insights to allow unique constraint...");
  await db.execute(sql`TRUNCATE TABLE personalized_insights CASCADE;`);
  console.log("Done.");
  process.exit(0);
}
main();
