import type {User} from "$lib/user";
import {apiFetchJson} from "$lib/api";

export type RecipeType = "snack" | "starter" | "dish" | "side-dish" | "sauce" | "dessert" | "drink"

export const RecipeTypes: RecipeType[] = ["snack","starter","dish","side-dish","sauce","dessert","drink"]

export type Step = {
    title: string
    description: string
}

export type Ingredient = {
    name: string
    quantity: number
    unit: string
}

export type Recipe = {
    id: string
    title: string
    description: string
    author: User
    quantity: number
    preparation_time: number
    cooking_time: number
    resting_time: number
    kind: RecipeType
    ingredients: Ingredient[]
    steps: Step[]
    pictures: string[]
}

export type RecipePreview = {
    id: string
    title: string
    description: string
    author: User
    quantity: number
    preparation_time: number
    cooking_time: number
    resting_time: number
    kind: RecipeType
    pictures: string[]
}

export type RecipeForm = {
    title: string
    description: string
    quantity: number
    kind: RecipeType
    preparation_time: number
    cooking_time: number
    resting_time: number
    ingredients: Ingredient[]
    steps: Step[]
    pictures: string[]
}

export type GetRecipesRequest = {
    limit?: number
    offset?: number
    author?: string
    title?: string
    preparation_time?: number
    total_time?: number
    ingredients?: string[]
    kind?: RecipeType
}

export type GetRecipesResponse = {
    length: number
    items: RecipePreview[]
}

export type SaveRecipeFileResponse = {
    id: string
}

export function getIngredientName(ingredient: Ingredient): string {
    if (ingredient.quantity && ingredient.quantity > 0) {
        if (ingredient.unit && ingredient.unit !== '') {
            return `${ingredient.quantity}${ingredient.unit} ${ingredient.name}`
        }
        return `${ingredient.quantity} ${ingredient.name}`
    }
    return ingredient.name
}

export function getRecipe(id: string) {
    return apiFetchJson<Recipe>(`/recipes/${id}`)
}

export function getRecipes(params: GetRecipesRequest) {
    return apiFetchJson<GetRecipesResponse>('/recipes', "GET", null, params)
}

export function createRecipe(recipe: RecipeForm) {
    return apiFetchJson<Recipe>('/recipes', "POST", recipe)
}

export function editRecipe(recipe: RecipeForm, id: string) {
    return apiFetchJson<Recipe>(`/recipes/${id}`, "PATCH", recipe)
}

export function saveRecipeFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiFetchJson<SaveRecipeFileResponse>('/recipe-pictures', 'POST', formData, null, {})
}
