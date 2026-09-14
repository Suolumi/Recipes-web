import type {User} from "$lib/user";
import {apiFetchJson} from "$lib/api";

type FetchFn = typeof fetch;

export type RecipeType = "snack" | "starter" | "dish" | "side-dish" | "sauce" | "dessert" | "drink" | "plate"

export const RecipeTypes: RecipeType[] = ["snack","starter","dish","side-dish","sauce","dessert","drink","plate"]

export const recipeTypeColors: {
    [key: string]: string
} = {
    dish: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    "side-dish": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
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
    picture?: string
}

export type Ingredient = {
    name: string
    quantity: number
    unit: string
    label: string
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
    favorite: boolean
    favorite_count: number
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
    favorite: boolean
    favorite_count: number
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
    favorite?: boolean
}

export type GetRecipesResponse = {
    length: number
    items: RecipePreview[]
}

export type IngredientGroup = {
    label: string | null
    items: Ingredient[]
}

// Groups ingredients by their (trimmed, case-insensitive) label. Unlabeled
// ingredients are pooled into one header-less group shown first; labeled
// groups follow in order of each label's first appearance.
export function groupIngredients(ingredients: Ingredient[]): IngredientGroup[] {
    const unlabeled: Ingredient[] = []
    const order: string[] = []
    const groups = new Map<string, IngredientGroup>()

    for (const ingredient of ingredients) {
        const label = ingredient.label.trim()
        if (!label) {
            unlabeled.push(ingredient)
            continue
        }
        const key = label.toLowerCase()
        let group = groups.get(key)
        if (!group) {
            group = {label, items: []}
            groups.set(key, group)
            order.push(key)
        }
        group.items.push(ingredient)
    }

    const result: IngredientGroup[] = []
    if (unlabeled.length > 0)
        result.push({label: null, items: unlabeled})
    for (const key of order)
        result.push(groups.get(key)!)
    return result
}

// Friendly fractions to snap a scaled quantity's fractional part to, so
// scaled amounts read like a normal recipe (e.g. "1 + 1/2 cups") instead of
// a raw decimal (e.g. "1.5 cups").
const FRIENDLY_FRACTIONS: [numerator: number, denominator: number][] = [
    [1, 8], [1, 4], [1, 3], [3, 8], [1, 2], [5, 8], [2, 3], [3, 4], [7, 8],
]
const FRACTION_ROUND_EPSILON = 1 / 32

export function formatScaledQuantity(quantity: number): string {
    const whole = Math.floor(quantity)
    const frac = quantity - whole

    if (frac < FRACTION_ROUND_EPSILON)
        return String(whole)
    if (1 - frac < FRACTION_ROUND_EPSILON)
        return String(whole + 1)

    let [bestNumerator, bestDenominator] = FRIENDLY_FRACTIONS[0]
    let bestDiff = Math.abs(frac - bestNumerator / bestDenominator)
    for (const [numerator, denominator] of FRIENDLY_FRACTIONS.slice(1)) {
        const diff = Math.abs(frac - numerator / denominator)
        if (diff < bestDiff) {
            bestDiff = diff
            bestNumerator = numerator
            bestDenominator = denominator
        }
    }

    const fractionText = `${bestNumerator}/${bestDenominator}`
    return whole > 0 ? `${whole} + ${fractionText}` : fractionText
}

// `ratio` scales the ingredient's stored quantity (e.g. selected servings /
// recipe's default servings). At ratio 1 (the default), formatting is
// unchanged from the recipe's authored quantity; away from 1, the quantity
// is scaled and rounded to a friendly fraction. Ingredients with no
// quantity (quantity <= 0, e.g. "salt to taste") are never scaled.
export function getIngredientName(ingredient: Ingredient, ratio: number = 1): string {
    if (ingredient.quantity && ingredient.quantity > 0) {
        const quantity = ratio === 1 ? ingredient.quantity : formatScaledQuantity(ingredient.quantity * ratio)
        if (ingredient.unit && ingredient.unit !== '') {
            return `${quantity} ${ingredient.unit} - ${ingredient.name}`
        }
        return `${quantity} ${ingredient.name}`
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

// newStepPictures is keyed by a step's final (post-reorder) index in
// recipe.steps; each entry becomes a `step_picture_<index>` file field the
// backend correlates back to that step.
function multipartRecipeBody(recipe: object, files: File[], stepFiles: Record<number, File>) {
    const formData = new FormData()
    formData.append('recipe', JSON.stringify(recipe))
    for (const file of files)
        formData.append('pictures', file)
    for (const [index, file] of Object.entries(stepFiles))
        formData.append(`step_picture_${index}`, file)
    return formData
}

export function createRecipe(recipe: RecipeForm, newPictures: File[] = [], locale?: string, newStepPictures: Record<number, File> = {}) {
    const body = recipeBody(recipe) as Record<string, unknown>
    if (locale) {
        body.locale = locale
    }
    const hasFiles = newPictures.length > 0 || Object.keys(newStepPictures).length > 0
    const payload = hasFiles ? multipartRecipeBody(body, newPictures, newStepPictures) : body
    return apiFetchJson<Recipe>('/recipes', "POST", payload, null, {'Idempotency-Key': crypto.randomUUID()})
}

export function editRecipe(recipe: RecipeForm, id: string, newPictures: File[] = [], newStepPictures: Record<number, File> = {}) {
    const body = recipeBody(recipe, recipe.pictures)
    const hasFiles = newPictures.length > 0 || Object.keys(newStepPictures).length > 0
    const payload = hasFiles ? multipartRecipeBody(body, newPictures, newStepPictures) : body
    return apiFetchJson<Recipe>(`/recipes/${id}`, "PATCH", payload, null, {'Idempotency-Key': crypto.randomUUID()})
}

export function deleteRecipe(id: string) {
    return apiFetchJson<Recipe>(`/recipes/${id}`, "DELETE", null)
}

export function favoriteRecipe(id: string) {
    return apiFetchJson<{ message: string }>(`/recipes/${id}/favorite`, "POST", null)
}

export function unfavoriteRecipe(id: string) {
    return apiFetchJson<{ message: string }>(`/recipes/${id}/favorite`, "DELETE", null)
}
