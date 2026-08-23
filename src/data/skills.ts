// Tech buff icons for the portfolio buff bar.

export interface Skill {
  /** Stable kebab-case identifier used as React key */
  id: string;
  /** Tech display name (used as image alt / fallback initial) */
  name: string;
  /** Public asset path under /tech */
  icon: string;
}

export const skills: readonly Skill[] = [
  { id: "react", name: "React", icon: "/tech/react-logo.png" },
  { id: "typescript", name: "TypeScript", icon: "/tech/typescript-logo.png" },
  { id: "nextjs", name: "Next.js", icon: "/tech/nextjs-logo.png" },
  { id: "nestjs", name: "NestJS", icon: "/tech/nestjs-logo.png" },
  { id: "supabase", name: "Supabase", icon: "/tech/supabase-logo.png" },
  { id: "javascript", name: "JavaScript", icon: "/tech/javascript-logo.png" },
  { id: "nodejs", name: "Node.js", icon: "/tech/nodejs-logo.png" },
  { id: "postgres", name: "PostgreSQL", icon: "/tech/postgres-logo.png" },
  { id: "tailwind", name: "Tailwind CSS", icon: "/tech/tailwind-logo.png" },
  { id: "trpc", name: "tRPC", icon: "/tech/trpc-logo.png" },
  { id: "express", name: "Express", icon: "/tech/express-logo.png" },
  { id: "mongodb", name: "MongoDB", icon: "/tech/mongodb-logo.png" },
];
