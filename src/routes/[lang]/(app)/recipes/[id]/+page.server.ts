import type { PageServerLoad } from './$types';
import { getRecipe } from '$lib/recipes';

export const load: PageServerLoad = async ({ params }) => {
    const id = params.id;
    if (!id)
        return { recipe: null };

    const { response, data } = await getRecipe(id);
    return {
        recipe: response.ok ? data : null
    };
};