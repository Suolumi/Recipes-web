<script lang="ts">
    import { recipes as sampleRecipes } from '$lib/stores';
    import RecipeCard from '../../../components/RecipeCard.svelte';
    import {getRecipes, type GetRecipesRequest, type RecipePreview, type RecipeType, RecipeTypes} from "$lib/recipes";
    import {toPretty} from "$lib/scripts.js";

    let searchTerm = $state('');
    let selectedType = $state('all');
    let recipes: RecipePreview[] = $state([])

    $effect(() => {
        const request: GetRecipesRequest = {}
        if (selectedType !== 'all')
            request.kind = selectedType as RecipeType
        if (searchTerm.length > 0)
            request.title = searchTerm

        getRecipes(request).then(res => {
            if (!res.data)
                return
            recipes = [...res.data.items, ...$sampleRecipes as RecipePreview[]];
        })
    })

    const recipeTypes = $derived([{
        value: 'all',
        label: 'All',
    }, ...RecipeTypes.map(e => ({value: e, label: toPretty(e)}))]);
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-4 text-balance">What's on the menu today?</h1>
        <p class="text-xl text-muted-foreground text-pretty">Maybe this, or that ! Or how about...</p>
    </div>

    <div class="bg-card rounded-lg border border-border p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
                <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                            type="text"
                            placeholder="Search recipes..."
                            bind:value={searchTerm}
                            class="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                </div>
            </div>

            <div class="md:w-48">
                <select
                        bind:value={selectedType}
                        class="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                    {#each recipeTypes as type}
                        <option value={type.value}>{type.value === 'all' ? 'All Types' : type.label}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each recipes as recipe (recipe.id)}
            <RecipeCard {recipe} />
        {/each}
    </div>

    {#if recipes.length === 0}
        <div class="text-center py-12">
            <svg class="mx-auto w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
            </svg>
            <h3 class="text-xl font-semibold text-foreground mb-2">No recipes found</h3>
            <p class="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
    {/if}
</div>
