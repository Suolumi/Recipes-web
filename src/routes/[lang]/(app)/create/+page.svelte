<script lang="ts">
    import {createRecipe, type RecipeForm} from "$lib/recipes.js";
    import {goto} from "$app/navigation";
    import RecipeEdit from "../../../../components/RecipeEdit.svelte";
    import {onMount} from "svelte";
    import {accessToken} from "$lib/stores";
    import {toastError} from "$lib/utils";
    import {locale, _} from "svelte-i18n";

    async function submit(recipe: RecipeForm) {
        const res = await createRecipe(recipe)
        if (res.data) {
            goto(`/${$locale}/recipes/${res.data.id}`)
        } else
            toastError($_('create.toasts.save'));
    }

    onMount(() => {
        if (!$accessToken || $accessToken === "") {
            toastError($_('create.toasts.noAccount'))
            goto(`/${$locale}/home`)
        }
    })
</script>

<RecipeEdit onSubmit={submit} headLabel={$_('create.headLabel')} commentLabel={$_('create.commentLabel')} />