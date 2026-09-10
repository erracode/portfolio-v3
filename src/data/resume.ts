export interface ResumeWorkEntry {
  role: string
  company: string
  period: string
  location: string
  intro?: string
  highlights: string[]
}

export interface ResumeSkillItem {
  name: string
  /** Path under `public/tech/` — same logos `TalentsModal` uses. Left
   * unset for tools with no logo asset (testing libs, payment gateways,
   * architecture concepts) — the pill just renders without an icon. */
  icon?: string
}

export interface ResumeSkillGroup {
  label: string
  items: ResumeSkillItem[]
}

/**
 * Content mirrors `cv-senior-software-engineer.md` (the master resume file
 * in Documents/work/personal) — kept in sync by hand since that file is the
 * canonical source, not generated from this one.
 */
export const RESUME = {
  name: "Jesus Diaz",
  photo: "/images/jesus-diaz.jpg",
  title: "Senior Software Engineer",
  tagline: "Full-Stack — React, Next.js, Node.js/NestJS, TypeScript",
  email: "jdiaz.97ma@gmail.com",
  linkedin: "linkedin.com/in/jesus-diaz-erracode",
  linkedinUrl: "https://www.linkedin.com/in/jesus-diaz-erracode/",
  location: "Remote (LatAm)",
  languages: "Spanish (native) · English (professional)",

  summary:
    "Full-stack engineer with 5+ years building and operating a single complex product ecosystem: the Cinemark digital platform, live across 12 Latin American countries. I work the entire stack — the React/Next.js UI millions of users touch, the NestJS/Express microservices behind it, the shared libraries other engineers build on, and the CI/CD pipelines that ship it. At SunDevs I own the cross-cutting infrastructure the senior team depends on: a shared logging/tracing library adopted by every microservice, an internal AI development toolkit, two major front-end version migrations, and new-country rollouts from Bolivia to Central America. I understand the business as deeply as the code — ticketing, concessions, memberships, 9 payment gateways, and per-country electronic invoicing.",

  work: [
    {
      role: "Full-Stack Engineer",
      company: "SunDevs (Cinemark International)",
      period: "Jan 2023 – Present · 3+ years",
      location: "Remote",
      intro:
        "Cinemark is the largest movie theater chain in Latin America. I work across three front-end platforms and eight backend microservices serving millions of users in 12 countries.",
      highlights: [
        "@sundevs/ckc-api-commons — designed and led the shared logging, error-handling, and trace-id library every microservice now depends on; chose AWS CodeArtifact as the private registry, set up CI/CD, wrote the team's adoption guide.",
        "ckc-ai-toolkit — built the team's internal AI development toolkit (agent skills, stack guides, prompt templates, runbooks) and mapped all 20+ repos in the ecosystem.",
        "ckc-web-admin (React 18, Ant Design v5, Redux Toolkit/Saga) — led the Ant Design v3→v5 migration, a heavy drag-and-drop rework for content ordering, an orders-module refactor with infinite loading, and content management for ads, promotions, and concessions.",
        "ckc-website (Next.js 12, React, Redux/Saga) — owned complex purchase flows for Colombia/Ecuador: cart combining tickets and concessions, seat selection, CineClub membership. Led the tiquetera module, a coupon-book system for promotional redemptions.",
        "cnk-backoffice-ui (Next.js, TypeScript) — built exclusion rules, group management, and Vista tab sync. Currently leading multi-country rollout — Bolivia shipped, Central America and Argentina in progress.",
        "Backend across 8 microservices (NestJS / Express / Serverless): API Gateway, Orders, Payments, Accounts, Notifications, Vista, Content Management, Concessions sync — instrumented with OpenTelemetry.",
        "Designed the Universal Delivery Template that standardized engineering-to-QA handoffs; established SDD and ADRs as team practice; mentored incoming trainees.",
      ],
    },
    {
      role: "Senior Software Engineer",
      company: "Awsh (Fintech / E-Commerce)",
      period: "Feb 2021 – 2025 · 4+ years",
      location: "United States, Remote",
      highlights: [
        "Built a firearms e-commerce platform (Next.js, PayloadCMS, Authorize.net) with state-level regulatory compliance.",
        "Developed the HB Reconciler, centralizing Zoho CRM, NMI, and Paytrace transactions for automated billing.",
        "Engineered a distributed web-scraping system across 20,000+ domains with job scheduling and real-time monitoring.",
      ],
    },
    {
      role: "Software Developer Coordinator",
      company: "Studio73",
      period: "Jan 2021 – Jan 2023 · 2 years",
      location: "Panama, Remote",
      highlights: [
        "Promoted from Junior Developer to Web Coordinator in 12 months.",
        "Led the web department, managed hosting clusters and cloud infrastructure for major Panamanian brands, and mentored junior developers.",
      ],
    },
  ] satisfies ResumeWorkEntry[],

  skills: [
    {
      label: "Front-End",
      items: [
        { name: "React (17/18/19)", icon: "/tech/react-logo.png" },
        { name: "TypeScript", icon: "/tech/typescript-logo.png" },
        { name: "Next.js", icon: "/tech/nextjs-logo.png" },
        { name: "Redux Toolkit/Saga", icon: "/tech/redux-logo.png" },
        { name: "Ant Design (v3→v5)" },
        { name: "Radix UI" },
        { name: "shadcn/ui" },
        { name: "Tailwind CSS", icon: "/tech/tailwind-logo.png" },
        { name: "Styled Components" },
        { name: "GSAP" },
        { name: "@dnd-kit" },
        { name: "CKEditor" },
        { name: "Monaco Editor" },
        { name: "SSR/SSG" },
        { name: "i18n" },
      ],
    },
    {
      label: "Back-End",
      items: [
        { name: "NestJS", icon: "/tech/nestjs-logo.png" },
        { name: "Express", icon: "/tech/express-logo.png" },
        { name: "Hono" },
        { name: "Node.js", icon: "/tech/nodejs-logo.png" },
        { name: "PostgreSQL", icon: "/tech/postgres-logo.png" },
        { name: "MongoDB", icon: "/tech/mongodb-logo.png" },
        { name: "TypeORM" },
        { name: "Mongoose" },
        { name: "Redis" },
        { name: "Serverless (AWS Lambda)" },
      ],
    },
    {
      label: "Testing",
      items: [
        { name: "Jest" },
        { name: "React Testing Library" },
        { name: "Cypress (E2E)" },
        { name: "Vitest" },
      ],
    },
    {
      label: "Payments & Fintech",
      items: [
        { name: "PayU" },
        { name: "Paymentez" },
        { name: "CyberSource" },
        { name: "Transbank" },
        { name: "BCP QR" },
        { name: "Khipu" },
        { name: "Bancard" },
        { name: "Credomatic" },
        { name: "Authorize.net" },
        { name: "Card tokenization" },
        { name: "Recurring billing" },
        { name: "Electronic invoicing" },
      ],
    },
    {
      label: "Infrastructure",
      items: [
        { name: "AWS Lambda" },
        { name: "AWS CodeArtifact" },
        { name: "AWS API Gateway" },
        { name: "DynamoDB" },
        { name: "Step Functions" },
        { name: "SNS/SQS" },
        { name: "Azure DevOps" },
        { name: "Bitbucket Pipelines" },
        { name: "OpenTelemetry" },
        { name: "Vite" },
        { name: "Bun" },
        { name: "Turborepo" },
      ],
    },
    {
      label: "Architecture",
      items: [
        { name: "Shared library authoring" },
        { name: "Component library design" },
        { name: "Microservices" },
        { name: "ADRs" },
        { name: "Circuit breakers" },
        { name: "Monorepos" },
        { name: "SDD workflow" },
      ],
    },
  ] satisfies ResumeSkillGroup[],

  education: {
    degree: "Engineering Degree in Computer Engineering",
    school: "Universidad Rafael Belloso Chacín, Venezuela",
    period: "2015 – 2020",
  },
}
