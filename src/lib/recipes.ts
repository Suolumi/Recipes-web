import type {User} from "$lib/user";
import {apiFetchJson} from "$lib/api";

type FetchFn = typeof fetch;

export type RecipeType = "snack" | "starter" | "dish" | "side-dish" | "sauce" | "dessert" | "drink" | "plate"

export const RecipeTypes: RecipeType[] = ["snack","starter","dish","side-dish","sauce","dessert","drink","plate"]

export const recipeTypeColors: {
    [key: string]: string
} = {
    dish: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    "side-dish": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300",
    dessert: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300",
    starter: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
    sauce: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    drink: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
    snack: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    plate: "bg-amber-100 text-amber-800 dark:bg-amber-100/20 dark:text-amber-300",
}

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
    locale?: string
    search_locale?: string
}

export type GetRecipesResponse = {
    length: number
    items: RecipePreview[]
}

export function getIngredientName(ingredient: Ingredient): string {
    if (ingredient.quantity && ingredient.quantity > 0) {
        if (ingredient.unit && ingredient.unit !== '') {
            return `${ingredient.quantity} ${ingredient.unit} - ${ingredient.name}`
        }
        return `${ingredient.quantity} ${ingredient.name}`
    }
    return ingredient.name
}

export function getRecipe(id: string, locale?: string, f: FetchFn = fetch) {
    return apiFetchJson<Recipe>(`/recipes/${id}?locale=${locale ?? ''}`, "GET", undefined, undefined, undefined, f)
}

export function getRecipes(params: GetRecipesRequest) {
    return apiFetchJson<GetRecipesResponse>('/recipes', "GET", null, params)
}

function recipeBody(recipe: RecipeForm, keepPictureIDs?: string[]) {
    const {pictures, ...fields} = recipe
    return keepPictureIDs === undefined ? fields : {...fields, keep_picture_ids: keepPictureIDs}
}

function multipartRecipeBody(recipe: object, files: File[]) {
    const formData = new FormData()
    formData.append('recipe', JSON.stringify(recipe))
    for (const file of files)
        formData.append('pictures', file)
    return formData
}

export function createRecipe(recipe: RecipeForm, newPictures: File[] = [], locale?: string) {
    const body = recipeBody(recipe) as Record<string, unknown>
    if (locale) {
        body.locale = locale
    }
    const payload = newPictures.length > 0 ? multipartRecipeBody(body, newPictures) : body
    return apiFetchJson<Recipe>('/recipes', "POST", payload, null, {'Idempotency-Key': crypto.randomUUID()})
}

export function editRecipe(recipe: RecipeForm, id: string, newPictures: File[] = []) {
    const body = recipeBody(recipe, recipe.pictures)
    const payload = newPictures.length > 0 ? multipartRecipeBody(body, newPictures) : body
    return apiFetchJson<Recipe>(`/recipes/${id}`, "PATCH", payload, null, {'Idempotency-Key': crypto.randomUUID()})
}

export function deleteRecipe(id: string) {
    return apiFetchJson<Recipe>(`/recipes/${id}`, "DELETE", null)
}
