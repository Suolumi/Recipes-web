<script lang="ts">
    import {selectedRecipe, recipeTypeColors, getUserAvatar, getUserInitial, user} from '$lib/stores';
    import {goto} from "$app/navigation";
    import {toPretty} from "$lib/scripts.js";

    let { recipe } = $props();

    function viewRecipe() {
        selectedRecipe.set(recipe);
        goto('/detail')
    }

    const typeColorClass = $derived(recipeTypeColors[recipe.type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300");
</script>

<div class="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer relative" role="button" tabindex="0" onclick={viewRecipe} onkeydown={(e) => e.key === 'Enter' && viewRecipe()}>
    <div class="aspect-video overflow-hidden">
        <img
                src={recipe.image || "/placeholder.svg"}
                alt={recipe.title}
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
    </div>

    <div class="p-6">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-semibold text-card-foreground text-balance">{recipe.title}</h3>
            <span class="{typeColorClass} px-2 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-2">
        {toPretty(recipe.type)}
      </span>
        </div>

        <p class="text-muted-foreground mb-4 text-pretty">{recipe.description}</p>

        <div class="flex items-center justify-between text-sm text-muted-foreground">
            <span class="font-medium">By {recipe.author}</span>
            <div class="flex items-center space-x-4">
        <span class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
            {recipe.prepTime + recipe.cookTime} min
        </span>
                <span class="flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
                    {recipe.servings}
        </span>
            </div>
        </div>
    </div>

    <div class="absolute bottom-4 left-4">
<!--        @TODO change to get recipe's user-->
        {#if $user}
            {#if getUserAvatar($user)}
                <img
                        src={getUserAvatar($user) || "/placeholder.svg"}
                        alt="{$user.username} profile"
                        class="w-8 h-8 rounded-full border-2 border-card object-cover"
                />
            {:else}
                <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center text-xs font-medium">
                    {getUserInitial($user)}
                </div>
            {/if}
        {/if}
    </div>
</div>
