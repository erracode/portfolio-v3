import { create } from "zustand"

export type LogChannel = "system" | "quest" | "loot"

/** Shared between `ChatBox` and `MobileChatBox` — kept here since both
 * already import from this module. */
export const CHANNEL_LABEL: Record<LogChannel, string> = {
  system: "System",
  quest: "Quest",
  loot: "Loot",
}

export const CHANNEL_COLOR: Record<LogChannel, string> = {
  system: "text-[#ffd100]",
  quest: "text-[#c79c6e]",
  loot: "text-[#1eff00]",
}

export interface LogEntry {
  id: number
  channel: LogChannel
  message: string
}

interface LogState {
  logs: LogEntry[]
  addLog: (channel: LogChannel, message: string) => void
  clear: () => void
}

const MAX_LOGS = 100

let nextId = 1

const INITIAL_LOGS: LogEntry[] = [
  {
    id: nextId++,
    channel: "system",
    message: "Welcome to Jesús Portfolio v2.0",
  },
  {
    id: nextId++,
    channel: "system",
    message: "Press C / L / P / Y / J to open a panel",
  },
]

/**
 * Global game-log channel. Future systems (combat, CV download, project
 * interactions) push entries via addLog; the chat box only reads.
 */
export const useLogStore = create<LogState>()((set) => ({
  logs: INITIAL_LOGS,

  addLog: (channel, message) =>
    set((state) => ({
      logs: [...state.logs, { id: nextId++, channel, message }].slice(-MAX_LOGS),
    })),

  clear: () => set({ logs: [] }),
}))

export function useLogs(): LogEntry[] {
  return useLogStore((state) => state.logs)
}
