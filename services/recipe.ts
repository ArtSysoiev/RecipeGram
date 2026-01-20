import db from '../database/db'

import { Recipe } from '../types'

export async function getAllRecipes(): Promise<Recipe[]> {
    try {
        const query = `
      SELECT 
        recipes.*, 
        users.username as author_name,
        (SELECT COUNT(*) FROM ingredients WHERE ingredients.recipe_id = recipes.id) as ingredients_count,
        (SELECT COUNT(*) FROM steps WHERE steps.recipe_id = recipes.id) as steps_count
      FROM recipes 
      JOIN users ON recipes.author_id = users.id
      ORDER BY created_at DESC
    `
        const results = await db.getAllAsync(query)
        return results as Recipe[]
    } catch (error) {
        console.error('Error getting recipes:', error)
        return []
    }
}

export async function getUserRecipes(userId: number): Promise<Recipe[]> {
  try {
    const query = `
      SELECT 
        recipes.*, 
        users.username as author_name,
        (SELECT COUNT(*) FROM ingredients WHERE ingredients.recipe_id = recipes.id) as ingredients_count,
        (SELECT COUNT(*) FROM steps WHERE steps.recipe_id = recipes.id) as steps_count
      FROM recipes 
      JOIN users ON recipes.author_id = users.id
      WHERE recipes.author_id = ? 
      ORDER BY created_at DESC
    `
    const results = await db.getAllAsync(query, [userId])
    return results as Recipe[]
  } catch (error) {
    console.error('Error fetching user recipes:', error)
    return []
  }
}

export async function deleteRecipe(recipeId: number): Promise<boolean> {
  try {
    await db.runAsync('DELETE FROM recipes WHERE id = ?', [recipeId])
    return true
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return false
  }
}