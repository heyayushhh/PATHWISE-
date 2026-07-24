import { db } from "./index";
import { academicDirections, careers, careerSkills, skills, academicDirectionCareers } from "./schemas";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function dump() {
  console.log("Fetching enriched career candidates...");
  const dbCareers = await db.select().from(careers);
  
  const dbCareerSkills = await db.select({
    careerId: careerSkills.careerId,
    skillName: skills.name,
    importanceWeight: careerSkills.importanceWeight,
  }).from(careerSkills).innerJoin(skills, eq(careerSkills.skillId, skills.id));

  const dbDirectionCareers = await db.select({
    careerId: academicDirectionCareers.careerId,
    directionSlug: academicDirections.slug,
  }).from(academicDirectionCareers).innerJoin(academicDirections, eq(academicDirectionCareers.academicDirectionId, academicDirections.id));

  const careerCandidates = dbCareers.map(c => {
    const skillsForCareer = dbCareerSkills
      .filter(s => s.careerId === c.id)
      .map(s => ({ name: s.skillName, weight: s.importanceWeight }));
    const directionsForCareer = dbDirectionCareers
      .filter(d => d.careerId === c.id)
      .map(d => d.directionSlug);

    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      type: "CAREER",
      careerFamily: c.careerFamily,
      industry: c.industry,
      educationLevel: c.educationLevel,
      shortDescription: c.shortDescription,
      fullDescription: c.fullDescription,
      typicalResponsibilities: c.typicalResponsibilities,
      educationPathways: c.educationPathways,
      progression: c.progression,
      futureOpportunities: c.futureOpportunities,
      skills: skillsForCareer,
      compatibleDirections: directionsForCareer,
    };
  });

  const dbDirections = await db.select().from(academicDirections);
  const directionCandidates = dbDirections.map(d => ({ id: d.id, slug: d.slug, title: d.title, type: "ACADEMIC_DIRECTION" }));

  const outPath = "C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\636916af-eaf6-4697-9a64-58771e9340e3\\scratch\\candidates.json";
  fs.writeFileSync(outPath, JSON.stringify({ careerCandidates, directionCandidates }, null, 2));
  console.log("Dumped candidates to:", outPath);
}

dump().then(() => process.exit(0)).catch((e) => {
  console.error("Dump failed", e);
  process.exit(1);
});
