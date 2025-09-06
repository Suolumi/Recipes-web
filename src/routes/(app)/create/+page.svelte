<script lang="ts">
    import {createRecipe, type RecipeForm} from "$lib/recipes.js";
    import {goto} from "$app/navigation";
    import RecipeEdit from "../../../components/RecipeEdit.svelte";

    async function submit(recipe: RecipeForm) {
        const res = await createRecipe(recipe)
        if (res.data) {
            goto(`/recipes/${res.data.id}`)
        }
    }
</script>

<RecipeEdit onSubmit={submit} headLabel="Create" commentLabel="Today I will surprise everyone with..." />