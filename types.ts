export interface User {
  id: number
  username: string
  profile_image?: string | null
}

export interface Recipe {
  id: number
  name: string
  description: string
  time: string
  image_path: string | null
  author_id: number
  author_name: string
  created_at: string
  ingredients_count: number
  steps_count: number
}