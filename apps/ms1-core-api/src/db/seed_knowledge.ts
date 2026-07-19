import { db } from "./index";
import {
  academicDirections,
  careers,
  courses,
  skills,
  careerCourses,
  careerSkills,
  courseEligibility,
} from "./schemas";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding canonical knowledge...");

  // 1. Academic Directions (Class 10 Primary Outputs)
  const directionsData = [
    { slug: "science-pcm", title: "Science — PCM", description: "Physics, Chemistry, Mathematics" },
    { slug: "science-pcb", title: "Science — PCB", description: "Physics, Chemistry, Biology" },
    { slug: "science-pcmb", title: "Science — PCMB", description: "Physics, Chemistry, Mathematics, Biology" },
    { slug: "commerce", title: "Commerce", description: "Accounts, Business Studies, Economics" },
    { slug: "commerce-math", title: "Commerce with Mathematics", description: "Commerce subjects plus Mathematics" },
    { slug: "humanities", title: "Humanities / Arts", description: "History, Geography, Political Science, Psychology, Sociology" },
    { slug: "design-creative", title: "Design / Creative", description: "Fine Arts, Design, Mass Media" },
    { slug: "vocational", title: "Vocational / Skill-Based", description: "Technical and skill-oriented pathways" },
  ];

  for (const dir of directionsData) {
    await db.insert(academicDirections).values(dir).onConflictDoUpdate({
      target: academicDirections.slug,
      set: { title: dir.title, description: dir.description },
    });
  }

  // 2. Careers (20-30 curated careers)
  const careersData = [
    { slug: "software-engineer", title: "Software Engineer", careerFamily: "Technology", industry: "IT" },
    { slug: "ai-ml-engineer", title: "AI/ML Engineer", careerFamily: "Technology", industry: "IT" },
    { slug: "data-scientist", title: "Data Scientist", careerFamily: "Technology", industry: "IT" },
    { slug: "cybersecurity-analyst", title: "Cybersecurity Analyst", careerFamily: "Technology", industry: "IT" },
    { slug: "mechanical-engineer", title: "Mechanical Engineer", careerFamily: "Engineering", industry: "Manufacturing" },
    { slug: "civil-engineer", title: "Civil Engineer", careerFamily: "Engineering", industry: "Construction" },
    { slug: "electronics-engineer", title: "Electronics Engineer", careerFamily: "Engineering", industry: "Hardware" },
    { slug: "architect", title: "Architect", careerFamily: "Architecture", industry: "Construction" },
    { slug: "doctor", title: "Doctor (MBBS)", careerFamily: "Healthcare", industry: "Medical" },
    { slug: "dentist", title: "Dentist", careerFamily: "Healthcare", industry: "Medical" },
    { slug: "pharmacist", title: "Pharmacist", careerFamily: "Healthcare", industry: "Pharma" },
    { slug: "biotechnologist", title: "Biotechnologist", careerFamily: "Life Sciences", industry: "Research" },
    { slug: "physiotherapist", title: "Physiotherapist", careerFamily: "Healthcare", industry: "Medical" },
    { slug: "psychologist", title: "Psychologist", careerFamily: "Healthcare", industry: "Mental Health" },
    { slug: "chartered-accountant", title: "Chartered Accountant", careerFamily: "Finance", industry: "Finance" },
    { slug: "financial-analyst", title: "Financial Analyst", careerFamily: "Finance", industry: "Finance" },
    { slug: "business-analyst", title: "Business Analyst", careerFamily: "Business", industry: "Corporate" },
    { slug: "marketing-professional", title: "Marketing Professional", careerFamily: "Marketing", industry: "Corporate" },
    { slug: "entrepreneur", title: "Entrepreneur", careerFamily: "Business", industry: "Business" },
    { slug: "lawyer", title: "Lawyer", careerFamily: "Law", industry: "Legal" },
    { slug: "journalist", title: "Journalist", careerFamily: "Media", industry: "Media" },
    { slug: "ux-ui-designer", title: "UX/UI Designer", careerFamily: "Design", industry: "Technology" },
    { slug: "graphic-designer", title: "Graphic Designer", careerFamily: "Design", industry: "Creative" },
  ];

  for (const car of careersData) {
    await db.insert(careers).values(car).onConflictDoUpdate({
      target: careers.slug,
      set: { title: car.title, careerFamily: car.careerFamily, industry: car.industry },
    });
  }

  // 3. Courses
  const coursesData = [
    { slug: "btech-cse", title: "B.Tech Computer Science", courseType: "Degree", durationYears: "4.0" },
    { slug: "btech-aiml", title: "B.Tech AI & ML", courseType: "Degree", durationYears: "4.0" },
    { slug: "btech-ds", title: "B.Tech Data Science", courseType: "Degree", durationYears: "4.0" },
    { slug: "btech-mech", title: "B.Tech Mechanical", courseType: "Degree", durationYears: "4.0" },
    { slug: "btech-civil", title: "B.Tech Civil", courseType: "Degree", durationYears: "4.0" },
    { slug: "barch", title: "B.Arch", courseType: "Degree", durationYears: "5.0" },
    { slug: "mbbs", title: "MBBS", courseType: "Degree", durationYears: "5.5" },
    { slug: "bds", title: "BDS", courseType: "Degree", durationYears: "5.0" },
    { slug: "bpharm", title: "B.Pharm", courseType: "Degree", durationYears: "4.0" },
    { slug: "bsc-biotech", title: "B.Sc Biotechnology", courseType: "Degree", durationYears: "3.0" },
    { slug: "bpt", title: "Bachelor of Physiotherapy", courseType: "Degree", durationYears: "4.5" },
    { slug: "bcom", title: "B.Com", courseType: "Degree", durationYears: "3.0" },
    { slug: "bba", title: "BBA", courseType: "Degree", durationYears: "3.0" },
    { slug: "ba-psychology", title: "BA Psychology", courseType: "Degree", durationYears: "3.0" },
    { slug: "ba-pol-science", title: "BA Political Science", courseType: "Degree", durationYears: "3.0" },
    { slug: "ca", title: "Chartered Accountancy", courseType: "Professional", durationYears: "5.0" },
    { slug: "bdes", title: "Bachelor of Design", courseType: "Degree", durationYears: "4.0" },
    { slug: "llb", title: "LLB", courseType: "Degree", durationYears: "5.0" }, // Integrated
  ];

  for (const c of coursesData) {
    await db.insert(courses).values(c).onConflictDoUpdate({
      target: courses.slug,
      set: { title: c.title, courseType: c.courseType, durationYears: c.durationYears },
    });
  }

  // 4. Skills
  const skillsData = [
    { slug: "programming", name: "Programming", category: "Technical" },
    { slug: "mathematics", name: "Mathematics", category: "Technical" },
    { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive" },
    { slug: "communication", name: "Communication", category: "Soft" },
    { slug: "creativity", name: "Creativity", category: "Cognitive" },
    { slug: "leadership", name: "Leadership", category: "Soft" },
    { slug: "biology", name: "Biology", category: "Technical" },
    { slug: "problem-solving", name: "Problem Solving", category: "Cognitive" },
    { slug: "design-thinking", name: "Design Thinking", category: "Cognitive" },
  ];

  for (const s of skillsData) {
    await db.insert(skills).values(s).onConflictDoUpdate({
      target: skills.slug,
      set: { name: s.name, category: s.category },
    });
  }

  console.log("Canonical knowledge seeded successfully!");
}

seed().catch((e) => {
  console.error("Seed failed", e);
  process.exit(1);
});