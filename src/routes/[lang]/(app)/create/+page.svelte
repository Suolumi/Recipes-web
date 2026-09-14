<script lang="ts">
    import {createRecipe, type RecipeForm} from "$lib/recipes.js";
    import {goto} from "$app/navigation";
    import RecipeEdit from "../../../../components/RecipeEdit.svelte";
    import {onMount} from "svelte";
    import {accessToken, createRecipeCache} from "$lib/stores";
    import {toastError} from "$lib/utils";
    import {apiErrorMessage} from "$lib/api";
    import {locale, _} from "svelte-i18n";

    async function submit(recipe: RecipeForm, newPictures: File[], newStepPictures: Record<number, File>) {
        const {response, data} = await createRecipe(recipe, newPictures, $locale ?? undefined, newStepPictures)
        if (response.ok && data) {
            $createRecipeCache = null
            goto(`/${$locale}/recipes/${data.id}`)
        } else
            toastError(apiErrorMessage(data, $_('create.toasts.save')));
    }

    onMount(() => {
        if (!$accessToken || $accessToken === "") {
            toastError($_('create.toasts.noAccount'))
            goto(`/${$locale}/home`)
        }
    })
</script>

<RecipeEdit onSubmit={submit} headLabel={$_('create.headLabel')} commentLabel={$_('create.commentLabel')} />
