<script lang="ts">
    import RecipeEdit from "../../../../../../components/RecipeEdit.svelte";
    import {editRecipe, getRecipe, type RecipeForm} from "$lib/recipes.js";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {page} from "$app/state";
    import {toastError} from "$lib/utils";
    import {locale, _} from "svelte-i18n";

    const id = page.params.id ?? ''
    let recipe: RecipeForm | undefined = $state(undefined);

    async function submit(recipe: RecipeForm) {
        const {response, data} = await editRecipe(recipe, id)
        if (response.ok && data) {
            goto(`/${$locale}/recipes/${data.id}`)
        } else
            toastError($_('edit.toasts.save'))
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

<RecipeEdit onSubmit={submit} {recipe} headLabel={$_('edit.headLabel')} commentLabel={$_('edit.commentLabel')} />