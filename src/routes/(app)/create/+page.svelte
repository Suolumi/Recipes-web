<script lang="ts">
    import {createRecipe, type RecipeForm} from "$lib/recipes.js";
    import {goto} from "$app/navigation";
    import RecipeEdit from "../../../components/RecipeEdit.svelte";
    import {onMount} from "svelte";
    import {accessToken} from "$lib/stores";
    import {toastError} from "$lib/utils";

    async function submit(recipe: RecipeForm) {
        const res = await createRecipe(recipe)
        if (res.data) {
            goto(`/recipes/${res.data.id}`)
        } else
            toastError("Failed to create recipe");
    }

    onMount(() => {
        if (!$accessToken || $accessToken === "") {
            toastError("You need to create an account first")
            goto("/home")
        }
    })
</script>

<RecipeEdit onSubmit={submit} headLabel="Create" commentLabel="Today I will surprise everyone with..." />