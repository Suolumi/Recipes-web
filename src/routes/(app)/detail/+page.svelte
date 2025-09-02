<script>
    import { selectedRecipe } from '$lib/stores';
    import {goto} from "$app/navigation";

    function goBack() {
        goto('/home')
    }
</script>

{#if $selectedRecipe}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        Back Button
        <button
                onclick={goBack}
                class="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
        >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Recipes
        </button>

        Recipe Header
        <div class="bg-card rounded-lg border border-border overflow-hidden mb-8">
            <div class="aspect-video overflow-hidden">
                <img
                        src={$selectedRecipe.image || "/placeholder.svg"}
                        alt={$selectedRecipe.title}
                        class="w-full h-full object-cover"
                />
            </div>

            <div class="p-8">
                <div class="flex items-start justify-between mb-4">
                    <h1 class="text-4xl font-bold text-card-foreground text-balance">{$selectedRecipe.title}</h1>
                    <span class="bg-primary/10 text-primary px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ml-4">
            {$selectedRecipe.type}
          </span>
                </div>

                <p class="text-xl text-muted-foreground mb-6 text-pretty">{$selectedRecipe.description}</p>

                <div class="flex items-center justify-between">
                    <span class="text-lg font-medium text-card-foreground">By {$selectedRecipe.author}</span>

                    <div class="flex items-center space-x-6 text-muted-foreground">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Prep: {$selectedRecipe.prepTime}min</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
                            </svg>
                            <span>Cook: {$selectedRecipe.cookTime}min</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span>Serves: {$selectedRecipe.servings}</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                            <span>{$selectedRecipe.heating}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        Recipe Content
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            Ingredients
            <div class="lg:col-span-1">
                <div class="bg-card rounded-lg border border-border p-6 sticky top-24">
                    <h2 class="text-2xl font-semibold text-card-foreground mb-6 flex items-center">
                        <svg class="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Ingredients
                    </h2>

                    <ul class="space-y-3">
                        {#each $selectedRecipe.ingredients as ingredient}
                            <li class="flex items-start">
                                <div class="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <span class="text-card-foreground">{ingredient}</span>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>

            Instructions
            <div class="lg:col-span-2">
                <div class="bg-card rounded-lg border border-border p-6">
                    <h2 class="text-2xl font-semibold text-card-foreground mb-6 flex items-center">
                        <svg class="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
                        </svg>
                        Instructions
                    </h2>

                    <div class="space-y-6">
                        {#each $selectedRecipe.steps as step, index}
                            <div class="flex gap-4">
                                <div class="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                    {index + 1}
                                </div>
                                <p class="text-card-foreground leading-relaxed pt-1">{step}</p>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
            <h2 class="text-2xl font-semibold text-foreground mb-4">Recipe not found</h2>
            <button
                    onclick={goBack}
                    class="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
                Back to Recipes
            </button>
        </div>
    </div>
{/if}
