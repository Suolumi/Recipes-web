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
        const res = await editRecipe(recipe, id)
        if (res.data) {
            goto(`/${$locale}/recipes/${res.data.id}`)
        } else
            toastError($_('edit.toasts.save'))
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

<RecipeEdit onSubmit={submit} {recipe} headLabel={$_('edit.headLabel')} commentLabel={$_('edit.commentLabel')} />