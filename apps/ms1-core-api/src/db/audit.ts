import { db } from "./index";
import { sql } from "drizzle-orm";

async function runAudit() {
  console.log("--- 1. DATABASE SCHEMA VERIFICATION ---");
  const tables = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('personalized_insights', 'academic_direction_courses', 'academic_direction_careers');
  `);
  console.log("Found tables:", tables.rows.map(r => r.table_name));

  const columns = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'personalized_insights';
  `);
  console.log("personalized_insights columns:", columns.rows);

  const constraints = await db.execute(sql`
    SELECT conname, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'personalized_insights';
  `);
  console.log("personalized_insights constraints:", constraints.rows);

  console.log("\n--- 2. SEED VERIFICATION ---");
  
  const countQueries = [
    "academic_directions", "courses", "careers", "skills",
    "academic_direction_courses", "academic_direction_careers", "career_courses"
  ];

  for (const table of countQueries) {
    const count = await db.execute(sql.raw(`SELECT count(*) FROM ${table}`));
    console.log(`${table} count:`, count.rows[0].count);
  }

  console.log("\n--- Path Check ---");
  const paths = await db.execute(sql`
    SELECT ad.slug as dir, c.slug as crs, car.slug as car
    FROM academic_directions ad
    LEFT JOIN academic_direction_courses adc ON adc.academic_direction_id = ad.id
    LEFT JOIN courses c ON adc.course_id = c.id
    LEFT JOIN academic_direction_careers adca ON adca.academic_direction_id = ad.id
    LEFT JOIN careers car ON adca.career_id = car.id
    WHERE ad.slug IN ('science-pcm', 'science-pcb', 'commerce', 'humanities');
  `);
  console.log("Paths found:", paths.rows);

  process.exit(0);
}

runAudit().catch(console.error);
