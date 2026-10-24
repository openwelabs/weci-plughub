declare module '#auth-utils' {
  interface UserSession {
    user?: {
      id: number
      githubId: number
      login: string
      name: string
      avatarUrl: string
      admin: boolean
    }
  }
}

export {}
