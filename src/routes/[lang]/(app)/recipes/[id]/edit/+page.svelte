<script lang="ts">
    import RecipeEdit from "../../../../../../components/RecipeEdit.svelte";
    import {editRecipe, getRecipe, type RecipeForm} from "$lib/recipes.js";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {page} from "$app/state";
    import {toastError} from "$lib/utils";
    import {apiErrorMessage} from "$lib/api";
    import {locale, _} from "svelte-i18n";
    import {editRecipeCache} from "$lib/stores";

    const id = page.params.id ?? ''
    let recipe: RecipeForm | undefined = $state(undefined);

    async function submit(recipe: RecipeForm, newPictures: File[]) {
        const {response, data} = await editRecipe(recipe, id, newPictures)
        if (response.ok && data) {
            $editRecipeCache = null
            goto(`/${$locale}/recipes/${data.id}`)
        } else
            toastError(apiErrorMessage(data, $_('edit.toasts.save')))
    }

    onMount(() => {
        if (!id)
            return
        getRecipe(id).then(({response, data}) => {
            if (response.ok && data)
                recipe = data as RecipeForm
        })
    })
</script>

<RecipeEdit onSubmit={submit} {recipe} recipeId={id} headLabel={$_('edit.headLabel')} commentLabel={$_('edit.commentLabel')} />
