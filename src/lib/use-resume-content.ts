import { getResumeContent, getResumeLabels } from "@/data/resume"
import { useResumeLocaleStore } from "@/lib/resume-locale-store"

/** Reads the current EN/ES choice and returns the matching resume content
 * + section labels, so components don't each juggle the store and the
 * data getters separately. */
export function useResumeContent() {
  const locale = useResumeLocaleStore((state) => state.locale)
  const toggleLocale = useResumeLocaleStore((state) => state.toggleLocale)

  return {
    locale,
    toggleLocale,
    resume: getResumeContent(locale),
    labels: getResumeLabels(locale),
  }
}
