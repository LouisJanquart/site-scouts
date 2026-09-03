import type { Utilisateur } from '../utils/session'

declare module 'h3' {
  interface H3EventContext {
    compte?: Utilisateur | null
  }
}

export {}
