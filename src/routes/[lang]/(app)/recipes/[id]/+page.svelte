<script lang="ts">
    import {goto} from "$app/navigation";
    import {page} from "$app/state";
    import {getIngredientName, getRecipe, type Recipe} from "$lib/recipes";
    import emblaCarouselSvelte from "embla-carousel-svelte";
    import {FileText, List, Users, Wind, Flame, Clock, ArrowLeft, ArrowRight} from "@lucide/svelte";
    import {serverUrl} from "$lib/stores";
    import {_, locale} from "svelte-i18n";

    const id = page.params.id
    let recipe: Recipe | null | undefined = $state(null)

    $effect(() => {
        if (!id)
            return
        getRecipe(id).then(r => recipe = r.data)
    })

    let emblaApi: any = $state();

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
</script>

{#if recipe}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
                onclick={() => goto(`/${$locale}/home`)}
                class="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
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
                <div class="embla" use:emblaCarouselSvelte onemblaInit={emblaInit}>
                    {#if (recipe.pictures?.length ?? 0) >= 1}
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
                        <p class="embla__slide flex items-center justify-center h-full border-b border-b-border">{$_('recipeCard.noPicture')}</p>
                    {/if}
                </div>
            </div>

            <div class="p-8">
                <div class="flex items-start justify-between mb-4">
                    <h1 class="text-4xl font-bold text-card-foreground text-balance">{recipe.title}</h1>
                    <span class="bg-primary/10 text-primary px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ml-4">
            {$_('recipes.types.' + recipe.kind)}
          </span>
                </div>

                <p class="text-xl text-muted-foreground mb-6 text-pretty">{recipe.description}</p>

                <div class="flex items-center justify-between">
                    <div class="flex justify-center items-center gap-x-2">
                        {#if recipe.author.picture}
                            <img
                                    src={recipe.author.picture || "/placeholder.svg"}
                                    alt="{recipe.author.username} profile"
                                    class="w-8 h-8 rounded-full border-2 border-card object-cover"
                            />
                        {:else}
                            <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center text-xs font-medium">
                                {recipe.author.username.charAt(0) || "?"}
                            </div>
                        {/if}
                        <span class="text-lg font-medium text-card-foreground">By {recipe.author?.username || 'Author Name'}</span>
                    </div>

                    <div class="flex items-center space-x-6 text-muted-foreground">
                        <div class="flex items-center">
                            <Clock size="20" class="mr-2 text-black" />
                            <span>{$_('recipe.prep')}: {recipe.preparation_time}{$_('recipes.min')}</span>
                        </div>
                        <div class="flex items-center">
                            <Flame size="20" class="mr-2 text-black" />
                            <span>{$_('recipe.cook')}: {recipe.cooking_time}{$_('recipes.min')}</span>
                        </div>
                        <div class="flex items-center">
                            <Wind size="20" class="mr-2 text-black" />
                            <span>{$_('recipe.rest')}: {recipe.resting_time}{$_('recipes.min')}</span>
                        </div>
                        <div class="flex items-center">
                            <Users size="20" class="mr-2 text-black" />
                            <span>{$_('recipe.servings')}: {recipe.quantity}</span>
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
                                <p class="text-card-foreground leading-relaxed pl-4">{step.description}</p>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else if recipe === null}
<!--    @TODO skeleton loading-->
{:else}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
            <h2 class="text-2xl font-semibold text-foreground mb-4">{$_('recipe.notFound')}</h2>
            <button
                    onclick={() => goto(`/${$locale}/home`)}
                    class="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
                {$_('recipe.back')}
            </button>
        </div>
    </div>
{/if}
