<script lang="ts">
    import {recipeTypeColors} from '$lib/recipes';
    import {goto} from "$app/navigation";
    import type {RecipePreview} from "$lib/recipes";
    import emblaCarouselSvelte from "embla-carousel-svelte";
    import {ArrowLeft, ArrowRight} from "@lucide/svelte";
    import {serverUrl} from "$lib/stores";
    import {locale, _} from "svelte-i18n";

    let { recipe }: { recipe: RecipePreview } = $props();
    let emblaApi: any = $state();

    function viewRecipe(id: string) {
        goto(`/${$locale}/recipes/${id}`);
    }

    function emblaInit(e) {
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

    const typeColorClass = $derived(recipeTypeColors[recipe.kind] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300");
</script>

<div
        class="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
        role="button"
        tabindex="0"
        onclick={() => viewRecipe(recipe.id)}
        onkeydown={(e) => e.key === 'Enter' && viewRecipe(recipe.id)}
>
    <div class="relative">
        {#if recipe.pictures.length > 1}
            <button class="absolute h-full flex flex-col justify-center left-0 z-20 hover:cursor-pointer"
                    onclick={prev}>
                <ArrowLeft class="text-white" />
            </button>
            <button class="absolute h-full flex flex-col justify-center right-0 z-20 hover:cursor-pointer"
                    onclick={next}>
                <ArrowRight class="text-white" />
            </button>
        {/if}
        <div class="embla" use:emblaCarouselSvelte onemblaInit={emblaInit}>
            {#if recipe.pictures.length >= 1}
                <div class="embla__container">
                    {#each recipe.pictures as picture}
                        <img
                                src={`${$serverUrl}/recipe-pictures/${picture}`}
                                alt={recipe.title || 'Recipe Title'}
                                class="embla__slide__img aspect-video object-cover hover:scale-105 transition-transform duration-300"
                        />
                    {/each}
                </div>
            {:else}
                <p class="embla__slide flex items-center justify-center h-full border-b border-b-border">No pictures added yet.</p>
            {/if}
        </div>
    </div>

    <div class="p-6 flex-1">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-semibold text-card-foreground text-balance">{recipe.title || 'Recipe Title'}</h3>
            <span class="{typeColorClass} px-2 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-2">
        {$_('recipes.types.' + recipe.kind)}
      </span>
        </div>

        <p class="text-muted-foreground mb-4 text-pretty">{recipe.description ? recipe.description.length > 200 ? recipe.description.slice(0, 200) + '...' : recipe.description : 'Recipe description will appear here...'}</p>

    </div>
    <div class="px-6 pb-6 flex items-center justify-between text-sm text-muted-foreground">
        <div class="flex justify-center items-center gap-x-2">
            {#if recipe.author.picture}
                <img
                        src={`${$serverUrl}/pictures/${recipe.author.picture}` || "/placeholder.svg"}
                        alt="{recipe.author.username} profile"
                        class="w-8 h-8 rounded-full border-2 border-card object-cover"
                />
            {:else}
                <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center text-xs font-medium">
                    {recipe.author.username.charAt(0) || "?"}
                </div>
            {/if}
            <span class="font-medium">{$_('recipeCard.by')} {recipe.author?.username || 'Author Name'}</span>
        </div>
        <div class="flex items-center space-x-4">
        <span class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
            {recipe.preparation_time + recipe.cooking_time + recipe.resting_time} {$_('recipes.min')}
        </span>
            <span class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
                {recipe.quantity}
        </span>
        </div>
    </div>
</div>

<style>
    .embla {
        overflow: hidden;
    }
    .embla__container {
        display: flex;
    }
    .embla__slide {
        flex: 0 0 100%;
        min-width: 0;
    }
</style>
