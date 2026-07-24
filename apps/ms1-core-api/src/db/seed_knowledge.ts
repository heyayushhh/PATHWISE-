import { db } from "./index";
import {
  academicDirections,
  careers,
  courses,
  skills,
  careerCourses,
  careerSkills,
  courseEligibility,
  academicDirectionCourses,
  academicDirectionCareers
} from "./schemas";
import { eq } from "drizzle-orm";
import { SEED_CAREERS } from "./career_data";

async function seed() {
  console.log("Seeding canonical knowledge...");

  // 0. Clean relational tables to ensure idempotency
  await db.delete(academicDirectionCourses);
  await db.delete(academicDirectionCareers);
  await db.delete(careerCourses);
  await db.delete(careerSkills);
  await db.delete(courseEligibility);

  // 1. Academic Directions (Class 10 Primary Outputs)
  const directionsData = [
    { 
      slug: "science-pcm", 
      title: "Science — PCM", 
      description: "Physics, Chemistry, Mathematics",
      overview: "A rigorous track focused on physical sciences and mathematics, ideal for engineering and technology fields.",
      typicalSubjects: ["Physics", "Chemistry", "Mathematics", "English", "Computer Science"],
      recommendedStrengths: ["Logical Reasoning", "Problem Solving", "Mathematical Aptitude"],
      suitableInterests: ["Technology", "Engineering", "Research"],
      considerations: ["Requires consistent practice in mathematics and conceptual understanding of physics."],
    },
    { 
      slug: "science-pcb", 
      title: "Science — PCB", 
      description: "Physics, Chemistry, Biology",
      overview: "The primary pathway for medical, dental, and life sciences careers.",
      typicalSubjects: ["Physics", "Chemistry", "Biology", "English"],
      recommendedStrengths: ["Memory", "Attention to Detail", "Empathy"],
      suitableInterests: ["Healthcare", "Life Sciences", "Research"],
      considerations: ["Heavy syllabus in Biology, requires long hours of study."],
    },
    { 
      slug: "science-pcmb", 
      title: "Science — PCMB", 
      description: "Physics, Chemistry, Mathematics, Biology",
      overview: "A dual-focus track keeping both engineering and medical options open.",
      typicalSubjects: ["Physics", "Chemistry", "Mathematics", "Biology", "English"],
      recommendedStrengths: ["Hard Work", "Time Management", "Analytical Skills"],
      suitableInterests: ["Technology", "Healthcare"],
      considerations: ["Extremely demanding workload."],
    },
    { 
      slug: "commerce", 
      title: "Commerce", 
      description: "Accounts, Business Studies, Economics",
      overview: "Focuses on trade, business, finance, and economics.",
      typicalSubjects: ["Accountancy", "Business Studies", "Economics", "English"],
      recommendedStrengths: ["Numerical Ability", "Organization", "Commercial Awareness"],
      suitableInterests: ["Business", "Finance", "Management"],
      considerations: ["Without mathematics, some advanced finance/economics degrees might be restricted."],
    },
    { 
      slug: "commerce-math", 
      title: "Commerce with Mathematics", 
      description: "Commerce subjects plus Mathematics",
      overview: "Keeps premium finance and economics courses open.",
      typicalSubjects: ["Accountancy", "Business Studies", "Economics", "Mathematics", "English"],
      recommendedStrengths: ["Numerical Ability", "Analytical Skills"],
      suitableInterests: ["Finance", "Data Analysis", "Management"],
      considerations: ["Requires balancing theoretical commerce with rigorous mathematics."],
    },
    { 
      slug: "humanities", 
      title: "Humanities / Arts", 
      description: "History, Geography, Political Science, Psychology, Sociology",
      overview: "Focuses on human society, culture, and behavior.",
      typicalSubjects: ["History", "Political Science", "Psychology", "Sociology", "English"],
      recommendedStrengths: ["Reading Comprehension", "Writing", "Critical Thinking"],
      suitableInterests: ["Social Sciences", "Law", "Media", "Public Service"],
      considerations: ["Requires extensive reading and essay writing."],
    },
    { 
      slug: "design-creative", 
      title: "Design / Creative", 
      description: "Fine Arts, Design, Mass Media",
      overview: "For students oriented towards visual arts, design, and media.",
      typicalSubjects: ["Fine Arts", "English", "Media Studies"],
      recommendedStrengths: ["Creativity", "Visual Imagination", "Observation"],
      suitableInterests: ["Art", "Design", "Media"],
      considerations: ["Portfolios are often required for higher education admissions."],
    },
    { 
      slug: "vocational", 
      title: "Vocational / Skill-Based", 
      description: "Technical and skill-oriented pathways",
      overview: "Direct preparation for specific trades or technical skills.",
      typicalSubjects: ["IT", "Retail", "Automotive"],
      recommendedStrengths: ["Practical Skills", "Hands-on Learning"],
      suitableInterests: ["Technology", "Trade"],
      considerations: ["May have limited pathways to traditional academic degrees."],
    },
  ];

  for (const dir of directionsData) {
    await db.insert(academicDirections).values(dir).onConflictDoUpdate({
      target: academicDirections.slug,
      set: dir,
    });
  }

  // 2. Careers
  for (const car of SEED_CAREERS) {
    const { compatibleDirections, skills: carSkillsData, courses: carCoursesData, ...coreCar } = car;
    await db.insert(careers).values(coreCar).onConflictDoUpdate({
      target: careers.slug,
      set: coreCar,
    });
  }

  // 3. Courses
  const coursesData = [
    { 
      slug: "btech-cse", title: "B.Tech Computer Science", courseType: "Degree", durationYears: "4.0",
      eligibilityCriteria: ["Class 12 Science with PCM", "Minimum 60% aggregate"],
      entranceExams: ["JEE Main", "JEE Advanced", "BITSAT", "State CETs"],
      majorSubjects: ["Data Structures", "Algorithms", "Operating Systems", "Databases"],
      higherStudyOptions: ["M.Tech CSE", "MS in US/UK", "MBA"]
    },
    { 
      slug: "btech-aiml", title: "B.Tech AI & ML", courseType: "Degree", durationYears: "4.0",
      eligibilityCriteria: ["Class 12 Science with PCM", "Minimum 60% aggregate"],
      entranceExams: ["JEE Main", "State CETs"],
      majorSubjects: ["Machine Learning", "Neural Networks", "Python", "Linear Algebra"],
      higherStudyOptions: ["M.Tech AI", "MS in AI"]
    },
    { 
      slug: "mbbs", title: "MBBS", courseType: "Degree", durationYears: "5.5",
      eligibilityCriteria: ["Class 12 Science with PCB", "Minimum 50% aggregate in PCB"],
      entranceExams: ["NEET-UG"],
      majorSubjects: ["Anatomy", "Physiology", "Biochemistry", "Pathology"],
      higherStudyOptions: ["MD", "MS", "Diplomate of National Board (DNB)"]
    },
    { 
      slug: "bcom", title: "B.Com", courseType: "Degree", durationYears: "3.0",
      eligibilityCriteria: ["Class 12 passing certificate", "Any stream (Commerce preferred)"],
      entranceExams: ["CUET", "Direct Merit"],
      majorSubjects: ["Accounting", "Corporate Law", "Economics", "Taxation"],
      higherStudyOptions: ["M.Com", "MBA", "CA/CS/CMA"]
    },
    { 
      slug: "ba-psychology", title: "BA Psychology", courseType: "Degree", durationYears: "3.0",
      eligibilityCriteria: ["Class 12 passing certificate", "Any stream"],
      entranceExams: ["CUET", "Merit based"],
      majorSubjects: ["General Psychology", "Developmental Psychology", "Research Methods"],
      higherStudyOptions: ["MA Psychology", "M.Sc Clinical Psychology"]
    },
    { 
      slug: "bdes", title: "Bachelor of Design", courseType: "Degree", durationYears: "4.0",
      eligibilityCriteria: ["Class 12 passing certificate", "Any stream"],
      entranceExams: ["NID DAT", "UCEED", "NIFT"],
      majorSubjects: ["Design Fundamentals", "Color Theory", "Typography", "Digital Design"],
      higherStudyOptions: ["M.Des", "MBA"]
    },
  ];

  for (const c of coursesData) {
    await db.insert(courses).values(c).onConflictDoUpdate({
      target: courses.slug,
      set: c,
    });
  }

  // 4. Skills (Gathered dynamically from careers and extra core ones)
  const allSkillsMap = new Map<string, { slug: string; name: string; category: string }>();
  // Seed initial basic skills
  const basicSkills = [
    { slug: "programming", name: "Programming", category: "Technical" },
    { slug: "mathematics", name: "Mathematics", category: "Technical" },
    { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive" },
    { slug: "communication", name: "Communication", category: "Soft" },
    { slug: "creativity", name: "Creativity", category: "Cognitive" },
    { slug: "biology", name: "Biology", category: "Technical" },
  ];
  for (const s of basicSkills) {
    allSkillsMap.set(s.slug, s);
  }
  // Gather from SEED_CAREERS
  for (const car of SEED_CAREERS) {
    for (const sk of car.skills) {
      allSkillsMap.set(sk.slug, {
        slug: sk.slug,
        name: sk.name,
        category: sk.category,
      });
    }
  }

  for (const s of allSkillsMap.values()) {
    await db.insert(skills).values(s).onConflictDoUpdate({
      target: skills.slug,
      set: s,
    });
  }

  // 5. Build Relations (Idempotent fetching of IDs)
  
  // Helpers to get ID by slug
  const getDirId = async (slug: string) => (await db.query.academicDirections.findFirst({ where: eq(academicDirections.slug, slug) }))?.id;
  const getCarId = async (slug: string) => (await db.query.careers.findFirst({ where: eq(careers.slug, slug) }))?.id;
  const getCouId = async (slug: string) => (await db.query.courses.findFirst({ where: eq(courses.slug, slug) }))?.id;
  const getSkiId = async (slug: string) => (await db.query.skills.findFirst({ where: eq(skills.slug, slug) }))?.id;

  const sciencePcmId = await getDirId("science-pcm");
  const sciencePcbId = await getDirId("science-pcb");
  const commerceId = await getDirId("commerce");
  const commerceMathId = await getDirId("commerce-math");
  const humanitiesId = await getDirId("humanities");
  const designId = await getDirId("design-creative");

  const btechCseId = await getCouId("btech-cse");
  const btechAimlId = await getCouId("btech-aiml");
  const mbbsId = await getCouId("mbbs");
  const bcomId = await getCouId("bcom");
  const baPsychId = await getCouId("ba-psychology");
  const bdesId = await getCouId("bdes");

  // Rel: Academic Direction -> Courses
  if (sciencePcmId && btechCseId) await db.insert(academicDirectionCourses).values({ academicDirectionId: sciencePcmId, courseId: btechCseId });
  if (sciencePcmId && btechAimlId) await db.insert(academicDirectionCourses).values({ academicDirectionId: sciencePcmId, courseId: btechAimlId });
  if (sciencePcbId && mbbsId) await db.insert(academicDirectionCourses).values({ academicDirectionId: sciencePcbId, courseId: mbbsId });
  if (commerceId && bcomId) await db.insert(academicDirectionCourses).values({ academicDirectionId: commerceId, courseId: bcomId });
  if (commerceMathId && bcomId) await db.insert(academicDirectionCourses).values({ academicDirectionId: commerceMathId, courseId: bcomId });
  if (humanitiesId && baPsychId) await db.insert(academicDirectionCourses).values({ academicDirectionId: humanitiesId, courseId: baPsychId });
  if (designId && bdesId) await db.insert(academicDirectionCourses).values({ academicDirectionId: designId, courseId: bdesId });

  // Rel: Course Eligibility
  if (btechCseId) {
    await db.insert(courseEligibility).values({
      courseId: btechCseId,
      academicStage: "Class 12",
      allowedStreams: JSON.stringify(["PCM", "PCMB"]),
      mathematicsRequired: true,
      biologyRequired: false,
      minimumPercentage: 60,
    });
  }
  if (btechAimlId) {
    await db.insert(courseEligibility).values({
      courseId: btechAimlId,
      academicStage: "Class 12",
      allowedStreams: JSON.stringify(["PCM", "PCMB"]),
      mathematicsRequired: true,
      biologyRequired: false,
      minimumPercentage: 60,
    });
  }
  if (mbbsId) {
    await db.insert(courseEligibility).values({
      courseId: mbbsId,
      academicStage: "Class 12",
      allowedStreams: JSON.stringify(["PCB", "PCMB"]),
      mathematicsRequired: false,
      biologyRequired: true,
      minimumPercentage: 50,
    });
  }
  if (bcomId) {
    await db.insert(courseEligibility).values({
      courseId: bcomId,
      academicStage: "Class 12",
      allowedStreams: JSON.stringify(["Commerce", "Commerce with Math", "PCM", "PCMB", "Humanities", "Arts"]),
      mathematicsRequired: false,
      biologyRequired: false,
    });
  }
  if (baPsychId) {
    await db.insert(courseEligibility).values({
      courseId: baPsychId,
      academicStage: "Class 12",
      allowedStreams: JSON.stringify(["ANY", "Humanities", "Arts", "Science", "Commerce"]),
      mathematicsRequired: false,
      biologyRequired: false,
    });
  }
  if (bdesId) {
    await db.insert(courseEligibility).values({
      courseId: bdesId,
      academicStage: "Class 12",
      allowedStreams: JSON.stringify(["ANY"]),
      mathematicsRequired: false,
      biologyRequired: false,
    });
  }

  // Loop through SEED_CAREERS to build relations dynamically
  for (const car of SEED_CAREERS) {
    const carId = await getCarId(car.slug);
    if (!carId) continue;

    // Rel: Academic Direction -> Careers
    for (const dirSlug of car.compatibleDirections) {
      const dirId = await getDirId(dirSlug);
      if (dirId) {
        await db.insert(academicDirectionCareers).values({ academicDirectionId: dirId, careerId: carId });
      }
    }

    // Rel: Course -> Careers
    if (car.courses) {
      for (const couSlug of car.courses) {
        const couId = await getCouId(couSlug);
        if (couId) {
          await db.insert(careerCourses).values({ careerId: carId, courseId: couId, isPrimary: true });
        }
      }
    }

    // Rel: Career -> Skills
    for (const sk of car.skills) {
      const skId = await getSkiId(sk.slug);
      if (skId) {
        await db.insert(careerSkills).values({
          careerId: carId,
          skillId: skId,
          importanceWeight: sk.weight
        });
      }
    }
  }

  console.log("Canonical knowledge seeded successfully!");
}

seed().catch((e) => {
  console.error("Seed failed", e);
  process.exit(1);
});