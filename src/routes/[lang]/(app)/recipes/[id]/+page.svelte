<script lang="ts">
    import {goto} from "$app/navigation";
    import {page} from "$app/state";
    import {favoriteRecipe, getIngredientName, getRecipe, type Recipe, recipeTypeColors, unfavoriteRecipe} from "$lib/recipes";
    import emblaCarouselSvelte from "embla-carousel-svelte";
    import {FileText, List, Users, Wind, Flame, Clock, ArrowLeft, ArrowRight, Heart, Languages} from "@lucide/svelte";
    import {serverUrl, user} from "$lib/stores";
    import {_, locale} from "svelte-i18n";
    import {toastError} from "$lib/utils";
    import Lightbox from "../../../../../components/Lightbox.svelte";

    const id = page.params.id
    const { data } = $props()
    let recipe: Recipe | null | undefined = $state(data.recipe)

    $effect(() => {
        if (!id)
            return
        getRecipe(id, $locale ?? undefined).then(({response, data}) => {
            if (response.ok && data)
                recipe = data
            else
                toastError($_('settings.errors.getRecipes'))
        })
    })

    let emblaApi: any = $state();
    let lightboxOpen = $state(false);
    let lightboxIndex = $state(0);
    let heartBump = $state(false);

    function emblaInit(e: CustomEvent) {
        emblaApi = e.detail
    }

    function next(e: MouseEvent) {
        e.stopPropagation();
        if (emblaApi)
            emblaApi.scrollNext()
    }

    function prev(e: MouseEvent) {
        e.stopPropagation();
        if (emblaApi)
            emblaApi.scrollPrev()
    }

    function openLightbox(e: MouseEvent) {
        e.stopPropagation();
        if (!recipe?.pictures || recipe.pictures.length === 0)
            return;
        lightboxIndex = emblaApi ? emblaApi.selectedScrollSnap() : 0;
        lightboxOpen = true;
    }

    async function translateRecipe() {
        if (!recipe)
            return
        const {data, response} = await getRecipe(recipe.id, $locale ?? '')
        if (response.ok) {
            recipe = data;
        }
    }

    async function toggleFavorite() {
        if (!recipe)
            return
        heartBump = true;
        const wasFavorite = recipe.favorite;
        recipe = {...recipe, favorite: !wasFavorite, favorite_count: recipe.favorite_count + (wasFavorite ? -1 : 1)};
        try {
            const {response} = wasFavorite ? await unfavoriteRecipe(recipe.id) : await favoriteRecipe(recipe.id);
            if (!response.ok)
                throw new Error('favorite request failed');
        } catch {
            if (!recipe)
                return
            recipe = {...recipe, favorite: wasFavorite, favorite_count: recipe.favorite_count + (wasFavorite ? 1 : -1)};
            toastError($_('recipeCard.favoriteError'));
        }
    }

    const typeColorClass = $derived(recipeTypeColors[(recipe ?? {kind: ''}).kind] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300");
</script>

<svelte:head>
    <title>{recipe?.title}</title>

    <meta property="og:title" content={recipe?.title} />
    <meta property="og:description" content={recipe?.description} />
    <meta property="og:image" content={recipe?.pictures && recipe.pictures.length > 0 ? `${$serverUrl}/recipe-pictures/${recipe.pictures[0]}` : ""} />
    <meta property="og:url" content={`https://recipes.suolumi.fr/${$locale}/recipes/${recipe?.id}`} />
    <meta property="og:type" content="website">
</svelte:head>
{#if recipe}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
                onclick={() => goto(`/${$locale}/home`)}
                class="flex items-center hover:cursor-pointer text-primary hover:text-primary/80 transition-colors mb-6"
        >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            {$_('recipe.back')}
        </button>

        <div class="bg-card rounded-lg border border-border overflow-hidden mb-8">
            <div class="relative">
                {#if (recipe.pictures?.length ?? 0) > 1}
                    <button class="absolute h-full flex flex-col justify-center left-0 z-20 hover:cursor-pointer"
                            onclick={prev}>
                        <ArrowLeft class="text-white" />
                    </button>
                    <button class="absolute h-full flex flex-col justify-center right-0 z-20 hover:cursor-pointer"
                            onclick={next}>
                        <ArrowRight class="text-white" />
                    </button>
                {/if}
                <div
                        class="embla"
                        use:emblaCarouselSvelte
                        onemblaInit={emblaInit}
                        onclick={openLightbox}
                        onkeydown={(e) => e.key === 'Enter' && openLightbox(e as unknown as MouseEvent)}
                        role="button"
                        tabindex="0"
                >
                    {#if (recipe.pictures?.length ?? 0) >= 1}
                        <div class="embla__container flex">
                            {#each recipe.pictures as picture}
                                <img
                                        src={`${$serverUrl}/recipe-pictures/${picture}`}
                                        alt={recipe.title || 'Recipe Title'}
                                        class="embla__slide__img aspect-video object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                                />
                            {/each}
                        </div>
                    {:else}
                        <p class="embla__slide flex items-center justify-center h-full border-b border-b-border">{$_('recipeCard.noPicture')}</p>
                    {/if}
                </div>
            </div>

            <div class="p-8">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <h1 class="text-3xl sm:text-4xl font-bold text-card-foreground text-balance">{recipe.title}</h1>
                    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span class="{typeColorClass} px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                            {$_('recipes.types.' + recipe.kind)}
                        </span>
                        <button
                                onclick={translateRecipe}
                                class="bg-background hover:cursor-pointer hover:bg-accent border-2 border-primary text-primary hover:text-primary px-3 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                                aria-label="Translate recipe"
                                title="Translate recipe"
                        >
                            <Languages size="20" />
                            <span class="text-sm font-semibold">{$_('recipe.translate')}</span>
                        </button>
                        {#if $user}
                            <button
                                    onclick={toggleFavorite}
                                    class="bg-background hover:cursor-pointer hover:bg-accent border-2 border-primary text-primary hover:text-primary px-3 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                                    aria-label={$_(recipe.favorite ? 'recipeCard.unfavorite' : 'recipeCard.favorite')}
                                    title={$_(recipe.favorite ? 'recipeCard.unfavorite' : 'recipeCard.favorite')}
                            >
                                <span
                                        class="inline-flex {heartBump ? 'heart-bump' : ''}"
                                        onanimationend={() => heartBump = false}
                                >
                                    <Heart size="20" fill={recipe.favorite ? 'currentColor' : 'none'} class={recipe.favorite ? 'text-red-500' : ''} />
                                </span>
                                {#if recipe.favorite_count > 0}
                                    <span class="text-sm font-semibold">{recipe.favorite_count}</span>
                                {/if}
                            </button>
                        {/if}
                    </div>
                </div>

                <p class="text-xl text-muted-foreground mb-6 text-pretty whitespace-pre-line">{recipe.description}</p>

                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex items-center gap-x-2">
                        {#if recipe.author.picture}
                            <img
                                    src={`${$serverUrl}/pictures/${recipe.author.picture}`}
                                    alt="{recipe.author.username} profile"
                                    class="w-8 h-8 rounded-full border-2 border-card object-cover"
                            />
                        {:else}
                            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center text-xs font-medium">
                                {recipe.author.username.charAt(0) || "?"}
                            </div>
                        {/if}
                        <span class="text-lg font-medium text-card-foreground">{$_('recipeCard.by')} {recipe.author?.username || 'Author Name'}</span>
                    </div>

                    <div class="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-3 sm:gap-4 lg:gap-6 text-muted-foreground text-sm sm:text-base">
                        <div class="flex items-center">
                            <Clock size="20" class="mr-2 text-black dark:text-current" />
                            <span class="whitespace-nowrap">{$_('recipe.prep')}: {recipe.preparation_time >= 60 ? `${recipe.preparation_time / 60}${$_('recipes.h')} ` : ''}{recipe.preparation_time % 60}{$_('recipes.min')}</span>
                        </div>
                        <div class="flex items-center">
                            <Flame size="20" class="mr-2 text-black dark:text-current" />
                            <span class="whitespace-nowrap">{$_('recipe.cook')}: {recipe.cooking_time >= 60 ? `${recipe.cooking_time / 60}${$_('recipes.h')} ` : ''}{recipe.cooking_time % 60}{$_('recipes.min')}</span>
                        </div>
                        <div class="flex items-center">
                            <Wind size="20" class="mr-2 text-black dark:text-current" />
                            <span class="whitespace-nowrap">{$_('recipe.rest')}: {recipe.resting_time >= 60 ? `${recipe.resting_time / 60}${$_('recipes.h')} ` : ''}{recipe.resting_time % 60}{$_('recipes.min')}</span>
                        </div>
                        <div class="flex items-center">
                            <Users size="20" class="mr-2 text-black dark:text-current" />
                            <span class="whitespace-nowrap">{$_('recipe.servings')}: {recipe.quantity}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
                <div class="bg-card rounded-lg border border-border p-6 sticky top-24">
                    <h2 class="text-2xl font-semibold text-card-foreground mb-6 flex items-center">
                        <FileText class="mr-3 text-primary" />
                        {$_('recipe.ingredients')}
                    </h2>

                    <ul class="space-y-3">
                        {#each recipe.ingredients as ingredient}
                            <li class="flex items-start">
                                <div class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span class="text-card-foreground">{getIngredientName(ingredient)}</span>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>

            <div class="lg:col-span-2">
                <div class="bg-card rounded-lg border border-border p-6">
                    <h2 class="text-2xl font-semibold text-card-foreground mb-6 flex items-center">
                        <List class="mr-3 text-primary" />
                        {$_('recipe.instructions')}
                    </h2>

                    <div class="space-y-4">
                        {#each recipe.steps as step, index}
                            <div>
                                <div class="font-bold text-sm">
                                    {step.title || `Step ${index + 1}`}
                                </div>
                                <p class="text-card-foreground leading-relaxed pl-4 whitespace-pre-line">{step.description}</p>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Lightbox
            open={lightboxOpen}
            pictures={recipe.pictures ?? []}
            startIndex={lightboxIndex}
            alt={recipe.title || 'Recipe Title'}
            onClose={() => lightboxOpen = false}
    />
{:else if recipe === null}
<!--    @TODO skeleton loading-->
{:else}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
            <h2 class="text-2xl font-semibold text-foreground mb-4">{$_('recipe.notFound')}</h2>
            <button
                    onclick={() => goto(`/${$locale}/home`)}
                    class="bg-primary hover:cursor-pointer text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
                {$_('recipe.back')}
            </button>
        </div>
    </div>
{/if}

<style>
    @keyframes heart-bump {
        0% { transform: scale(1); }
        30% { transform: scale(1.4); }
        60% { transform: scale(0.85); }
        100% { transform: scale(1); }
    }
    .heart-bump {
        animation: heart-bump 0.35s ease-in-out;
    }
</style>
