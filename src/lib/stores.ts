import { writable, type Writable } from "svelte/store"
// import { persisted } from 'svelte-persisted-store';
import type {User} from "$lib/user";
import type {Recipe} from "$lib/recipes";

const jsonParser = {
    parse: (text: string) => {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.log(e);
            return "";
        }
    },
    stringify: (object: object) => JSON.stringify(object)
}

// export const accessToken = persisted('accessToken', '', {
//     syncTabs: true,
//     serializer: jsonParser,
// });
// export const refreshToken = persisted('refreshToken', '', {
//     syncTabs: true,
//     serializer: jsonParser,
// });

export const accessToken = writable<string | null>("")
export const refreshToken = writable<string | null>("")

export const user = writable<User | null>(null)
export const darkMode = writable<boolean>(false)

const sampleRecipes: Recipe[] = [
    {
        id: 1,
        title: "Classic Margherita Pizza",
        description: "A traditional Italian pizza with fresh tomatoes, mozzarella, and basil",
        author: "Chef Mario",
        authorId: 1,
        servings: 4,
        type: "dish",
        prepTime: 30,
        cookTime: 15,
        heating: "oven",
        image: "/public/margherita-pizza.png",
        ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Fresh basil leaves", "Olive oil", "Salt"],
        steps: [
            "Preheat oven to 475°F (245°C)",
            "Roll out pizza dough on floured surface",
            "Spread tomato sauce evenly",
            "Add torn mozzarella pieces",
            "Bake for 12-15 minutes until golden",
            "Top with fresh basil and drizzle olive oil",
        ],
    },
    {
        id: 2,
        title: "Chocolate Chip Cookies",
        description: "Soft and chewy homemade chocolate chip cookies",
        author: "Baker Sarah",
        authorId: 2,
        servings: 24,
        type: "dessert",
        prepTime: 15,
        cookTime: 12,
        heating: "oven",
        image: "/public/chocolate-chip-cookies.png",
        ingredients: [
            "All-purpose flour",
            "Butter",
            "Brown sugar",
            "White sugar",
            "Eggs",
            "Vanilla extract",
            "Chocolate chips",
        ],
        steps: [
            "Preheat oven to 375°F (190°C)",
            "Cream butter and sugars together",
            "Add eggs and vanilla",
            "Mix in flour gradually",
            "Fold in chocolate chips",
            "Bake for 10-12 minutes",
        ],
    },
    {
        id: 3,
        title: "Caesar Salad",
        description: "Crisp romaine lettuce with homemade Caesar dressing",
        author: "Chef Julia",
        authorId: 3,
        servings: 4,
        type: "dish",
        prepTime: 20,
        cookTime: 0,
        heating: "none",
        image: "/public/caesar-salad.png",
        ingredients: [
            "Romaine lettuce",
            "Parmesan cheese",
            "Croutons",
            "Anchovies",
            "Garlic",
            "Lemon juice",
            "Olive oil",
            "Egg yolk",
        ],
        steps: [
            "Wash and chop romaine lettuce",
            "Make dressing with garlic, anchovies, lemon juice",
            "Whisk in olive oil and egg yolk",
            "Toss lettuce with dressing",
            "Top with parmesan and croutons",
        ],
    },
]

export const recipes = writable(sampleRecipes)
export const selectedRecipe = writable(null)
export const editingRecipe = writable(null)

export const recipeTypeColors: {
    [key: string]: string
} = {
    dish: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    "side-dish": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300",
    dessert: "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300",
    starter: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
    Soup: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    Beverage: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
    Snack: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
}

export function getUserAvatar(user: User | null): string | null {
    if (user?.picture) {
        return user.picture
    }
    return null
}

export function getUserInitial(user: User | null): string {
    return user?.username?.charAt(0)?.toUpperCase() || "?"
}
