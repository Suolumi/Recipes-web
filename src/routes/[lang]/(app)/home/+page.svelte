<script lang="ts">
    import { untrack } from 'svelte';
    import RecipeCard from '../../../../components/RecipeCard.svelte';
    import {getRecipes, type GetRecipesRequest, type RecipePreview, type RecipeType, RecipeTypes} from "$lib/recipes";
    import { _, locale } from 'svelte-i18n';

    const PAGE_SIZE = 24;

    let searchTerm = $state('');
    let selectedType = $state('all');
    let recipes: RecipePreview[] = $state([])
    // Offset into the non-favorited remainder only (see recipes.ts / the API's
    // `favorite=true` contract): every favorited-matching recipe comes back
    // once, unpaginated, on the offset-0 request, so it must not count toward
    // the offset that pages through the rest — otherwise each page would
    // shift by however many favorites were already shown.
    let restOffset = $state(0);
    let hasMore = $state(true);
    let loading = $state(false);
    let sentinel: HTMLDivElement | undefined = $state();

    let requestId = 0;

    function buildRequest(offset: number): GetRecipesRequest {
        const request: GetRecipesRequest = {}
        if (selectedType !== 'all')
            request.kind = selectedType as RecipeType
        if (searchTerm.length > 0)
            request.title = searchTerm
        request.locale = $locale ?? 'en'
        request.limit = PAGE_SIZE
        request.offset = offset
        request.favorite = true
        return request
    }

    function fetchPage(offset: number, replace: boolean) {
        loading = true
        const id = ++requestId
        getRecipes(buildRequest(offset)).then(({response, data}) => {
            if (id !== requestId)
                return
            loading = false
            if (!response.ok || !data)
                return
            recipes = replace ? data.items : [...recipes, ...data.items]
            const nonFavoritedInPage = data.items.filter(item => !item.favorite).length
            restOffset = replace ? nonFavoritedInPage : restOffset + nonFavoritedInPage
            hasMore = recipes.length < data.length
            requestAnimationFrame(fillViewport)
        })
    }

    function loadMore() {
        if (loading || !hasMore)
            return
        fetchPage(restOffset, false)
    }

    function fillViewport() {
        if (!sentinel || loading || !hasMore)
            return
        if (sentinel.getBoundingClientRect().top < window.innerHeight)
            loadMore()
    }

    $effect(() => {
        searchTerm; selectedType; $locale;
        untrack(() => {
            recipes = []
            hasMore = true
            fetchPage(0, true)
        })
    })

    $effect(() => {
        if (!sentinel)
            return
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting)
                loadMore()
        })
        observer.observe(sentinel)
        return () => observer.disconnect()
    })

    const recipeTypes = $derived([{
        value: 'all',
        label: $_('recipes.types.all'),
    }, ...RecipeTypes.map(e => ({value: e, label: $_('recipes.types.' + e)}))]);
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-4 text-balance">{$_('home.mainText')}</h1>
        <p class="text-xl text-muted-foreground text-pretty">{$_('home.secondaryText')}</p>
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
                            placeholder={$_('home.search')}
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
                        <option value={type.value}>{type.label}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each recipes as recipe (recipe.id)}
            <RecipeCard {recipe} translate />
        {/each}
    </div>

    {#if recipes.length === 0 && !loading}
        <div class="text-center py-12">
            <svg class="mx-auto w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
            </svg>
            <h3 class="text-xl font-semibold text-foreground mb-2">{$_('home.notFound')}</h3>
            <p class="text-muted-foreground">{$_('home.adjustSearch')}</p>
        </div>
    {/if}

    {#if hasMore}
        <div bind:this={sentinel} class="h-10"></div>
    {/if}

    {#if loading}
        <div class="flex justify-center py-8">
            <div class="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin"></div>
        </div>
    {/if}
</div>
