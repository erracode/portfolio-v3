import type { ResumeLocale } from "@/lib/resume-locale-store"

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

/** Section headings and other short UI strings that need a translation
 * but don't belong to either locale's content block below. */
export const RESUME_LABELS = {
  en: {
    summary: "Summary",
    experience: "Experience",
    projects: "Selected Projects",
    skills: "Technical Skills",
    education: "Education",
    showMore: "Show more",
    showLess: "Show less",
    visit: "Visit",
    print: "Print / Save as PDF",
    backToPortfolio: "Back to portfolio",
    searchCommand: "Search a command...",
    noMatch: "No matching command.",
    actions: "Actions",
    contact: "Contact",
    openCommands: "Open commands",
    pressForCommands: "for commands",
    language: "Switch to Spanish",
  },
  es: {
    summary: "Resumen",
    experience: "Experiencia",
    projects: "Proyectos Destacados",
    skills: "Habilidades Técnicas",
    education: "Educación",
    showMore: "Ver más",
    showLess: "Ver menos",
    visit: "Visitar",
    print: "Imprimir / Guardar PDF",
    backToPortfolio: "Volver al portafolio",
    searchCommand: "Buscar un comando...",
    noMatch: "Ningún comando coincide.",
    actions: "Acciones",
    contact: "Contacto",
    openCommands: "Abrir comandos",
    pressForCommands: "para abrir comandos",
    language: "Cambiar a inglés",
  },
} as const

/** Fields shared across both locales — names, contact info, tech
 * skill/logo data. Nothing here needs translating. */
const RESUME_SHARED = {
  name: "Jesus Diaz",
  photo: "/images/jesus-diaz.jpg",
  email: "jdiaz.97ma@gmail.com",
  linkedin: "linkedin.com/in/jesus-diaz-erracode",
  linkedinUrl: "https://www.linkedin.com/in/jesus-diaz-erracode/",

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
    school: "Universidad Rafael Belloso Chacín, Venezuela",
    period: "2015 – 2020",
  },
}

interface ResumeLocaleContent {
  title: string
  tagline: string
  location: string
  languages: string
  summary: string
  work: ResumeWorkEntry[]
  educationDegree: string
}

const RESUME_EN: ResumeLocaleContent = {
  title: "Senior Software Engineer",
  tagline: "Full-Stack — React, Next.js, Node.js/NestJS, TypeScript",
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
  ],

  educationDegree: "Engineering Degree in Computer Engineering",
}

const RESUME_ES: ResumeLocaleContent = {
  title: "Ingeniero de Software Senior",
  tagline: "Full-Stack — React, Next.js, Node.js/NestJS, TypeScript",
  location: "Remoto (LatAm)",
  languages: "Español (nativo) · Inglés (profesional)",

  summary:
    "Ingeniero full-stack con 5+ años construyendo y operando un ecosistema de producto complejo: la plataforma digital de Cinemark, activa en 12 países de Latinoamérica. Trabajo en todo el stack — la interfaz React/Next.js que usan millones de usuarios, los microservicios NestJS/Express detrás, las librerías compartidas que otros ingenieros usan, y los pipelines de CI/CD que lo despliegan. En SunDevs soy dueño de la infraestructura transversal de la que depende el equipo senior: una librería compartida de logging/tracing adoptada por todos los microservicios, un toolkit interno de desarrollo con IA, dos migraciones mayores de versión en frontend, y despliegues de países nuevos desde Bolivia hasta Centroamérica. Entiendo el negocio tan a fondo como el código — boletería, confitería, membresías, 9 pasarelas de pago, y facturación electrónica por país.",

  work: [
    {
      role: "Ingeniero Full-Stack",
      company: "SunDevs (Cinemark International)",
      period: "Ene 2023 – Presente · 3+ años",
      location: "Remoto",
      intro:
        "Cinemark es la cadena de cines más grande de Latinoamérica. Trabajo en tres plataformas frontend y ocho microservicios backend que sirven a millones de usuarios en 12 países.",
      highlights: [
        "@sundevs/ckc-api-commons — diseñé y lideré la librería compartida de logging, manejo de errores y trace-id de la que depende cada microservicio; elegí AWS CodeArtifact como registro privado, configuré CI/CD, y escribí la guía de adopción del equipo.",
        "ckc-ai-toolkit — construí el toolkit interno de desarrollo con IA del equipo (skills de agentes, guías de stack, plantillas de prompts, runbooks) y mapeé los 20+ repos del ecosistema.",
        "ckc-web-admin (React 18, Ant Design v5, Redux Toolkit/Saga) — lideré la migración de Ant Design v3→v5, un rework pesado de drag-and-drop para ordenar contenido, un refactor del módulo de órdenes con infinite loading, y gestión de contenido para ads, promociones y confitería.",
        "ckc-website (Next.js 12, React, Redux/Saga) — a cargo de flujos de compra complejos para Colombia/Ecuador: carrito combinando tickets y confitería, selección de asientos, membresía CineClub. Lideré el módulo de tiquetera, un sistema de cupones para canjes promocionales de un solo producto.",
        "cnk-backoffice-ui (Next.js, TypeScript) — construí reglas de exclusión, gestión de grupos, y sincronización de tabs de Vista. Actualmente liderando el despliegue multi-país — Bolivia ya en producción, Centroamérica y Argentina en curso.",
        "Backend en 8 microservicios (NestJS / Express / Serverless): API Gateway, Orders, Payments, Accounts, Notifications, Vista, Content Management, sincronización de Concessions — instrumentado con OpenTelemetry.",
        "Diseñé el Universal Delivery Template que estandarizó el hand-off de ingeniería a QA; establecí SDD y ADRs como práctica del equipo; mentoré a los trainees que se incorporaron.",
      ],
    },
    {
      role: "Ingeniero de Software Senior",
      company: "Awsh (Fintech / E-Commerce)",
      period: "Feb 2021 – 2025 · 4+ años",
      location: "Estados Unidos, Remoto",
      highlights: [
        "Construí una plataforma de e-commerce de armas de fuego (Next.js, PayloadCMS, Authorize.net) con cumplimiento regulatorio a nivel estatal.",
        "Desarrollé el HB Reconciler, centralizando transacciones de Zoho CRM, NMI y Paytrace para facturación automatizada.",
        "Diseñé un sistema de scraping distribuido sobre 20,000+ dominios con scheduling de jobs y monitoreo en tiempo real.",
      ],
    },
    {
      role: "Coordinador de Desarrollo de Software",
      company: "Studio73",
      period: "Ene 2021 – Ene 2023 · 2 años",
      location: "Panamá, Remoto",
      highlights: [
        "Ascendido de Desarrollador Junior a Coordinador Web en 12 meses.",
        "Lideré el departamento web, gestioné clusters de hosting e infraestructura cloud para marcas panameñas importantes, y mentoré a desarrolladores junior.",
      ],
    },
  ],

  educationDegree: "Ingeniería en Computación",
}

export function getResumeContent(locale: ResumeLocale) {
  return {
    ...RESUME_SHARED,
    ...(locale === "es" ? RESUME_ES : RESUME_EN),
  }
}

export function getResumeLabels(locale: ResumeLocale) {
  return RESUME_LABELS[locale]
}
