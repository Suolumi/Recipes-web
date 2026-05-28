import {getRecipe} from "$lib/recipes";

export const load = async ({ params, fetch }) => {
    const { data } = await getRecipe(params.id, undefined, fetch)
    return {
        recipe: data
    }
}