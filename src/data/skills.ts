// Tech buff icons for the portfolio buff bar.

export interface Skill {
  /** Stable kebab-case identifier used as React key */
  id: string;
  /** Tech display name (used as image alt / fallback initial) */
  name: string;
  /** Public asset path under /tech */
  icon: string;
  /** Shown always in the buff bar's always-visible row; unset/false means
   * it only appears in the "+N" overflow dropdown. */
  featured?: boolean;
}

export const skills: readonly Skill[] = [
  { id: "react", name: "React", icon: "/tech/react-logo.png", featured: true },
  { id: "typescript", name: "TypeScript", icon: "/tech/typescript-logo.png", featured: true },
  { id: "nextjs", name: "Next.js", icon: "/tech/nextjs-logo.png", featured: true },
  { id: "nestjs", name: "NestJS", icon: "/tech/nestjs-logo.png", featured: true },
  { id: "supabase", name: "Supabase", icon: "/tech/supabase-logo.png", featured: true },
  { id: "javascript", name: "JavaScript", icon: "/tech/javascript-logo.png", featured: true },
  { id: "nodejs", name: "Node.js", icon: "/tech/nodejs-logo.png", featured: true },
  { id: "postgres", name: "PostgreSQL", icon: "/tech/postgres-logo.png", featured: true },
  { id: "tailwind", name: "Tailwind CSS", icon: "/tech/tailwind-logo.png", featured: true },
  { id: "trpc", name: "tRPC", icon: "/tech/trpc-logo.png", featured: true },
  { id: "express", name: "Express", icon: "/tech/express-logo.png", featured: true },
  { id: "mongodb", name: "MongoDB", icon: "/tech/mongodb-logo.png", featured: true },
  { id: "python", name: "Python", icon: "/tech/python-logo.png" },
  { id: "java", name: "Java", icon: "/tech/java-logo.png" },
  { id: "php", name: "PHP", icon: "/tech/php-logo.png" },
  { id: "django", name: "Django", icon: "/tech/django-logo.png" },
  { id: "codeigniter", name: "CodeIgniter", icon: "/tech/codeigniter-logo.png" },
  { id: "mysql", name: "MySQL", icon: "/tech/mysql-logo.png" },
  { id: "redux", name: "Redux", icon: "/tech/redux-logo.png" },
  { id: "zustand", name: "Zustand", icon: "/tech/zustand-logo.png" },
  { id: "jotai", name: "Jotai", icon: "/tech/jotai-logo.png" },
  { id: "html", name: "HTML", icon: "/tech/html-logo.png" },
  { id: "css", name: "CSS", icon: "/tech/css-logo.png" },
  { id: "payloadcms", name: "PayloadCMS", icon: "/tech/payloadcms-logo.png" },
  { id: "wordpress", name: "WordPress", icon: "/tech/wordpress-logo.png" },
  { id: "woocommerce", name: "WooCommerce", icon: "/tech/woocommerce-logo.png" },
  { id: "airtable", name: "Airtable", icon: "/tech/airtable-logo.png" },
  { id: "selenium", name: "Selenium", icon: "/tech/selenium-logo.png" },
  { id: "github", name: "GitHub", icon: "/tech/github-logo.png" },
];
