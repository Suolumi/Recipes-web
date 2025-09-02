export interface Recipe {
    id: number
    title: string
    description: string
    author: string
    authorId: number
    servings: number
    type: RecipeType
    prepTime: number
    cookTime: number
    heating: HeatingType
    image: string
    ingredients: string[]
    steps: string[]
}

export type RecipeType = "snack" | "starter" | "dish" | "side-dish" | "sauce" | "dessert" | "drink"

export const RecipeTypes: RecipeType[] = ["snack","starter","dish","side-dish","sauce","dessert","drink"];

export type HeatingType = "oven" | "microwave" | "hot-plate" | "barbecue" | "none" | "other"
