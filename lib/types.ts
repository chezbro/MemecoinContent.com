export interface Tweet {
    id: string
    text: string
    createdAt: string
    metrics: {
      retweet_count: number
      reply_count: number
      like_count: number
      quote_count: number
    }
    author: {
      id: string
      name: string
      username: string
      profileImageUrl: string
    }
  }