<script lang="ts">
    import RecipeEdit from "../../../../../components/RecipeEdit.svelte";
    import {editRecipe, getRecipe, type RecipeForm} from "$lib/recipes.js";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {page} from "$app/state";
    import {toastError} from "$lib/utils";

    const id = page.params.id ?? ''
    let recipe: RecipeForm | undefined = $state(undefined);

    async function submit(recipe: RecipeForm) {
        const res = await editRecipe(recipe, id)
        if (res.data) {
            goto(`/recipes/${res.data.id}`)
        } else
            toastError("Couldn't save recipe")
    }

    onMount(() => {
        if (!id)
            return
        getRecipe(id).then(r => {
            if (r.data)
                recipe = r.data as RecipeForm
        })
    })
</script>

<RecipeEdit onSubmit={submit} {recipe} headLabel="Edit" commentLabel="I knew I forgot something !" />