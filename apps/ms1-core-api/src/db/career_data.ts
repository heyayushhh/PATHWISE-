export interface SeedCareer {
  slug: string;
  title: string;
  careerFamily: string;
  industry: string;
  educationLevel: string;
  shortDescription: string;
  fullDescription: string;
  typicalResponsibilities: string[];
  educationPathways: string[];
  progression: string[];
  futureOpportunities: string[];
  compatibleDirections: string[];
  skills: { slug: string; name: string; category: string; weight: string }[];
  courses?: string[];
}

export const SEED_CAREERS: SeedCareer[] = [
  // TECHNOLOGY / PCM
  {
    slug: "software-engineer",
    title: "Software Engineer",
    careerFamily: "Technology",
    industry: "IT",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design, build, and maintain software applications and systems.",
    fullDescription: "Software Engineers design and develop software solutions across platforms. They apply computer science principles to build systems, write code, debug applications, and collaborate with cross-functional teams.",
    typicalResponsibilities: ["Writing clean, scalable code", "Collaborating on system design and architecture", "Debugging and resolving software defects", "Conducting code reviews and testing"],
    educationPathways: ["B.Tech/B.E. in Computer Science", "BCA followed by MCA", "B.Sc in Computer Science / IT"],
    progression: ["Junior Developer -> Senior Developer -> Tech Lead -> Software Architect"],
    futureOpportunities: ["High growth globally in cloud computing, SaaS platforms, and enterprise solutions."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ],
    courses: ["btech-cse"]
  },
  {
    slug: "ai-ml-engineer",
    title: "AI/ML Engineer",
    careerFamily: "Technology",
    industry: "IT",
    educationLevel: "Bachelor's/Master's Degree",
    shortDescription: "Build and deploy machine learning models and artificial intelligence systems.",
    fullDescription: "AI/ML Engineers develop machine learning algorithms and deep learning models. They process large datasets, train neural networks, and optimize AI models for deployment in production systems.",
    typicalResponsibilities: ["Developing machine learning models", "Data preprocessing and feature engineering", "Optimizing algorithms for production", "Collaborating with data scientists on model design"],
    educationPathways: ["B.Tech in CS with AI/ML specialization", "M.Tech in Artificial Intelligence", "B.Sc/M.Sc in Statistics / Data Science"],
    progression: ["Associate ML Engineer -> ML Engineer -> Lead AI Scientist -> Chief AI Architect"],
    futureOpportunities: ["Exponential demand driven by generative AI, LLMs, computer vision, and automation."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.95" },
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ],
    courses: ["btech-aiml"]
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    careerFamily: "Technology",
    industry: "IT",
    educationLevel: "Bachelor's/Master's Degree",
    shortDescription: "Analyze complex data to help businesses make informed decisions.",
    fullDescription: "Data Scientists leverage statistical modeling, machine learning, and data analysis to uncover hidden insights. They interpret complex datasets, build predictive models, and communicate findings to business stakeholders.",
    typicalResponsibilities: ["Analyzing structured and unstructured data", "Building predictive models and statistical algorithms", "Creating data visualizations and dashboards", "Presenting insights to business executives"],
    educationPathways: ["B.Sc/M.Sc in Statistics or Mathematics", "B.Tech in Computer Science / Data Science", "MBA in Business Analytics"],
    progression: ["Data Analyst -> Data Scientist -> Lead Data Scientist -> Director of Analytics"],
    futureOpportunities: ["Crucial role across finance, retail, healthcare, and tech sectors to drive data-centric decisions."],
    compatibleDirections: ["science-pcm", "science-pcmb", "commerce-math"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.90" },
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ],
    courses: ["btech-cse"]
  },
  {
    slug: "data-analyst",
    title: "Data Analyst",
    careerFamily: "Technology",
    industry: "IT",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Collect, process, and perform statistical analyses on structured data.",
    fullDescription: "Data Analysts examine data patterns to solve business problems. They gather data from databases, clean it, write SQL queries, create visualizations, and deliver reports to optimize operations.",
    typicalResponsibilities: ["Writing SQL queries to extract data", "Cleaning and organizing datasets", "Developing BI dashboards and reports", "Identifying operational bottlenecks via data trends"],
    educationPathways: ["B.Com/B.Sc/B.Tech/BBA", "Diploma in Data Analytics", "Certifications in SQL, Tableau, PowerBI"],
    progression: ["Junior Data Analyst -> Data Analyst -> Senior Analyst -> Analytics Manager"],
    futureOpportunities: ["High entry-level demand across almost all modern corporate sectors."],
    compatibleDirections: ["science-pcm", "science-pcmb", "commerce-math", "commerce"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ],
    courses: ["bcom"]
  },
  {
    slug: "cybersecurity-engineer",
    title: "Cybersecurity Engineer",
    careerFamily: "Technology",
    industry: "IT",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Protect computer systems, networks, and data from cyber attacks.",
    fullDescription: "Cybersecurity Engineers build secure networks and system architectures. They identify vulnerabilities, monitor networks for suspicious activity, implement firewalls, and respond to security breaches.",
    typicalResponsibilities: ["Monitoring systems for security breaches", "Designing and implementing security infrastructure", "Performing vulnerability testing and risk assessments", "Responding to active cyber threats and incidents"],
    educationPathways: ["B.Tech/B.E. in IT or Cybersecurity", "B.Sc in Cyber Security", "Certifications like CEH, CISSP, CompTIA Security+"],
    progression: ["Security Analyst -> Cybersecurity Engineer -> Security Architect -> CISO"],
    futureOpportunities: ["Critical field with severe global talent shortages due to rising cyber threats."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ],
    courses: ["btech-cse"]
  },
  {
    slug: "cloud-engineer",
    title: "Cloud Engineer",
    careerFamily: "Technology",
    industry: "IT",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design, implement, and manage cloud computing infrastructure.",
    fullDescription: "Cloud Engineers manage cloud architectures, migrate on-premise infrastructure to cloud providers (AWS, Azure, Google Cloud), and ensure the scalability, security, and reliability of cloud systems.",
    typicalResponsibilities: ["Designing cloud architecture and deployment setups", "Configuring AWS/Azure/GCP resources", "Automating infrastructure deployment", "Optimizing cloud spending and performance"],
    educationPathways: ["B.Tech/B.E. in CSE/IT", "BCA/B.Sc Computer Science", "Cloud Certifications (AWS Solutions Architect, Google Professional Cloud Architect)"],
    progression: ["Cloud Support Associate -> Cloud Engineer -> Cloud Architect -> Director of Cloud Infrastructure"],
    futureOpportunities: ["Strong growth as businesses globally shift from physical servers to hybrid cloud systems."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ],
    courses: ["btech-cse"]
  },
  {
    slug: "devops-engineer",
    title: "DevOps Engineer",
    careerFamily: "Technology",
    industry: "IT",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Bridge the gap between software development and IT operations.",
    fullDescription: "DevOps Engineers build CI/CD pipelines, automate deployments, and manage system operations. They improve release cycles, implement infrastructure as code (IaC), and monitor system performance.",
    typicalResponsibilities: ["Building CI/CD pipelines", "Writing Infrastructure as Code scripts", "Managing containerized apps using Docker & Kubernetes", "Monitoring server health and uptime"],
    educationPathways: ["B.Tech/B.E. in Computer Science/IT", "B.Sc Computer Science", "DevOps certifications (Kubernetes, Jenkins, Terraform)"],
    progression: ["Systems Administrator / Developer -> DevOps Engineer -> Lead DevOps -> Site Reliability Manager"],
    futureOpportunities: ["Highly sought after by tech companies looking to speed up software deployment cycles."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ],
    courses: ["btech-cse"]
  },
  {
    slug: "robotics-engineer",
    title: "Robotics Engineer",
    careerFamily: "Engineering",
    industry: "Hardware",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design, build, and test robotic systems and autonomous machines.",
    fullDescription: "Robotics Engineers work at the intersection of mechanical, electrical, and software engineering. They design robotic arms, autonomous vehicles, and automated manufacturing systems.",
    typicalResponsibilities: ["Designing mechanical systems for robots", "Programming robotic control algorithms", "Integrating sensors and electrical circuits", "Testing autonomous navigation systems"],
    educationPathways: ["B.Tech in Robotics / Mechatronics / Mechanical Engineering", "B.Tech in Electrical / Electronics Engineering", "M.Tech in Robotics / Control Systems"],
    progression: ["Associate Engineer -> Robotics Engineer -> Systems Architect -> Director of Robotics R&D"],
    futureOpportunities: ["Expanding rapidly in manufacturing automation, medical robotics, warehouse logistics, and self-driving cars."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.85" },
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "aerospace-engineer",
    title: "Aerospace Engineer",
    careerFamily: "Engineering",
    industry: "Aerospace",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design and build aircraft, spacecraft, satellites, and missiles.",
    fullDescription: "Aerospace Engineers design, test, and manufacture airplanes, rockets, satellites, and space probes. They analyze structural integrity, aerodynamics, propulsion systems, and guidance mechanisms.",
    typicalResponsibilities: ["Designing aerospace structures and components", "Performing aerodynamic simulations", "Testing propulsion systems", "Analyzing flight telemetry and structural integrity"],
    educationPathways: ["B.Tech/B.E. in Aerospace / Aeronautical Engineering", "B.Tech in Mechanical Engineering", "M.Tech in Aerospace Systems"],
    progression: ["Junior Aerospace Engineer -> Systems Engineer -> Lead Aerospace Engineer -> Chief Mission Scientist"],
    futureOpportunities: ["Growth driven by commercial space exploration, satellite communications, and military defense aviation."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "mechanical-engineer",
    title: "Mechanical Engineer",
    careerFamily: "Engineering",
    industry: "Manufacturing",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design, analyze, and manufacture mechanical devices and machines.",
    fullDescription: "Mechanical Engineers design and build anything that moves—from small micro-sensors to large turbines and automobile engines. They use CAD tools, material science, and thermodynamics to develop physical products.",
    typicalResponsibilities: ["Creating 3D mechanical drawings and CAD designs", "Analyzing thermal and fluid systems", "Troubleshooting mechanical failures", "Overseeing manufacturing processes"],
    educationPathways: ["B.Tech/B.E. in Mechanical Engineering", "Diploma in Mechanical Engineering", "M.Tech in Machine Design / Thermal Science"],
    progression: ["Junior Engineer -> Production Engineer -> Design Engineer -> Engineering Manager"],
    futureOpportunities: ["Core industry stability, with newer opportunities in electric vehicles (EV), renewable energy, and robotics."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "civil-engineer",
    title: "Civil Engineer",
    careerFamily: "Engineering",
    industry: "Construction",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design, construct, and supervise infrastructure projects.",
    fullDescription: "Civil Engineers plan and execute public and private infrastructure projects like roads, bridges, dams, airports, tunnels, and water systems. They ensure structural safety, environmental compliance, and cost management.",
    typicalResponsibilities: ["Creating structural blueprints and plans", "Inspecting construction sites for safety and compliance", "Estimating material costs and project timelines", "Managing construction crews"],
    educationPathways: ["B.Tech/B.E. in Civil Engineering", "Diploma in Civil Engineering", "M.Tech in Structural / Transportation Engineering"],
    progression: ["Site Engineer -> Project Manager -> Structural Engineer -> Chief Infrastructure Officer"],
    futureOpportunities: ["Sustained demand driven by global urbanization and smart city projects."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "electrical-engineer",
    title: "Electrical Engineer",
    careerFamily: "Engineering",
    industry: "Energy",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Develop and supervise electrical systems and power generation assets.",
    fullDescription: "Electrical Engineers design electrical equipment, power grids, lighting, and electrical systems for buildings and industrial complexes. They focus on generation, distribution, and control of electrical energy.",
    typicalResponsibilities: ["Designing power distribution networks", "Testing electrical equipment and circuitry", "Supervising installation of electric systems", "Developing control systems for generators"],
    educationPathways: ["B.Tech/B.E. in Electrical Engineering", "M.Tech in Power Systems / Control Systems"],
    progression: ["Junior Electrical Engineer -> Grid Engineer -> Electrical Project Manager -> Power Plant Manager"],
    futureOpportunities: ["High growth in smart grids, electric vehicle charging networks, and solar/wind energy systems."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "electronics-engineer",
    title: "Electronics Engineer",
    careerFamily: "Engineering",
    industry: "Hardware",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design and test electronic circuits, microchips, and transmitters.",
    fullDescription: "Electronics Engineers design consumer electronics, communication devices, microprocessors, and integrated circuits. They research semiconductors and work on circuit systems used in computing and aerospace.",
    typicalResponsibilities: ["Designing printed circuit boards (PCBs)", "Developing firmware and hardware layouts", "Testing electronic components and signal processing", "Debugging electronic equipment"],
    educationPathways: ["B.Tech/B.E. in Electronics and Communication Engineering (ECE)", "M.Tech in VLSI / Embedded Systems"],
    progression: ["Hardware Engineer -> VLSI Design Engineer -> Embedded Systems Architect -> VP of Hardware"],
    futureOpportunities: ["Expanding role in Internet of Things (IoT), semiconductor manufacturing, and telecommunications (5G/6G)."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "computer-hardware-engineer",
    title: "Computer Hardware Engineer",
    careerFamily: "Engineering",
    industry: "Hardware",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Research, design, and test computer chips, circuit boards, and processors.",
    fullDescription: "Computer Hardware Engineers develop physical hardware components that power laptops, servers, smartphones, and supercomputers. They design memory chips, motherboards, routers, and processing units.",
    typicalResponsibilities: ["Designing computer processor architectures", "Testing hardware prototypes and logic gates", "Analyzing circuit bottlenecks and thermal layouts", "Collaborating with software teams on device drivers"],
    educationPathways: ["B.Tech/B.E. in Computer Engineering", "B.Tech in ECE with focus on Computing Architecture"],
    progression: ["Hardware Engineer -> Chip Architect -> Hardware Design Specialist -> Principal Hardware Architect"],
    futureOpportunities: ["Steadily growing field with demand in high-performance computing, AI accelerator chips, and custom silicon."],
    compatibleDirections: ["science-pcm", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "game-developer",
    title: "Game Developer",
    careerFamily: "Technology",
    industry: "Entertainment",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Develop game mechanics, rendering systems, and software code for video games.",
    fullDescription: "Game Developers write the programming code that brings video games to life. They utilize game engines (Unity, Unreal) to program game physics, user interfaces, player controls, and graphics logic.",
    typicalResponsibilities: ["Programming game mechanics and features", "Integrating audio, animations, and assets", "Optimizing game performance and frame rates", "Fixing software bugs in game builds"],
    educationPathways: ["B.Tech in Computer Science / Game Development", "B.Sc in Game Design & Development", "Self-taught portfolio using Unity/C# or Unreal/C++"],
    progression: ["Junior Game Developer -> Lead Game Programmer -> Tech Director -> Studio CTO"],
    futureOpportunities: ["Huge international entertainment sector, with emerging avenues in VR, AR, and mobile gaming."],
    compatibleDirections: ["science-pcm", "science-pcmb", "design-creative"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.95" },
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "quantitative-analyst",
    title: "Quantitative Analyst",
    careerFamily: "Finance",
    industry: "Finance",
    educationLevel: "Master's/Ph.D.",
    shortDescription: "Apply mathematical and statistical methods to financial and risk management problems.",
    fullDescription: "Quantitative Analysts (Quants) develop complex mathematical models used by investment banks and hedge funds to price securities, manage risk, and identify profitable algorithmic trading strategies.",
    typicalResponsibilities: ["Developing financial mathematical models", "Writing algorithm backtesting code", "Performing statistical analysis on market datasets", "Designing risk management frameworks"],
    educationPathways: ["B.Tech/M.Tech in CS or Mathematics", "M.Sc in Quantitative Finance / Financial Mathematics", "Ph.D in Physics / Mathematics / Engineering"],
    progression: ["Junior Quant -> Quantitative Developer -> Portfolio Manager -> Head of Quantitative Research"],
    futureOpportunities: ["Highly competitive, lucrative sector with growth in high-frequency trading and algorithmic assets."],
    compatibleDirections: ["science-pcm", "science-pcmb", "commerce-math"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.95" },
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "architect",
    title: "Architect",
    careerFamily: "Design",
    industry: "Construction",
    educationLevel: "Bachelor's Degree (B.Arch)",
    shortDescription: "Plan, design, and oversee the construction of buildings and structures.",
    fullDescription: "Architects create aesthetic, functional, and safe designs for buildings and spatial structures. They combine artistic vision with engineering principles, considering building materials, zoning laws, and environmental impact.",
    typicalResponsibilities: ["Designing building layouts and blueprints", "Creating 3D models and CAD blueprints", "Consulting with clients and engineers", "Monitoring construction site progress"],
    educationPathways: ["B.Arch (Bachelor of Architecture)", "M.Arch (Master of Architecture)"],
    progression: ["Junior Architect -> Project Architect -> Senior Architect -> Architectural Partner / Studio Owner"],
    futureOpportunities: ["Steady career with expanding opportunities in sustainable architecture and smart space planning."],
    compatibleDirections: ["science-pcm", "science-pcmb", "design-creative"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.80" }
    ]
  },

  // HEALTHCARE / PCB
  {
    slug: "doctor",
    title: "Doctor (MBBS)",
    careerFamily: "Healthcare",
    industry: "Medical",
    educationLevel: "MBBS (Mandatory)",
    shortDescription: "Diagnose, treat, and prevent illnesses in patients.",
    fullDescription: "Doctors diagnose acute and chronic medical conditions, prescribe medication, perform clinical examinations, and run surgical or non-surgical treatments. They specialize in areas like cardiology, pediatrics, or oncology.",
    typicalResponsibilities: ["Consulting with and diagnosing patients", "Prescribing medicines and treatments", "Performing clinical operations or surgeries", "Managing medical records and clinical reports"],
    educationPathways: ["MBBS (5.5 years)", "MD/MS (Postgraduation specialization)", "Super-specialty (DM/MCh)"],
    progression: ["Junior Resident -> Senior Resident -> Medical Consultant -> Department Head -> Hospital Director"],
    futureOpportunities: ["Extremely secure, recession-proof field with continuous demand for healthcare practitioners."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.95" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" }
    ],
    courses: ["mbbs"]
  },
  {
    slug: "dentist",
    title: "Dentist",
    careerFamily: "Healthcare",
    industry: "Medical",
    educationLevel: "BDS (Mandatory)",
    shortDescription: "Diagnose and treat diseases related to teeth, gums, and mouth.",
    fullDescription: "Dentists specialize in oral health. They perform dental cleanings, extract teeth, fit crowns/bridges, treat root canals, perform oral surgeries, and advise patients on dental hygiene.",
    typicalResponsibilities: ["Diagnosing oral health issues", "Performing dental procedures (fillings, extractions, root canals)", "Fitting dental appliances", "Educating patients on oral care"],
    educationPathways: ["BDS (Bachelor of Dental Surgery)", "MDS (Master of Dental Surgery)"],
    progression: ["Clinical Dentist -> Senior Associate -> Private Clinic Owner -> Dental Specialist"],
    futureOpportunities: ["Steady, self-employment potential through private dental clinics and cosmetological dental care."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.90" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.85" }
    ]
  },
  {
    slug: "pharmacist",
    title: "Pharmacist",
    careerFamily: "Healthcare",
    industry: "Medical",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Dispense medications and advise patients and healthcare providers.",
    fullDescription: "Pharmacists understand chemical compositions and clinical effects of drugs. They dispense medicines, ensure safe dosages, counsel patients on side effects, and manage pharmacy logistics.",
    typicalResponsibilities: ["Dispensing prescribed medications", "Ensuring correct dosage and usage details", "Consulting with patients on drug side effects", "Managing pharmacy inventories"],
    educationPathways: ["B.Pharm (Bachelor of Pharmacy)", "M.Pharm / Pharm.D (Doctor of Pharmacy)"],
    progression: ["Retail Pharmacist -> Hospital Pharmacist -> Clinical Pharmacist -> Pharmacy Manager -> Drug Inspector"],
    futureOpportunities: ["Stable career with growing opportunities in clinical research and pharmaceutical logistics."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.85" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.80" }
    ]
  },
  {
    slug: "physiotherapist",
    title: "Physiotherapist",
    careerFamily: "Healthcare",
    industry: "Medical",
    educationLevel: "Bachelor's Degree (BPT)",
    shortDescription: "Help patients recover physical mobility and manage pain after injuries.",
    fullDescription: "Physiotherapists treat physical dysfunctions caused by injury, disease, or aging. They use physical exercises, massage therapy, heat treatment, and stretches to rebuild muscle strength and mobility.",
    typicalResponsibilities: ["Assessing patients' physical range of motion", "Creating customized recovery exercise plans", "Administering manual therapy and stretches", "Tracking patients' progress during recovery"],
    educationPathways: ["BPT (Bachelor of Physiotherapy)", "MPT (Master of Physiotherapy)"],
    progression: ["Junior Physiotherapist -> Sports Physiotherapist -> Clinic Owner -> Head of Physiotherapy"],
    futureOpportunities: ["Growing focus on sports fitness, orthopedic recovery, and ergonomic health."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.85" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" }
    ]
  },
  {
    slug: "veterinarian",
    title: "Veterinarian",
    careerFamily: "Healthcare",
    industry: "Medical",
    educationLevel: "B.V.Sc & AH (Mandatory)",
    shortDescription: "Diagnose, treat, and perform surgeries on domestic and wild animals.",
    fullDescription: "Veterinarians care for animals' health. They diagnose illnesses, administer vaccines, perform surgeries on pets, livestock, and zoo animals, and consult on animal husbandry and public health safety.",
    typicalResponsibilities: ["Diagnosing animal illnesses", "Performing surgeries and setting bone fractures", "Vaccinating animals against diseases", "Advising pet owners on nutrition and care"],
    educationPathways: ["B.V.Sc & AH (Bachelor of Veterinary Science & Animal Husbandry) (5.5 years)", "M.V.Sc (Master of Veterinary Science)"],
    progression: ["Vet Consultant -> Vet Surgeon -> Clinic Director -> Zoo Vet / Wildlife Conservator"],
    futureOpportunities: ["Sustained demand for pet clinics, animal shelters, livestock farming, and wild animal reserves."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.95" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.85" }
    ]
  },
  {
    slug: "clinical-researcher",
    title: "Clinical Researcher",
    careerFamily: "Healthcare",
    industry: "Pharmaceuticals",
    educationLevel: "Bachelor's/Master's Degree",
    shortDescription: "Conduct clinical trials and research studies to test new drug safety.",
    fullDescription: "Clinical Researchers design and monitor clinical trials. They analyze data on how new medicines interact with patients, ensuring compliance with strict regulatory safety standards.",
    typicalResponsibilities: ["Designing clinical trial protocols", "Monitoring trials at hospitals or clinics", "Analyzing patient health data", "Preparing regulatory safety reports"],
    educationPathways: ["B.Sc/M.Sc in Clinical Research", "B.Pharm/M.Pharm", "MBBS / BDS grads looking for research careers"],
    progression: ["Clinical Trial Assistant -> Clinical Research Associate (CRA) -> Lead Researcher -> Director of Clinical Operations"],
    futureOpportunities: ["High growth in vaccine development and personalized medicine research."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "biotechnologist",
    title: "Biotechnologist",
    careerFamily: "Healthcare",
    industry: "Biotech",
    educationLevel: "Bachelor's/Master's Degree",
    shortDescription: "Use biological organisms to develop products and solve problems.",
    fullDescription: "Biotechnologists study biological organisms at genetic and molecular levels. They manipulate genomes to engineer pharmaceuticals, agricultural crops, and industrial chemical solutions.",
    typicalResponsibilities: ["Conducting genetic engineering laboratory experiments", "Developing cell cultures and protein compounds", "Designing biofuels or genetically modified crops", "Analyzing DNA sequencing data"],
    educationPathways: ["B.Tech/B.Sc in Biotechnology", "M.Tech/M.Sc in Biotechnology", "Ph.D in Biotech/Genetics"],
    progression: ["Lab Technician -> Research Associate -> Biotech Scientist -> R&D Director"],
    futureOpportunities: ["Expanding role in green energy, sustainable agriculture, and advanced medical therapies."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "microbiologist",
    title: "Microbiologist",
    careerFamily: "Healthcare",
    industry: "Research",
    educationLevel: "Bachelor's/Master's Degree",
    shortDescription: "Study microscopic organisms like bacteria, viruses, and fungi.",
    fullDescription: "Microbiologists study microbes and pathogens. They analyze viral propagation, bacterial infections, agricultural mold, and develop antibiotics and sanitization processes.",
    typicalResponsibilities: ["Culturing bacterial and viral samples", "Testing food or water samples for contamination", "Developing vaccine concepts and antibiotics", "Documenting microbial growth behavior"],
    educationPathways: ["B.Sc/M.Sc in Microbiology", "Ph.D in Microbiology / Virology"],
    progression: ["Quality Control Assistant -> Microbiologist -> Senior Research Scientist -> Lab Director"],
    futureOpportunities: ["Essential roles in public health defense, food safety, water sanitation, and pharmaceutical production."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "biomedical-scientist",
    title: "Biomedical Scientist",
    careerFamily: "Healthcare",
    industry: "Medical Research",
    educationLevel: "Master's/Ph.D.",
    shortDescription: "Analyze biological samples to diagnose and investigate diseases.",
    fullDescription: "Biomedical Scientists work in pathology laboratories and research centers. They analyze blood, tissue, and fluid samples to help clinicians diagnose cancer, infectious diseases, and metabolic disorders.",
    typicalResponsibilities: ["Analyzing tissue samples under microscopes", "Running hematological and pathological tests", "Developing laboratory diagnostics protocols", "Investigating disease transmission pathology"],
    educationPathways: ["B.Sc/M.Sc in Biomedical Science", "Ph.D in Pathology / Cellular Biology"],
    progression: ["Lab Specialist -> Biomedical Scientist -> Lab Supervisor -> Principal Scientific Officer"],
    futureOpportunities: ["Steady career pathways in diagnostic chains, oncology institutes, and national medical labs."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "nutritionist-dietitian",
    title: "Nutritionist/Dietitian",
    careerFamily: "Healthcare",
    industry: "Wellness",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Advise clients on healthy eating and plan nutritional diets.",
    fullDescription: "Nutritionists and Dietitians design healthy diet plans based on medical needs and personal fitness goals. They manage clinical nutrition in hospitals, sports institutions, and corporate health setups.",
    typicalResponsibilities: ["Assessing clients' nutritional habits and health stats", "Designing personalized calorie/diet charts", "Counseling patients on diabetic/cardiac diets", "Managing school or hospital catering nutrition plans"],
    educationPathways: ["B.Sc/M.Sc in Nutrition & Dietetics", "Post Graduate Diploma in Dietetics", "Registered Dietitian (RD) certification"],
    progression: ["Dietary Consultant -> Clinical Nutritionist -> Head Dietitian -> Wellness Entrepreneur"],
    futureOpportunities: ["Booming sector with increased awareness in personal wellness, sports nutrition, and disease management."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.80" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" }
    ]
  },
  {
    slug: "genetic-counselor",
    title: "Genetic Counselor",
    careerFamily: "Healthcare",
    industry: "Medical",
    educationLevel: "Master's Degree",
    shortDescription: "Assess genetic risks and counsel families on inherited conditions.",
    fullDescription: "Genetic Counselors analyze genetic test results to assess DNA predispositions to cancers, congenital diseases, or rare disorders. They guide expecting parents and oncology patients through diagnostic choices.",
    typicalResponsibilities: ["Analyzing genetic testing datasets", "Evaluating family histories for hereditary disease risk", "Counseling patients on genetic predispositions", "Collaborating with pediatricians and obstetricians"],
    educationPathways: ["B.Sc in Biology/Genetics", "M.Sc in Genetic Counseling / Medical Genetics"],
    progression: ["Counselor -> Genetics Specialist -> Lead Genetic Counselor -> Clinical Genetics Director"],
    futureOpportunities: ["Rapidly growing specialized field driven by breakthroughs in prenatal DNA scanning and genomic oncology."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.90" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" }
    ]
  },
  {
    slug: "public-health-specialist",
    title: "Public Health Specialist",
    careerFamily: "Healthcare",
    industry: "Public Sector",
    educationLevel: "Master's Degree (MPH)",
    shortDescription: "Design policies and campaigns to prevent outbreaks and improve community health.",
    fullDescription: "Public Health Specialists analyze epidemiological data, study healthcare access, design vaccination campaigns, manage sanitary policies, and coordinate disaster responses with NGOs and governments.",
    typicalResponsibilities: ["Analyzing epidemiology and disease transmission statistics", "Designing community health education campaigns", "Formulating healthcare delivery policies", "Coordinating field health programs"],
    educationPathways: ["B.Sc in Biology/Healthcare", "MPH (Master of Public Health)", "B.Sc/M.Sc in Community Health"],
    progression: ["Program Coordinator -> Public Health Officer -> Epidemiologist -> Director of Health Program"],
    futureOpportunities: ["Expanding role in governmental planning, NGO healthcare initiatives, and WHO programs."],
    compatibleDirections: ["science-pcb", "science-pcmb", "humanities"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.75" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "neuroscience-researcher",
    title: "Neuroscience Researcher",
    careerFamily: "Healthcare",
    industry: "Research",
    educationLevel: "Ph.D. (Required)",
    shortDescription: "Study the brain and nervous system to understand behaviors and neurological illnesses.",
    fullDescription: "Neuroscience Researchers study nervous system anatomy and brain signaling. They investigate neurodegenerative diseases like Alzheimer's, psychiatric disorders, brain mapping, and develop neural interface systems.",
    typicalResponsibilities: ["Conducting laboratory neurological experiments", "Performing MRI / EEG brain scan analyses", "Analyzing neural signal datasets", "Publishing peer-reviewed scientific studies"],
    educationPathways: ["B.Sc/M.Sc in Neuroscience / Biology / Physiology", "Ph.D in Neuroscience / Neurobiology"],
    progression: ["Research Assistant -> Postdoctoral Fellow -> Assistant Professor -> Neuroscience Lab Director"],
    futureOpportunities: ["Prestigious research sector, with emerging projects in brain-computer interfaces (BCI) and neuropharmacology."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.95" }
    ]
  },

  // PCMB / INTERDISCIPLINARY SCIENCE
  {
    slug: "biomedical-engineer",
    title: "Biomedical Engineer",
    careerFamily: "Engineering",
    industry: "Medical Technology",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design medical instruments, prosthetic devices, and healthcare machines.",
    fullDescription: "Biomedical Engineers apply engineering principles to medicine and biology. They design ventilators, heart pacemakers, MRI scanners, artificial limbs, and clinical software programs.",
    typicalResponsibilities: ["Designing bio-electronic medical instruments", "Developing blueprints for artificial organs and prosthetics", "Testing clinical equipment for electrical safety", "Training hospital technicians on diagnostic machines"],
    educationPathways: ["B.Tech/B.E. in Biomedical Engineering", "B.Tech in Electronics/Mechanical with M.Tech in Biomedical"],
    progression: ["Clinical Engineer -> Biomedical Design Engineer -> R&D Manager -> VP of Medical Devices"],
    futureOpportunities: ["Robust growth with the development of home-care IoT diagnostics and next-gen prostheses."],
    compatibleDirections: ["science-pcmb", "science-pcm", "science-pcb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.80" },
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "bioinformatics-specialist",
    title: "Bioinformatics Specialist",
    careerFamily: "Technology",
    industry: "Biotech",
    educationLevel: "Bachelor's/Master's Degree",
    shortDescription: "Apply computational tools and databases to analyze genomic datasets.",
    fullDescription: "Bioinformatics Specialists write algorithms to decode complex DNA, RNA, and protein sequencing data. They build genetic databases and run software algorithms to map mutations.",
    typicalResponsibilities: ["Running DNA sequence alignment algorithms", "Maintaining gene annotation databases", "Writing scripts (Python/R) to parse genetic statistics", "Collaborating on structural biology modeling"],
    educationPathways: ["B.Tech/B.Sc in Bioinformatics", "M.Tech/M.Sc in Bioinformatics / Computational Biology", "B.Tech CSE with PG Diploma in Bioinformatics"],
    progression: ["Bioinformatics Analyst -> Research Scientist -> Lead Bioinformatician -> R&D Director"],
    futureOpportunities: ["Expanding rapidly in personalized oncology, clinical gene editing (CRISPR), and vaccine design."],
    compatibleDirections: ["science-pcmb", "science-pcm", "science-pcb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.90" },
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "computational-biologist",
    title: "Computational Biologist",
    careerFamily: "Technology",
    industry: "Research",
    educationLevel: "Master's/Ph.D.",
    shortDescription: "Build mathematical models to simulate and analyze complex biological systems.",
    fullDescription: "Computational Biologists construct computational simulations to predict how proteins fold, how drugs interact with cells, and how viruses spread. They use high-performance computer clusters and modeling software.",
    typicalResponsibilities: ["Designing mathematical models of cell systems", "Simulating drug-protein molecular binding", "Coding structural modeling simulations", "Analyzing computational biological datasets"],
    educationPathways: ["B.Sc/B.Tech in Computational Biology", "M.Sc/M.Tech in Computational Biology / Bioinformatics", "Ph.D in Biophysics / Systems Biology"],
    progression: ["Computational Analyst -> Research Scientist -> Senior Researcher -> Director of Systems Biology"],
    futureOpportunities: ["High relevance in computational drug design, reducing the duration of lab testing for vaccine prototypes."],
    compatibleDirections: ["science-pcmb", "science-pcm", "science-pcb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.85" },
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.85" },
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "biotechnology-researcher",
    title: "Biotechnology Researcher",
    careerFamily: "Healthcare",
    industry: "Pharmaceuticals",
    educationLevel: "Master's/Ph.D.",
    shortDescription: "Conduct lab research to engineer biomaterials and clinical therapeutics.",
    fullDescription: "Biotechnology Researchers work in advanced laboratories to design stem cell therapies, synthetic enzymes, and therapeutic proteins. They publish scientific papers and register pharmaceutical patents.",
    typicalResponsibilities: ["Engineering cell lines and bio-compounds", "Running biochemical essays and laboratory trials", "Writing research papers and patent filings", "Managing lab equipment and reagent safety"],
    educationPathways: ["B.Sc/M.Sc in Biotechnology", "Ph.D in Biotechnology / Molecular Biology"],
    progression: ["Research Assistant -> Scientist -> Senior R&D Scientist -> Scientific Advisor"],
    futureOpportunities: ["Elite research roles in pharmaceutical multi-nationals and national bioprocessing centers."],
    compatibleDirections: ["science-pcmb", "science-pcb", "science-pcm"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "health-data-scientist",
    title: "Health Data Scientist",
    careerFamily: "Technology",
    industry: "Healthcare IT",
    educationLevel: "Bachelor's/Master's Degree",
    shortDescription: "Analyze electronic health records and clinical data to optimize medical systems.",
    fullDescription: "Health Data Scientists merge data science skills with clinical knowledge. They analyze patient outcomes, predict hospital admissions, optimize clinical flows, and build diagnostic algorithms.",
    typicalResponsibilities: ["Cleaning health record datasets", "Developing models to predict patient risks", "Visualizing health metrics for hospital managers", "Ensuring data privacy and HIPAA compliance"],
    educationPathways: ["B.Tech/B.Sc in Data Science / Computer Science", "M.Sc in Health Informatics / Biostatistics"],
    progression: ["Data Analyst -> Health Data Scientist -> Chief Medical Informatics Officer"],
    futureOpportunities: ["Expanding rapidly in smart hospital systems, telemedicine networks, and health insurance automation."],
    compatibleDirections: ["science-pcmb", "science-pcm", "science-pcb"],
    skills: [
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.90" },
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },

  // COMMERCE / FINANCE / BUSINESS
  {
    slug: "chartered-accountant",
    title: "Chartered Accountant",
    careerFamily: "Finance",
    industry: "Auditing & Tax",
    educationLevel: "CA Certification (Mandatory)",
    shortDescription: "Provide auditing, tax advice, and financial reporting solutions for firms.",
    fullDescription: "Chartered Accountants review financial books, certify tax files, ensure corporate financial laws are followed, and offer strategic budgeting and tax advice to companies and individuals.",
    typicalResponsibilities: ["Auditing company accounts", "Preparing and filing corporate tax returns", "Consulting on financial laws and budget mergers", "Signing off on financial audit certifications"],
    educationPathways: ["CA Foundation -> Intermediate -> Final exams (administered by ICAI)", "B.Com / M.Com helps during preparation"],
    progression: ["Articled Assistant -> Associate CA -> Senior Audit Manager -> Finance Director / CFO"],
    futureOpportunities: ["Essential professional certification with stable, highly respected corporate pathways."],
    compatibleDirections: ["commerce", "commerce-math"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.80" }
    ],
    courses: ["bcom"]
  },
  {
    slug: "company-secretary",
    title: "Company Secretary",
    careerFamily: "Business",
    industry: "Corporate Governance",
    educationLevel: "CS Certification (Mandatory)",
    shortDescription: "Ensure companies comply with all corporate legal and regulatory frameworks.",
    fullDescription: "Company Secretaries act as governance advisors to boards of directors. They manage legal paperwork, draft board resolutions, ensure compliance with corporate governance, and coordinate board meetings.",
    typicalResponsibilities: ["Ensuring compliance with company laws", "Drafting minutes of board of directors meetings", "Filing corporate legal filings with registries", "Advising directors on legal responsibilities"],
    educationPathways: ["CS Foundation -> Executive -> Professional exams (administered by ICSI)", "Bachelor of Laws (LL.B.) is highly complementary"],
    progression: ["Compliance Officer -> Company Secretary -> Chief Legal Officer / Governance Director"],
    futureOpportunities: ["Mandatory designation for all mid-to-large corporate boards, ensuring stable career openings."],
    compatibleDirections: ["commerce", "commerce-math", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "cost-management-accountant",
    title: "Cost and Management Accountant",
    careerFamily: "Finance",
    industry: "Manufacturing & Operations",
    educationLevel: "CMA Certification (Mandatory)",
    shortDescription: "Analyze cost structures to optimize production and operational budgets.",
    fullDescription: "Cost and Management Accountants (CMAs) calculate manufacturing costs, analyze budgets, audit raw material spending, and design pricing models to optimize corporate profit margins.",
    typicalResponsibilities: ["Auditing operational manufacturing costs", "Formulating cost optimization budgets", "Reviewing pricing models for products", "Tracking raw material supply chain budgets"],
    educationPathways: ["CMA Foundation -> Intermediate -> Final exams (ICMAI)", "B.Com / MBA Operations"],
    progression: ["Cost Assistant -> Cost Accountant -> Cost Audit Head -> Chief Operations Controller"],
    futureOpportunities: ["Sustained demand in heavy manufacturing, automotive, logistics, and pharmaceutical industries."],
    compatibleDirections: ["commerce", "commerce-math"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "financial-analyst",
    title: "Financial Analyst",
    careerFamily: "Finance",
    industry: "Banking",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Evaluate market data and financial records to guide investment decisions.",
    fullDescription: "Financial Analysts examine corporate balance sheets, track stock market trends, build financial projection models, and draft reports on investment risks and opportunities.",
    typicalResponsibilities: ["Analyzing company balance sheets and cash flows", "Building Excel financial forecasting models", "Writing stock/bond market research reports", "Consulting on capital investment plans"],
    educationPathways: ["B.Com / BBA Finance", "MBA in Finance", "CFA (Chartered Financial Analyst) charter"],
    progression: ["Junior Analyst -> Financial Analyst -> Senior Portfolio Manager -> Chief Investment Officer (CIO)"],
    futureOpportunities: ["Strong growth in mutual fund houses, wealth management firms, and corporate strategy teams."],
    compatibleDirections: ["commerce-math", "commerce", "science-pcm"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "investment-banker",
    title: "Investment Banker",
    careerFamily: "Finance",
    industry: "Corporate Finance",
    educationLevel: "Bachelor's/MBA (Top-tier)",
    shortDescription: "Assist corporations in raising capital and managing mergers and acquisitions.",
    fullDescription: "Investment Bankers assist corporations in raising debt or equity capital, pricing Initial Public Offerings (IPOs), organizing corporate mergers, and conducting large-scale capital restructuring.",
    typicalResponsibilities: ["Conducting corporate valuation analyses", "Structuring merger and acquisition deals", "Drafting IPO prospectuses", "Pitching transaction structures to corporate boards"],
    educationPathways: ["MBA in Finance (from premier business schools)", "B.Com / B.Tech / Eco (Hons) followed by CFA"],
    progression: ["Analyst -> Associate -> Vice President (VP) -> Managing Director (MD)"],
    futureOpportunities: ["Elite corporate career with high compensation potential, primarily located in major financial hubs."],
    compatibleDirections: ["commerce-math", "commerce", "science-pcm"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.80" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "actuary",
    title: "Actuary",
    careerFamily: "Finance",
    industry: "Insurance",
    educationLevel: "Actuarial Exams (Mandatory)",
    shortDescription: "Calculate risks and set pricing models for insurance firms and pensions.",
    fullDescription: "Actuaries use advanced mathematical probability, statistics, and financial theories to analyze the risk of future events. They design insurance policies and set pension fund payout structures.",
    typicalResponsibilities: ["Analyzing accident, mortality, and weather statistics", "Setting pricing premiums for insurance policies", "Designing corporate risk mitigation policies", "Evaluating pension fund liabilities"],
    educationPathways: ["B.Sc/M.Sc in Mathematics / Statistics", "Actuarial Professional Exams (administered by IAI / IFoA)"],
    progression: ["Actuarial Analyst -> Associate Actuary -> Fellow Actuary -> Chief Risk Officer"],
    futureOpportunities: ["Highly specialized, secure profession with expanding roles in climate risk auditing and tech startups."],
    compatibleDirections: ["commerce-math", "science-pcm", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "1.00" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.95" }
    ]
  },
  {
    slug: "economist",
    title: "Economist",
    careerFamily: "Finance",
    industry: "Research & Government",
    educationLevel: "Master's/Ph.D. (Preferred)",
    shortDescription: "Study economic systems, market trends, and design fiscal policies.",
    fullDescription: "Economists analyze production, distribution, and consumption of goods. They study inflation, unemployment, trade deficits, interest rates, and design policies for central banks or international agencies.",
    typicalResponsibilities: ["Building macroeconomic models", "Analyzing inflation and trade trends", "Advising central banks or policy think-tanks", "Publishing economic research papers"],
    educationPathways: ["B.A./B.Sc in Economics", "M.A./M.Sc in Economics", "Ph.D in Economics"],
    progression: ["Research Associate -> Economist -> Senior Policy Advisor -> Chief Economist"],
    futureOpportunities: ["Prestigious advisory roles in ministries, central banks (RBI), international funds (IMF), and corporate strategy."],
    compatibleDirections: ["commerce-math", "humanities"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "business-analyst",
    title: "Business Analyst",
    careerFamily: "Business",
    industry: "Management",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Bridge the gap between business needs and IT systems.",
    fullDescription: "Business Analysts evaluate business processes, define operational requirements, and coordinate with engineering teams to design software tools that optimize company workflows.",
    typicalResponsibilities: ["Gathering user requirements for IT developers", "Mapping and optimizing business process flows", "Conducting cost-benefit project analyses", "Coordinating software user acceptance testing"],
    educationPathways: ["BBA / B.Com", "B.Tech followed by MBA", "Certifications in Agile / Scrum methodology"],
    progression: ["Associate Consultant -> Business Analyst -> Lead Analyst -> Director of Business Transformation"],
    futureOpportunities: ["Steady, highly collaborative role with consistent demand across corporate services and consulting."],
    compatibleDirections: ["commerce", "commerce-math", "science-pcm", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "management-consultant",
    title: "Management Consultant",
    careerFamily: "Business",
    industry: "Consulting",
    educationLevel: "Bachelor's/MBA (Top-tier)",
    shortDescription: "Advise senior executives on restructuring, scaling, and growth strategies.",
    fullDescription: "Management Consultants work with corporate clients to solve complex organizational problems. They advise on cost reduction, market entry, post-merger integration, and technology implementation.",
    typicalResponsibilities: ["Analyzing client cost and operational datasets", "Conducting market competitor research", "Presenting strategic plans to client CEOs", "Facilitating corporate restructuring workshops"],
    educationPathways: ["MBA from premier business schools", "B.Tech / B.Com / Eco (Hons) followed by consulting interviews"],
    progression: ["Associate Analyst -> Consultant -> Project Leader -> Partner / Managing Director"],
    futureOpportunities: ["Prestigious, high-exposure consulting career working with Fortune 500 leadership Teams."],
    compatibleDirections: ["commerce-math", "commerce", "science-pcm", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "entrepreneur",
    title: "Entrepreneur",
    careerFamily: "Business",
    industry: "Startup",
    educationLevel: "No Specific Degree Required",
    shortDescription: "Launch and build new commercial ventures or startup firms.",
    fullDescription: "Entrepreneurs identify market gaps, raise investment capital, develop products, assemble teams, and manage operations to build scalable business ventures.",
    typicalResponsibilities: ["Formulating startup business models", "Pitching ideas to venture capitalists", "Hiring and managing initial core teams", "Overseeing product sales and operations"],
    educationPathways: ["BBA / B.Com / B.Tech", "MBA (Entrepreneurship)", "Accelerators / incubators"],
    progression: ["Founder -> CEO -> Serial Entrepreneur -> Venture Capitalist"],
    futureOpportunities: ["High-risk, high-reward path with immense potential to create economic value and jobs."],
    compatibleDirections: ["commerce", "commerce-math", "science-pcm", "design-creative", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "marketing-manager",
    title: "Marketing Manager",
    careerFamily: "Business",
    industry: "Marketing",
    educationLevel: "Bachelor's/MBA",
    shortDescription: "Oversee brand advertising, lead generation, and digital campaigns.",
    fullDescription: "Marketing Managers plan advertising strategies, manage promotional budgets, run digital campaigns, and build brand awareness to drive product sales.",
    typicalResponsibilities: ["Planning brand advertising budgets", "Coordinating digital SEO and social media campaigns", "Analyzing marketing campaign ROI metrics", "Collaborating with design and sales teams"],
    educationPathways: ["BBA (Marketing)", "MBA (Marketing)", "Certifications in Digital Marketing"],
    progression: ["Marketing Executive -> Brand Manager -> CMO (Chief Marketing Officer)"],
    futureOpportunities: ["Sustained demand driven by the digital transition of consumer goods and e-commerce brands."],
    compatibleDirections: ["commerce", "commerce-math", "humanities", "design-creative"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "hr-manager",
    title: "Human Resources Manager",
    careerFamily: "Business",
    industry: "Corporate Services",
    educationLevel: "Bachelor's/MBA (HR)",
    shortDescription: "Oversee recruitment, employee relations, and talent management.",
    fullDescription: "Human Resources Managers oversee hiring pipelines, design employee benefits, manage labor compliance, resolve disputes, and coordinate performance reviews.",
    typicalResponsibilities: ["Managing employee recruitment and hiring", "Designing company policies and benefits", "Resolving workplace disputes", "Organizing employee training programs"],
    educationPathways: ["BBA (HR)", "MBA in Human Resource Management", "M.A. in Psychology / Industrial Relations"],
    progression: ["HR Executive -> HR Manager -> HR Director -> CHRO (Chief Human Resources Officer)"],
    futureOpportunities: ["Crucial role as companies focus on corporate culture and talent retention."],
    compatibleDirections: ["commerce", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" }
    ]
  },
  {
    slug: "product-manager",
    title: "Product Manager",
    careerFamily: "Business",
    industry: "IT",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Guide the design, engineering, and launch of software products.",
    fullDescription: "Product Managers (PMs) define the vision and roadmaps for digital products. They act as bridges between software developers, UI/UX designers, and business managers to coordinate product releases.",
    typicalResponsibilities: ["Defining product feature requirements", "Managing product release roadmaps", "Analyzing user feedback data", "Coordinating across design and tech teams"],
    educationPathways: ["B.Tech/BE in CS/IT", "BBA/B.Com followed by MBA", "Product Management bootcamps"],
    progression: ["Associate Product Manager -> Product Manager -> Director of Product -> Chief Product Officer"],
    futureOpportunities: ["Highly sought after in technology hubs and e-commerce companies."],
    compatibleDirections: ["science-pcm", "commerce-math", "commerce", "design-creative", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "fintech-analyst",
    title: "FinTech Analyst",
    careerFamily: "Finance",
    industry: "Finance",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Apply digital technology solutions to optimize financial services.",
    fullDescription: "FinTech Analysts work with digital payment systems, blockchain technology, and automated banking services. They analyze financial data and help develop technological systems for payments and lending.",
    typicalResponsibilities: ["Analyzing digital payment metrics", "Evaluating blockchain/cryptocurrency projects", "Testing online financial apps", "Reviewing compliance for digital lending"],
    educationPathways: ["B.Com / B.Tech CSE", "MBA in FinTech / Finance", "Certifications in Blockchain / Python"],
    progression: ["FinTech Analyst -> Senior Consultant -> Product Lead (FinTech) -> Chief Innovation Officer"],
    futureOpportunities: ["Huge expansion driven by mobile banking, digital payment networks, and smart contracts."],
    compatibleDirections: ["commerce-math", "science-pcm", "commerce"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.80" },
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },

  // HUMANITIES / SOCIAL SCIENCE
  {
    slug: "lawyer",
    title: "Lawyer / Advocate",
    careerFamily: "Humanities",
    industry: "Legal",
    educationLevel: "LL.B. (Mandatory)",
    shortDescription: "Advise clients, draft contracts, and represent them in courts.",
    fullDescription: "Lawyers research legal regulations, write court petitions, draft business contracts, and argue cases in courts of law. They specialize in corporate law, criminal litigation, or intellectual property rights.",
    typicalResponsibilities: ["Representing clients in court litigations", "Drafting corporate and legal contracts", "Conducting legal precedent research", "Advising clients on dispute resolutions"],
    educationPathways: ["Integrated B.A. LL.B. (5 years)", "LL.B. (3 years after graduation)", "LL.M. (Master of Laws)"],
    progression: ["Junior Advocate -> Senior Associate -> Law Partner -> Senior Counsel / Judge"],
    futureOpportunities: ["Stable, highly respected field with growing focus on intellectual property, cybersecurity, and corporate mergers."],
    compatibleDirections: ["humanities", "commerce", "commerce-math"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "psychologist",
    title: "Psychologist",
    careerFamily: "Healthcare",
    industry: "Mental Health",
    educationLevel: "Master's/M.Phil.",
    shortDescription: "Assess human behavior and provide clinical mental health therapy.",
    fullDescription: "Psychologists study cognitive patterns and human behavior. They provide mental health counseling, run diagnostic tests, treat anxiety or depression, and advise on corporate wellness programs.",
    typicalResponsibilities: ["Conducting patient counseling sessions", "Administering cognitive and personality tests", "Designing behavioral treatment plans", "Conducting group therapy workshops"],
    educationPathways: ["B.A./B.Sc in Psychology", "M.A./M.Sc in Clinical Psychology", "M.Phil / Ph.D in Psychology"],
    progression: ["Counselor -> Clinical Psychologist -> Senior Consultant -> Clinic Director / Researcher"],
    futureOpportunities: ["High growth due to destigmatization and focus on mental wellbeing in clinics and schools."],
    compatibleDirections: ["humanities", "science-pcb", "science-pcmb"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.80" }
    ],
    courses: ["ba-psychology"]
  },
  {
    slug: "journalist",
    title: "Journalist",
    careerFamily: "Humanities",
    industry: "Media",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Report news and write articles for television, print, and digital media.",
    fullDescription: "Journalists investigate current events, interview public figures, write investigative reports, and present news stories on digital platforms, television channels, or newspapers.",
    typicalResponsibilities: ["Investigating local and international news", "Interviewing subjects and public officials", "Writing articles and script updates", "Anchoring news broadcasts"],
    educationPathways: ["B.J.M.C. (Journalism & Mass Comm)", "M.A. in Journalism", "B.A. English / Political Science"],
    progression: ["Reporter -> Senior Correspondent -> Bureau Chief -> Editor-in-Chief"],
    futureOpportunities: ["Evolving role with massive expansion in digital reporting, podcasts, and independent news platforms."],
    compatibleDirections: ["humanities", "design-creative"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.80" }
    ]
  },
  {
    slug: "civil-services",
    title: "Civil Services Officer",
    careerFamily: "Humanities",
    industry: "Government",
    educationLevel: "Bachelor's Degree (Any)",
    shortDescription: "Administer districts and design governmental public policies.",
    fullDescription: "Civil Services Officers (IAS, IPS, IFS) manage administrative districts, implement development programs, maintain law and order, and draft national/state policy agendas.",
    typicalResponsibilities: ["Overseeing district law and order", "Supervising welfare fund distributions", "Drafting state development schemes", "Managing public departments"],
    educationPathways: ["Bachelor's Degree in any discipline", "UPSC Civil Services Examination (CSE) preparation"],
    progression: ["Sub-Divisional Magistrate -> District Magistrate -> Secretary to Government"],
    futureOpportunities: ["Highly prestigious public leadership careers with massive social impact and administrative authority."],
    compatibleDirections: ["humanities", "commerce", "commerce-math", "science-pcm", "science-pcb"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "international-relations-specialist",
    title: "International Relations Specialist",
    careerFamily: "Humanities",
    industry: "Foreign Affairs",
    educationLevel: "Master's Degree",
    shortDescription: "Analyze foreign policies and manage international diplomatic relations.",
    fullDescription: "International Relations Specialists study global trade policies, border disputes, human rights, and advise diplomatic missions, global organizations (UN), or research think-tanks.",
    typicalResponsibilities: ["Analyzing foreign policy databases", "Drafting research reports on border trades", "Consulting on human rights protocols", "Coordinating international workshops"],
    educationPathways: ["B.A. in Political Science", "M.A. in International Relations / Diplomacy"],
    progression: ["Research Analyst -> Foreign Service Officer -> Embassy Attaché -> Ambassador"],
    futureOpportunities: ["Selective, prestigious roles in foreign ministries, globally active NGOs, and international trade bodies."],
    compatibleDirections: ["humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "sociologist",
    title: "Sociologist",
    careerFamily: "Humanities",
    industry: "Social Research",
    educationLevel: "Master's/Ph.D.",
    shortDescription: "Study social structures, community behaviors, and cultural patterns.",
    fullDescription: "Sociologists examine community interactions, family patterns, religious traditions, and demographic changes. They run surveys, analyze census statistics, and write academic research papers.",
    typicalResponsibilities: ["Designing public surveys and field interviews", "Analyzing qualitative demographic reports", "Writing academic papers on social structures", "Consulting on urban housing schemes"],
    educationPathways: ["B.A. Sociology", "M.A. Sociology", "Ph.D in Sociology"],
    progression: ["Survey Researcher -> Sociologist -> Research Director -> Academic Professor"],
    futureOpportunities: ["Key roles in urban policy think-tanks, social research firms, and demographic centers."],
    compatibleDirections: ["humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.85" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "policy-analyst",
    title: "Policy Analyst",
    careerFamily: "Humanities",
    industry: "Government Policy",
    educationLevel: "Master's Degree",
    shortDescription: "Evaluate public laws and propose regulatory changes to government ministries.",
    fullDescription: "Policy Analysts study draft legislations, analyze the economic and social effects of public programs, and write briefs to help government ministries or NGOs refine policies.",
    typicalResponsibilities: ["Analyzing drafts of legal bills", "Authoring policy recommendation briefs", "Coordinating with government stakeholder groups", "Evaluating welfare spending indicators"],
    educationPathways: ["B.A. in Political Science/Economics", "Master in Public Policy (MPP) / Public Administration"],
    progression: ["Research Associate -> Policy Analyst -> Senior Policy Advisor -> Director of Policy R&D"],
    futureOpportunities: ["Expanding demand in corporate governance relations, environmental think-tanks, and state secretariats."],
    compatibleDirections: ["humanities", "commerce-math"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "teacher-educator",
    title: "Teacher / Educator",
    careerFamily: "Humanities",
    industry: "Education",
    educationLevel: "Bachelor of Education (B.Ed.)",
    shortDescription: "Instruct students in academic subjects and manage school curriculums.",
    fullDescription: "Teachers present academic lessons, grade assignments, prepare report cards, and manage classroom activities. They guide children's educational and social-emotional growth.",
    typicalResponsibilities: ["Planning academic class lectures", "Evaluating student exams and homework", "Consulting with parents on child progress", "Coordinating school events"],
    educationPathways: ["B.A./B.Sc in core subject followed by B.Ed", "Integrated B.A. B.Ed (4 years)", "CTET (Central Teacher Eligibility Test)"],
    progression: ["Assistant Teacher -> Subject Coordinator -> Vice Principal -> School Principal"],
    futureOpportunities: ["Stable employment across public and private school networks, with rising opportunities in online teaching platforms."],
    compatibleDirections: ["humanities", "science-pcm", "science-pcb", "commerce"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" }
    ]
  },
  {
    slug: "content-strategist",
    title: "Content Strategist",
    careerFamily: "Humanities",
    industry: "Media",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Plan, write, and manage digital content campaigns and brand narratives.",
    fullDescription: "Content Strategists plan brand newsletters, write blog articles, outline video scripts, and manage editorial calendars. They align written copy with digital marketing goals.",
    typicalResponsibilities: ["Outlining digital content schedules", "Writing blog articles and website copy", "Researching target audience search habits", "Collaborating on video script boards"],
    educationPathways: ["B.A. in English / Mass Comm", "BBA in Marketing", "Portfolio of digital writing samples"],
    progression: ["Copywriter -> Content Strategist -> Content Director -> Brand Strategist"],
    futureOpportunities: ["High growth in e-commerce, digital branding agencies, and corporate content teams."],
    compatibleDirections: ["humanities", "design-creative", "commerce"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" },
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.85" }
    ]
  },

  // DESIGN / CREATIVE / MEDIA
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    careerFamily: "Design",
    industry: "IT",
    educationLevel: "Bachelor's Degree (Preferred)",
    shortDescription: "Design intuitive interfaces and user flows for mobile apps and websites.",
    fullDescription: "UI/UX Designers structure user flows, build wireframes, and design screen layouts for applications and websites. They align interface designs with user research testing.",
    typicalResponsibilities: ["Creating screen wireframes and app prototypes", "Designing user interfaces in Figma", "Conducting usability test interviews", "Coordinating with software developers"],
    educationPathways: ["B.Des (Bachelor of Design) in Interaction / Digital Design", "Certifications in UI/UX Design", "Online portfolio of design projects"],
    progression: ["Junior UI/UX Designer -> Senior Designer -> UX Architect -> Design Director"],
    futureOpportunities: ["Critical software industry demand driven by mobile-first apps and digital product launches."],
    compatibleDirections: ["design-creative", "science-pcm", "humanities"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.80" }
    ]
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    careerFamily: "Design",
    industry: "Manufacturing",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design physical products and consumer goods for manufacturing.",
    fullDescription: "Product Designers combine aesthetics, material science, and engineering to design physical consumer items—from furniture and toys to smart devices and automobile dashboards.",
    typicalResponsibilities: ["Sketching physical product ideas", "Modeling prototypes in 3D CAD software", "Researching material safety and packaging costs", "Consulting with manufacturing engineers"],
    educationPathways: ["B.Des (Product Design)", "B.Tech in Mechanical Engineering followed by M.Des"],
    progression: ["Junior Product Designer -> Industrial Designer -> Lead Designer -> VP of Product Design"],
    futureOpportunities: ["Expanding role in smart electronics, home appliances, and sustainable eco-packaging design."],
    compatibleDirections: ["design-creative", "science-pcm"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.80" }
    ]
  },
  {
    slug: "graphic-designer",
    title: "Graphic Designer",
    careerFamily: "Design",
    industry: "Creative",
    educationLevel: "Bachelor's/Diploma",
    shortDescription: "Create visual designs and illustrations for branding and marketing.",
    fullDescription: "Graphic Designers use typography, photography, and illustration to convey visual ideas. They design corporate logos, marketing brochures, product packages, and digital social media banners.",
    typicalResponsibilities: ["Designing brand logos and color cards", "Editing images using Photoshop/Illustrator", "Designing corporate marketing pamphlets", "Reviewing print proofs for layout quality"],
    educationPathways: ["B.Des / BFA (Bachelor of Fine Arts)", "Diploma in Graphic Design", "Portfolio of visual artwork"],
    progression: ["Junior Designer -> Visual Designer -> Art Director -> Creative Director"],
    futureOpportunities: ["Steady, highly collaborative role with consistent freelance and agency avenues."],
    compatibleDirections: ["design-creative", "humanities"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.80" }
    ],
    courses: ["bdes"]
  },
  {
    slug: "animator",
    title: "Animator / VFX Artist",
    careerFamily: "Design",
    industry: "Entertainment",
    educationLevel: "Bachelor's/Diploma",
    shortDescription: "Create 2D/3D animations and visual effects for movies and games.",
    fullDescription: "Animators create sequential frames of drawings, models, or computer animations. VFX artists engineer visual illusions, combining CGI with live footage for cinema and video games.",
    typicalResponsibilities: ["Modeling 3D characters and structural textures", "Rigging skeletal structures for animation", "Creating visual explosion or water effects", "Rendering composite video scenes"],
    educationPathways: ["B.Sc in Animation & VFX", "B.Des in Animation", "Diploma in 3D Modeling (Maya/Blender)"],
    progression: ["Junior Animator -> Character Animator -> VFX Supervisor -> Studio Creative Director"],
    futureOpportunities: ["Fast growth driven by cinema VFX, animated series, and digital game assets."],
    compatibleDirections: ["design-creative", "humanities"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" }
    ]
  },
  {
    slug: "game-designer",
    title: "Game Designer",
    careerFamily: "Design",
    industry: "Entertainment",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Design game storyboards, levels, characters, and rules of engagement.",
    fullDescription: "Game Designers act as the writers and directors of games. They design game mechanics, write dialogue, map out game levels, adjust game difficulties, and coordinate with developers.",
    typicalResponsibilities: ["Writing game storyboard design scripts", "Structuring level puzzles and layouts", "Balancing system mechanics and rules", "Drafting user flow documents"],
    educationPathways: ["B.Des / B.Sc in Game Design", "B.A. in Creative Writing / Literature followed by game courses"],
    progression: ["Level Designer -> Game Designer -> Systems Designer -> Creative Director (Games)"],
    futureOpportunities: ["Evolving role with massive expansion in digital interactive storytelling and online gaming platforms."],
    compatibleDirections: ["design-creative", "humanities", "science-pcm"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.85" }
    ]
  },
  {
    slug: "film-video-producer",
    title: "Film/Video Producer",
    careerFamily: "Design",
    industry: "Entertainment",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Coordinate and manage movie, television, and advertisement video productions.",
    fullDescription: "Producers manage video projects from script to screen. They coordinate budgets, manage filming crews, schedule editing timelines, and oversee marketing distributions.",
    typicalResponsibilities: ["Securing filming budgets and funding", "Hiring directors, actors, and camera crews", "Managing filming schedules and permits", "Coordinating editing and sound mixes"],
    educationPathways: ["Bachelor of Film & Television Production", "B.J.M.C. (Mass Comm)", "B.A. English / Theater"],
    progression: ["Production Assistant -> Associate Producer -> Film Producer -> Studio Exec"],
    futureOpportunities: ["Expanding role in OTT platforms (Netflix, Amazon Prime), digital commercial agencies, and online channels."],
    compatibleDirections: ["design-creative", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "content-creator",
    title: "Content Creator",
    careerFamily: "Design",
    industry: "Media",
    educationLevel: "No Specific Degree Required",
    shortDescription: "Produce online video and educational content for digital platforms.",
    fullDescription: "Content Creators write, edit, and host videos, podcasts, and digital blogs. They build online communities, collaborate on brand sponsorships, and monetize digital channels.",
    typicalResponsibilities: ["Filming and editing video projects", "Writing scripting boards", "Analyzing platform search engine data", "Managing social media brand campaigns"],
    educationPathways: ["B.J.M.C. / B.Des / B.A. Literature", "Diploma in Video Editing (Premiere Pro / Final Cut)"],
    progression: ["Independent Creator -> Channel Owner -> Media Entrepreneur -> Studio Owner"],
    futureOpportunities: ["Fast-growing modern career with high brand monetization potential."],
    compatibleDirections: ["design-creative", "humanities"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" }
    ]
  },
  {
    slug: "fashion-designer",
    title: "Fashion Designer",
    careerFamily: "Design",
    industry: "Apparel",
    educationLevel: "Bachelor's Degree (B.Des)",
    shortDescription: "Design apparel, clothing lines, footwear, and fashion accessories.",
    fullDescription: "Fashion Designers study fashion trends, sketch clothing designs, select fabrics and patterns, and oversee prototype stitching for clothing lines and commercial brands.",
    typicalResponsibilities: ["Sketching custom apparel shapes", "Choosing clothing fabrics and patterns", "Sewing design prototypes", "Coordinating fashion runway listings"],
    educationPathways: ["B.Des in Fashion Design (NIFT, NID)", "Diploma in Apparel Design"],
    progression: ["Design Assistant -> Fashion Designer -> Head of Apparel -> Fashion Brand Owner"],
    futureOpportunities: ["Steady, highly competitive industry with expanding focus on sustainable fashion brands and global e-commerce exports."],
    compatibleDirections: ["design-creative", "humanities"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" }
    ]
  },
  {
    slug: "interior-designer",
    title: "Interior Designer",
    careerFamily: "Design",
    industry: "Construction",
    educationLevel: "Bachelor's/Diploma",
    shortDescription: "Design safe, functional, and aesthetic indoor living and work spaces.",
    fullDescription: "Interior Designers plan room layouts, select color palettes, specify furniture, design lighting plans, and coordinate spatial construction for homes, offices, and hotels.",
    typicalResponsibilities: ["Sketching indoor space floorplans", "Selecting furniture, paint cards, and floor tiles", "Modeling layouts in 3D AutoCAD", "Managing budget lists with construction crews"],
    educationPathways: ["B.Des / B.Sc in Interior Design", "Diploma in Interior Design"],
    progression: ["Interior Consultant -> Senior Designer -> Project Manager -> Interior Studio Owner"],
    futureOpportunities: ["Sustained demand driven by residential styling and commercial office restructuring."],
    compatibleDirections: ["design-creative", "humanities", "science-pcm"],
    skills: [
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.95" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.85" }
    ]
  },

  // SPORTS
  {
    slug: "professional-athlete",
    title: "Professional Athlete",
    careerFamily: "Sports",
    industry: "Athletics",
    educationLevel: "Physical Training (Mandatory)",
    shortDescription: "Compete in national and international tournaments in a specific sport.",
    fullDescription: "Professional Athletes train intensively to compete in regional, national, and international athletic matches. They work with coaches, follow strict diets, study gameplay, and represent sports clubs.",
    typicalResponsibilities: ["Undergoing daily physical fitness routines", "Practicing sports skills and strategies", "Competing in league matches and tournaments", "Managing public brand endorsements"],
    educationPathways: ["Intensive sports academy training from childhood", "B.P.Ed (Bachelor of Physical Education) is optional"],
    progression: ["Academy Player -> Club Player -> National Athlete -> Sports Coach / Advisor"],
    futureOpportunities: ["High-exposure, high-stakes career with career transitions into coaching and media."],
    compatibleDirections: ["vocational", "humanities", "commerce", "science-pcb", "science-pcm"],
    skills: [
      { slug: "sports-performance", name: "Sports Performance", category: "Physical", weight: "1.00" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.75" }
    ]
  },
  {
    slug: "sports-coach",
    title: "Sports Coach",
    careerFamily: "Sports",
    industry: "Athletics",
    educationLevel: "Bachelor's Degree / Certification",
    shortDescription: "Train athletes and coordinate tactics for sports teams.",
    fullDescription: "Sports Coaches teach rules and skills of sports. They organize training camps, design game strategies, analyze competitor recordings, and manage team selections.",
    typicalResponsibilities: ["Organizing player training schedules", "Analyzing gameplay recordings for strategies", "Coordinating team lineups and substitutions", "Mentoring athletes on game rules"],
    educationPathways: ["B.P.Ed (Bachelor of Physical Education)", "Diplomas from National Institute of Sports (NIS)", "Coaching licenses (e.g. AFC, BCCI, etc.)"],
    progression: ["School Coach -> Academy Coach -> Club Head Coach -> National Team Coach"],
    futureOpportunities: ["Expanding role in private fitness academies, school networks, and professional sports leagues."],
    compatibleDirections: ["vocational", "humanities", "commerce", "science-pcb"],
    skills: [
      { slug: "sports-performance", name: "Sports Performance", category: "Physical", weight: "0.80" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" }
    ]
  },
  {
    slug: "sports-manager",
    title: "Sports Manager",
    careerFamily: "Sports",
    industry: "Athletics Management",
    educationLevel: "Bachelor's/MBA (Sports)",
    shortDescription: "Manage sports clubs, events, player contracts, and sponsorships.",
    fullDescription: "Sports Managers handle the business side of sports. They organize league events, manage stadium logistics, negotiate sponsorships, handle player public relations, and oversee club budgets.",
    typicalResponsibilities: ["Negotiating player sponsorship contracts", "Coordinating sports event logistics", "Managing sports club budgets", "Handling public relations announcements"],
    educationPathways: ["BBA / MBA in Sports Management", "B.Com / BBA general followed by sports logistics experience"],
    progression: ["Event Coordinator -> Athlete Agent -> Club Operations Manager -> General Manager"],
    futureOpportunities: ["High demand driven by the growth of sports leagues (IPL, ISL, PKL, etc.) and player agencies."],
    compatibleDirections: ["commerce", "commerce-math", "humanities"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.85" }
    ]
  },
  {
    slug: "sports-analyst",
    title: "Sports Analyst",
    careerFamily: "Sports",
    industry: "Sports Media & Analytics",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Analyze sports datasets to optimize team strategies and evaluate player performances.",
    fullDescription: "Sports Analysts review video tapes and run statistical software to track player speeds, pass completions, and shot metrics. They build reports for team coaches and deliver statistical insights for media broadcasters.",
    typicalResponsibilities: ["Tagging video match recordings", "Writing scripts to analyze player run-speeds", "Compiling statistical dashboards for coaches", "Providing data charts for sports TV shows"],
    educationPathways: ["B.Sc in Statistics / Data Science", "B.P.Ed with computer data skills", "Certifications in Sports Analytics"],
    progression: ["Junior Video Coordinator -> Performance Analyst -> Head of Analytics -> Director of Player Recruitment"],
    futureOpportunities: ["Fast-growing specialized role in professional sports leagues, clubs, and sports broadcasting networks."],
    compatibleDirections: ["science-pcm", "commerce-math", "science-pcmb"],
    skills: [
      { slug: "mathematics", name: "Mathematics", category: "Technical", weight: "0.85" },
      { slug: "programming", name: "Programming", category: "Technical", weight: "0.80" },
      { slug: "analytical-thinking", name: "Analytical Thinking", category: "Cognitive", weight: "0.90" }
    ]
  },
  {
    slug: "sports-journalist",
    title: "Sports Journalist",
    careerFamily: "Sports",
    industry: "Media",
    educationLevel: "Bachelor's Degree",
    shortDescription: "Report sports news, interview players, and write articles on games.",
    fullDescription: "Sports Journalists cover athletic matches, write match analysis columns, host sports debate podcasts, and interview players and coaches before and after tournaments.",
    typicalResponsibilities: ["Writing live match commentary articles", "Interviewing athletes at stadiums", "Presenting sports reports on TV or digital channels", "Researching sports historical statistics"],
    educationPathways: ["B.J.M.C. (Mass Comm)", "B.A. English / Journalism", "Deep sports domain knowledge portfolio"],
    progression: ["Match Reporter -> Sports Editor -> Sports Anchor -> Chief Media Officer"],
    futureOpportunities: ["Booming digital media channels, sports blogs, podcasts, and sports television networks."],
    compatibleDirections: ["humanities", "design-creative"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "creativity", name: "Creativity", category: "Cognitive", weight: "0.80" }
    ]
  },
  {
    slug: "sports-physiotherapist",
    title: "Sports Physiotherapist",
    careerFamily: "Sports",
    industry: "Athletic Healthcare",
    educationLevel: "Bachelor's Degree (BPT)",
    shortDescription: "Manage and treat sports-related injuries in athletes on-field and off-field.",
    fullDescription: "Sports Physiotherapists specialize in athletic rehabilitation. They treat pulled hamstrings, ligament tears, run on-field injury assessments, and manage stretching routines to prevent injuries.",
    typicalResponsibilities: ["Administering on-field first aid for injuries", "Designing athletic muscle recovery regimens", "Applying therapeutic tape and massage", "Certifying player fitness levels for matches"],
    educationPathways: ["BPT (Bachelor of Physiotherapy)", "MPT in Sports Physiotherapy", "Sports medicine certifications"],
    progression: ["Academy Physiotherapist -> Team Physiotherapist -> Chief Medical Officer (Sports Club)"],
    futureOpportunities: ["Mandatory support roles in all national teams, private sports leagues, and fitness franchises."],
    compatibleDirections: ["science-pcb", "science-pcmb"],
    skills: [
      { slug: "biology", name: "Biology", category: "Technical", weight: "0.90" },
      { slug: "sports-performance", name: "Sports Performance", category: "Physical", weight: "0.80" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.85" }
    ]
  },
  {
    slug: "fitness-trainer",
    title: "Fitness Trainer",
    careerFamily: "Sports",
    industry: "Wellness",
    educationLevel: "Certification Required",
    shortDescription: "Guide clients and athletes through physical workouts and strength routines.",
    fullDescription: "Fitness Trainers design gym workouts, instruct clients on safe weight-lifting postures, lead aerobic sessions, and guide corporate wellness or sports team strength drills.",
    typicalResponsibilities: ["Demonstrating gym exercise postures", "Designing strength and conditioning charts", "Monitoring clients' weight loss metrics", "Ensuring gym equipment safety compliance"],
    educationPathways: ["B.P.Ed (Physical Education)", "Certifications from ACE, ACSM, or Gold's Gym Academy"],
    progression: ["Gym Instructor -> Personal Trainer -> Strength Coach -> Gym Franchise Owner"],
    futureOpportunities: ["Consistent growth in commercial gym chains, corporate offices, and athletic clubs."],
    compatibleDirections: ["vocational", "humanities", "commerce", "science-pcb"],
    skills: [
      { slug: "sports-performance", name: "Sports Performance", category: "Physical", weight: "0.90" },
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.90" }
    ]
  },
  {
    slug: "sports-psychologist",
    title: "Sports Psychologist",
    careerFamily: "Sports",
    industry: "Athletic Healthcare",
    educationLevel: "Master's Degree",
    shortDescription: "Help athletes build mental resilience and focus for tournaments.",
    fullDescription: "Sports Psychologists counsel athletes to build confidence, manage performance anxiety, recover from mental burnout after injuries, and improve focus during matches.",
    typicalResponsibilities: ["Counseling players on match anxiety", "Teaching meditation and visualization drills", "Conducting team-bonding trust exercises", "Writing cognitive performance reports"],
    educationPathways: ["B.A./B.Sc Psychology", "M.Sc in Sports Psychology / Counseling Psychology"],
    progression: ["Sports Counselor -> Associate Psychologist -> Head of Mental Training (Sports Club)"],
    futureOpportunities: ["Expanding role in elite academies, olympic training setups, and professional clubs."],
    compatibleDirections: ["humanities", "science-pcb", "science-pcmb"],
    skills: [
      { slug: "communication", name: "Communication", category: "Soft", weight: "0.95" },
      { slug: "sports-performance", name: "Sports Performance", category: "Physical", weight: "0.80" }
    ]
  }
];
