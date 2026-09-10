import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ResumeLocale = "en" | "es"

interface ResumeLocaleState {
  locale: ResumeLocale
  setLocale: (locale: ResumeLocale) => void
  toggleLocale: () => void
}

/** Persisted EN/ES toggle for the resume page only — same
 * zustand+persist convention as `settings-store.ts`. Defaults to English
 * (the resume's ATS-facing language); a returning visitor's choice sticks
 * via localStorage. */
export const useResumeLocaleStore = create<ResumeLocaleState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set({ locale: get().locale === "en" ? "es" : "en" }),
    }),
    { name: "portfolio-resume-locale-v1" }
  )
)
