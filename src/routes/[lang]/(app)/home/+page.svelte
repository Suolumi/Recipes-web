<script lang="ts">
    import { untrack } from 'svelte';
    import RecipeCard from '../../../../components/RecipeCard.svelte';
    import {getRecipes, recipeTypeColors, type GetRecipesRequest, type RecipePreview, type RecipeType, RecipeTypes} from "$lib/recipes";
    import {searchUsers, type User as AuthorUser} from "$lib/user";
    import {serverUrl} from "$lib/stores";
    import { _, locale } from 'svelte-i18n';
    import { Search, SlidersHorizontal, ChevronDown, User, X } from '@lucide/svelte';

    const PAGE_SIZE = 24;
    const TIME_PRESETS = ['any', '15', '30', '45', '60'] as const;
    type TimePreset = typeof TIME_PRESETS[number];

    let searchTerm = $state('');
    let selectedType = $state('all');
    let filtersOpen = $state(false);
    let author = $state('');
    let authorSuggestions: AuthorUser[] = $state([]);
    let showAuthorSuggestions = $state(false);
    let authorFieldRef: HTMLDivElement | undefined = $state();
    let authorSearchId = 0;
    let ingredientInput = $state('');
    let ingredients: string[] = $state([]);
    let timeBasis: 'prep' | 'total' = $state('total');
    let timeTarget: TimePreset = $state('any');
    let recipes: RecipePreview[] = $state([])
    let totalCount: number | undefined = $state(undefined);
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

    const hasActiveFilters = $derived(
        selectedType !== 'all' || author.length > 0 || ingredients.length > 0 || timeTarget !== 'any'
    );

    function timeLabel(preset: TimePreset): string {
        if (preset === 'any') return $_('home.timeAny')
        if (preset === '60') return $_('home.timeHour')
        return $_('home.timeMinutes', {values: {minutes: preset}})
    }

    function onIngredientKeyDown(e: KeyboardEvent) {
        if (e.key !== 'Enter') return
        e.preventDefault()
        const value = ingredientInput.trim()
        if (!value) {
            return
        }
        if (!ingredients.some(i => i.toLowerCase() === value.toLowerCase()))
            ingredients = [...ingredients, value]
        ingredientInput = ''
    }

    function removeIngredient(ingredient: string) {
        ingredients = ingredients.filter(i => i !== ingredient)
    }

    function selectAuthor(username: string) {
        author = username
        showAuthorSuggestions = false
    }

    function onAuthorInput() {
        showAuthorSuggestions = true
    }

    function clearAllFilters() {
        selectedType = 'all'
        author = ''
        ingredients = []
        ingredientInput = ''
        timeTarget = 'any'
    }

    function buildRequest(offset: number): GetRecipesRequest {
        const request: GetRecipesRequest = {}
        if (selectedType !== 'all')
            request.kind = selectedType as RecipeType
        if (searchTerm.length > 0)
            request.title = searchTerm
        if (author.length > 0)
            request.author = author
        if (ingredients.length > 0)
            request.ingredients = ingredients
        if (timeTarget !== 'any') {
            const minutes = Number(timeTarget)
            if (timeBasis === 'prep')
                request.preparation_time = minutes
            else
                request.total_time = minutes
        }
        request.locale = $locale ?? 'en'
        request.search_locale = $locale ?? 'en'
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
            totalCount = data.length
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
        searchTerm; selectedType; $locale; author; ingredients; timeBasis; timeTarget;
        untrack(() => {
            recipes = []
            hasMore = true
            fetchPage(0, true)
        })
    })

    $effect(() => {
        const query = author.trim()
        const id = ++authorSearchId
        if (!query) {
            authorSuggestions = []
            return
        }
        const timeout = setTimeout(() => {
            searchUsers(query, 5).then(({response, data}) => {
                if (id !== authorSearchId)
                    return
                if (!response.ok || !data)
                    return
                authorSuggestions = data.items.slice(0, 5)
            })
        }, 250)
        return () => clearTimeout(timeout)
    })

    $effect(() => {
        if (!authorFieldRef)
            return
        function onClickOutside(e: MouseEvent) {
            if (authorFieldRef && !authorFieldRef.contains(e.target as Node))
                showAuthorSuggestions = false
        }
        document.addEventListener('click', onClickOutside)
        return () => document.removeEventListener('click', onClickOutside)
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
            <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                        type="text"
                        placeholder={$_('home.search')}
                        bind:value={searchTerm}
                        class="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
            </div>

            <button
                    type="button"
                    onclick={() => filtersOpen = !filtersOpen}
                    class="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors
                        {filtersOpen ? 'border-primary text-primary bg-background' : 'border-border text-foreground bg-background hover:bg-accent hover:text-accent-foreground'}"
            >
                <SlidersHorizontal class="w-4 h-4" />
                {$_('home.moreFilters')}
                <ChevronDown class="w-4 h-4 transition-transform {filtersOpen ? 'rotate-180' : ''}" />
            </button>
        </div>

        <div class="flex gap-2 overflow-x-auto mt-4 pb-1">
            {#each recipeTypes as type}
                <button
                        type="button"
                        onclick={() => selectedType = type.value}
                        class="flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border-2 transition-colors
                            {type.value === 'all'
                                ? (selectedType === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border')
                                : (recipeTypeColors[type.value] + (selectedType === type.value ? ' border-current' : ' border-transparent'))}"
                >
                    {type.label}
                </button>
            {/each}
        </div>

        {#if filtersOpen}
            <div class="mt-4 pt-4 border-t border-border flex flex-wrap gap-6">
                <div class="flex flex-col gap-2 min-w-[220px] flex-1">
                    <label class="text-sm font-medium text-foreground" for="author-filter">{$_('home.author')}</label>
                    <div class="relative" bind:this={authorFieldRef}>
                        <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <input
                                id="author-filter"
                                type="text"
                                autocomplete="off"
                                placeholder={$_('home.authorPlaceholder')}
                                bind:value={author}
                                oninput={onAuthorInput}
                                class="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                        {#if showAuthorSuggestions && authorSuggestions.length > 0}
                            <div class="absolute left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg py-1 z-50 overflow-hidden">
                                {#each authorSuggestions as suggestion (suggestion.id)}
                                    <button
                                            type="button"
                                            onclick={() => selectAuthor(suggestion.username)}
                                            class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-200 dark:hover:bg-gray-800"
                                    >
                                        {#if suggestion.picture}
                                            <img
                                                    src={`${$serverUrl}/pictures/${suggestion.picture}`}
                                                    alt="{suggestion.username} profile"
                                                    class="w-6 h-6 rounded-full object-cover flex-none"
                                            />
                                        {:else}
                                            <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium flex-none">
                                                {suggestion.username.charAt(0) || "?"}
                                            </div>
                                        {/if}
                                        <span class="truncate">{suggestion.username}</span>
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>

                <div class="flex flex-col gap-2 min-w-[220px] flex-1">
                    <label class="text-sm font-medium text-foreground" for="ingredient-filter">{$_('home.ingredients')}</label>
                    <input
                            id="ingredient-filter"
                            type="text"
                            placeholder={$_('home.ingredientsPlaceholder')}
                            bind:value={ingredientInput}
                            onkeydown={onIngredientKeyDown}
                            class="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                    {#if ingredients.length > 0}
                        <div class="flex flex-wrap gap-2 mt-1">
                            {#each ingredients as ingredient}
                                <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-input border border-border text-sm text-foreground">
                                    {ingredient}
                                    <button type="button" onclick={() => removeIngredient(ingredient)} class="text-muted-foreground hover:text-foreground">
                                        <X class="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            {/each}
                        </div>
                    {/if}
                </div>

                <div class="flex flex-col gap-2 min-w-[220px] flex-1">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-medium text-foreground">{$_('home.readyIn')}</span>
                        <div class="relative inline-flex border border-border rounded-full p-0.5 gap-0.5">
                            <div
                                    class="absolute top-0.5 bottom-0.5 left-0.5 w-[92px] bg-foreground rounded-full transition-transform duration-200 ease-out"
                                    style="transform: translateX({timeBasis === 'total' ? '94px' : '0'})"
                            ></div>
                            <button
                                    type="button"
                                    onclick={() => timeBasis = 'prep'}
                                    class="relative z-10 w-[92px] py-1 rounded-full text-xs font-medium text-center transition-colors {timeBasis === 'prep' ? 'text-background' : 'text-muted-foreground'}"
                            >
                                {$_('home.prepTime')}
                            </button>
                            <button
                                    type="button"
                                    onclick={() => timeBasis = 'total'}
                                    class="relative z-10 w-[92px] py-1 rounded-full text-xs font-medium text-center transition-colors {timeBasis === 'total' ? 'text-background' : 'text-muted-foreground'}"
                            >
                                {$_('home.totalTime')}
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each TIME_PRESETS as preset}
                            <button
                                    type="button"
                                    onclick={() => timeTarget = preset}
                                    class="px-4 py-2 rounded-full text-sm font-medium border transition-colors
                                        {timeTarget === preset
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-foreground border-border'}"
                            >
                                {timeLabel(preset)}
                            </button>
                        {/each}
                    </div>
                    {#if timeTarget !== 'any'}
                        <p class="text-xs text-muted-foreground">{$_('home.closestMatch')}</p>
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    {#if hasActiveFilters}
        <div class="flex flex-wrap items-center gap-2 mb-6 -mt-4">
            {#if selectedType !== 'all'}
                <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-card border border-border text-sm text-foreground">
                    {$_('recipes.types.' + selectedType)}
                    <button type="button" onclick={() => selectedType = 'all'} class="text-muted-foreground hover:text-foreground">
                        <X class="w-3.5 h-3.5" />
                    </button>
                </span>
            {/if}
            {#if author.length > 0}
                <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-card border border-border text-sm text-foreground">
                    {$_('home.activeAuthor', {values: {author}})}
                    <button type="button" onclick={() => author = ''} class="text-muted-foreground hover:text-foreground">
                        <X class="w-3.5 h-3.5" />
                    </button>
                </span>
            {/if}
            {#each ingredients as ingredient}
                <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-card border border-border text-sm text-foreground">
                    {ingredient}
                    <button type="button" onclick={() => removeIngredient(ingredient)} class="text-muted-foreground hover:text-foreground">
                        <X class="w-3.5 h-3.5" />
                    </button>
                </span>
            {/each}
            {#if timeTarget !== 'any'}
                <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-card border border-border text-sm text-foreground">
                    {$_(timeBasis === 'prep' ? 'home.activeTimePrep' : 'home.activeTimeTotal', {values: {time: timeLabel(timeTarget)}})}
                    <button type="button" onclick={() => timeTarget = 'any'} class="text-muted-foreground hover:text-foreground">
                        <X class="w-3.5 h-3.5" />
                    </button>
                </span>
            {/if}
            <button type="button" onclick={clearAllFilters} class="text-sm font-medium text-primary hover:underline">
                {$_('home.clearAll')}
            </button>
        </div>
    {/if}

    {#if totalCount !== undefined}
        <p class="text-sm text-muted-foreground mb-4">{$_('home.resultCount', {values: {count: totalCount}})}</p>
    {/if}

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
