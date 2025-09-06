import { writable, type Writable } from "svelte/store"
import { persisted } from 'svelte-persisted-store';
import type {User} from "$lib/user";
import type {Recipe, RecipePreview} from "$lib/recipes";

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

export const accessToken = persisted('accessToken', '', {
    syncTabs: true,
    serializer: jsonParser,
});
export const refreshToken = persisted('refreshToken', '', {
    syncTabs: true,
    serializer: jsonParser,
});

export const user = writable<User | null>(null)
export const darkMode = writable<boolean>(false)

const sampleRecipes: Recipe[] = [
    {
        id: "1",
        title: "Classic Margherita Pizza",
        description: "A traditional Italian pizza with fresh tomatoes, mozzarella, and basil",
        author: {
            username: "Chef Mario",
            id: "1",
            picture: ""
        },
        quantity: 4,
        kind: "dish",
        preparation_time: 30,
        cooking_time: 15,
        resting_time: 0,
        pictures: ["/margherita-pizza.png"],
        ingredients: [
            {
                name: "Pizza dough",
                unit: "",
                quantity: 3
            },
            {
                name: "Tomato sauce",
                unit: "",
                quantity: 3
            },
            {
                name: "Fresh mozzarella",
                unit: "",
                quantity: 3
            },
            {
                name: "Fresh basil leaves",
                unit: "",
                quantity: 3
            },
            {
                name: "Olive oil",
                unit: "",
                quantity: 3
            },

            {
                name: "Salt",
                unit: "",
                quantity: 3
            }
        ],
        steps: [
            {
                title: "Step 1",
                description: "Preheat oven to 475°F (245°C)"
            },
            {
                title: "Step 2",
                description: "Roll out pizza dough on floured surface"
            },
            {
                title: "Step 3",
                description: "Spread tomato sauce evenly"
            },
            {
                title: "Step 4",
                description: "Add torn mozzarella pieces"
            },
            {
                title: "Step 5",
                description: "Bake for 12-15 minutes until golden"
            },
            {
                title: "Step 6",
                description: "Top with fresh basil and drizzle olive oil"
            }
        ],
    },
    {
        id: "2",
        title: "Chocolate Chip Cookies",
        description: "Soft and chewy homemade chocolate chip cookies",
        author: {
            username: "Baker Sarah",
            id: "2",
            picture: ""
        },
        quantity: 24,
        kind: "dessert",
        preparation_time: 15,
        cooking_time: 12,
        resting_time: 0,
        pictures: ["/chocolate-chip-cookies.png"],
        ingredients: [
            {
                name: "All-purpose flour",
                unit: "",
                quantity: 3
            },
            {
                name: "Butter",
                unit: "",
                quantity: 3
            },
            {
                name: "Brown sugar",
                unit: "",
                quantity: 3
            },
            {
                name: "White sugar",
                unit: "",
                quantity: 3
            },
            {
                name: "Eggs",
                unit: "",
                quantity: 3
            },
            {
                name: "Vanilla extract",
                unit: "",
                quantity: 3
            },
            {
                name: "Chocolate chips",
                unit: "",
                quantity: 3
            },
        ],
        steps: [
            {
                title: "Step 1",
                description: "Preheat oven to 375°F (190°C)",
            },
            {
                title: "Step 2",
                description: "Cream butter and sugars together",
            },
            {
                title: "Step 3",
                description: "Add eggs and vanilla",
            },
            {
                title: "Step 4",
                description: "Mix in flour gradually",
            },
            {
                title: "Step 5",
                description: "Fold in chocolate chips",
            },
            {
                title: "Step 6",
                description: "Bake for 10-12 minutes",
            }
        ],
    },
    {
        id: "3",
        title: "Caesar Salad",
        description: "Crisp romaine lettuce with homemade Caesar dressing quis sunt laboris deserunt id non sit aute duis tempor fugiat Lorem consequat ad nostrud velit dolore velit Lorem consequat minim labore irure ipsum sint culpa cillum voluptate fugiat ad amet laborum aute esse id nisi duis sint deserunt magna",
        author: {
            username: "Chef Julia",
            id: "3",
            picture: ""
        },
        quantity: 4,
        kind: "dish",
        preparation_time: 20,
        cooking_time: 0,
        resting_time: 0,
        pictures: ["/caesar-salad.png"],
        ingredients: [
            {
                name: "Romaine lettuce",
                quantity: 3,
                unit: "4"
            },
            {
                name: "Parmesan cheese",
                quantity: 3,
                unit: "4"
            },
            {
                name: "Croutons",
                quantity: 3,
                unit: "4"
            },
            {
                name: "Anchovies",
                quantity: 3,
                unit: "4"
            },
            {
                name: "Garlic",
                quantity: 3,
                unit: "4"
            },
            {
                name: "Lemon juice",
                quantity: 3,
                unit: "4"
            },
            {
                name: "Olive oil",
                quantity: 3,
                unit: "4"
            },
            {
                name: "Egg yolk",
                quantity: 3,
                unit: "4"
            }
        ],
        steps: [
            {
                title: "Step 1",
                description: "Wash and chop romaine lettuce"
            },
            {
                title: "Step 2",
                description: "Make dressing with garlic, anchovies, lemon juice"
            },
            {
                title: "Step 3",
                description: "Whisk in olive oil and egg yolk"
            },
            {
                title: "Step 4",
                description: "Toss lettuce with dressing"
            },
            {
                title: "Step 5",
                description: "Top with parmesan and croutons"
            }
        ],
    },
]

export const recipes = writable(sampleRecipes)

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
}
