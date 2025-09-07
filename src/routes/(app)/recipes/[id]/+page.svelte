<script lang="ts">
    import {goto} from "$app/navigation";
    import {page} from "$app/state";
    import {getIngredientName, getRecipe, type Recipe} from "$lib/recipes";
    import {FileText, List, Users, Wind, Flame, Clock} from "@lucide/svelte";
    import {toPretty} from "$lib/scripts";
    import {serverUrl} from "$lib/stores";

    const id = page.params.id
    let recipe: Recipe | null | undefined = $state(null)

    $effect(() => {
        if (!id)
            return
        getRecipe(id).then(r => recipe = r.data)
    })
</script>

{#if recipe}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
                onclick={() => goto('/home')}
                class="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
        >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Recipes
        </button>

        <div class="bg-card rounded-lg border border-border overflow-hidden mb-8">
            <div class="aspect-video overflow-hidden">
                <img
                        src={`${$serverUrl}/recipe-pictures/${recipe.pictures[0]}` || "/placeholder.svg"}
                        alt={recipe.title}
                        class="w-full h-full object-cover"
                />
            </div>

            <div class="p-8">
                <div class="flex items-start justify-between mb-4">
                    <h1 class="text-4xl font-bold text-card-foreground text-balance">{recipe.title}</h1>
                    <span class="bg-primary/10 text-primary px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ml-4">
            {toPretty(recipe.kind)}
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
                            <span>Prep: {recipe.preparation_time}min</span>
                        </div>
                        <div class="flex items-center">
                            <Flame size="20" class="mr-2 text-black" />
                            <span>Cook: {recipe.preparation_time}min</span>
                        </div>
                        <div class="flex items-center">
                            <Wind size="20" class="mr-2 text-black" />
                            <span>Rest: {recipe.preparation_time}min</span>
                        </div>
                        <div class="flex items-center">
                            <Users size="20" class="mr-2 text-black" />
                            <span>Servings: {recipe.quantity}</span>
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
                        Ingredients
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
                        Instructions
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
            <h2 class="text-2xl font-semibold text-foreground mb-4">Recipe not found</h2>
            <button
                    onclick={() => goto('/home')}
                    class="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
                Back to Recipes
            </button>
        </div>
    </div>
{/if}
