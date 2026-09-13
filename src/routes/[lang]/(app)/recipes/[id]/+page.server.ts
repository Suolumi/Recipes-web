import {getRecipe} from "$lib/recipes";

export const load = async ({ params, fetch }) => {
    const { data } = await getRecipe(params.id, params.lang, fetch)
    return {
        recipe: data
    }
}