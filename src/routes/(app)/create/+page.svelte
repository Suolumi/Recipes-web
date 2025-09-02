<script>
    import Button from "../../../components/Button.svelte";
    import Input from "../../../components/Input.svelte";
    import Textarea from '../../../components/Textarea.svelte';
    import Select from '../../../components/Select.svelte';
    import Label from '../../../components/Label.svelte';
    import { recipes } from '$lib/stores';
    import {goto} from "$app/navigation";

    let formData = $state({
        title: '',
        description: '',
        author: '',
        servings: 4,
        type: 'Main Course',
        prepTime: 30,
        cookTime: 30,
        heating: 'Oven',
        ingredients: [''],
        steps: [''],
        image: '/placeholder.svg?height=200&width=300'
    });

    const recipeTypes = ['Main Course', 'Appetizer', 'Dessert', 'Salad', 'Soup', 'Beverage'];
    const heatingTypes = ['Oven', 'Stovetop', 'Grill', 'Microwave', 'None', 'Air Fryer'];

    function addIngredient() {
        formData.ingredients = [...formData.ingredients, ''];
    }

    function removeIngredient(index) {
        formData.ingredients = formData.ingredients.filter((_, i) => i !== index);
    }

    function addStep() {
        formData.steps = [...formData.steps, ''];
    }

    function removeStep(index) {
        formData.steps = formData.steps.filter((_, i) => i !== index);
    }

    function saveRecipe() {
        if (!formData.title || !formData.description || !formData.author) {
            alert('Please fill in all required fields');
            return;
        }

        const newRecipe = {
            id: Date.now(),
            ...formData,
            ingredients: formData.ingredients.filter(i => i.trim()),
            steps: formData.steps.filter(s => s.trim())
        };

        recipes.update(r => [...r, newRecipe]);
        goto('/home')
    }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-4 text-balance">Create New Recipe</h1>
        <p class="text-xl text-muted-foreground text-pretty">Share your culinary creation with the community</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-card rounded-lg border border-border p-6">
            <h2 class="text-2xl font-semibold text-card-foreground mb-6">Recipe Details</h2>
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label for="recipe-title" required>Recipe Title</Label>
                        <Input
                                id="recipe-title"
                                type="text"
                                bind:value={formData.title}
                                placeholder="Enter recipe title"
                        />
                    </div>

                    <div>
                        <Label for="author" required>Author</Label>
                        <Input
                                id="author"
                                type="text"
                                bind:value={formData.author}
                                placeholder="Your name"
                        />
                    </div>
                </div>

                <div>
                    <Label for="description" required>Description</Label>
                    <Textarea
                            id="description"
                            bind:value={formData.description}
                            placeholder="Describe your recipe"
                            rows={3}
                    />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label for="servings">Servings</Label>
                        <Input
                                id="servings"
                                type="number"
                                bind:value={formData.servings}
                                min="1"
                        />
                    </div>

                    <div>
                        <Label for="prep-time">Prep Time (min)</Label>
                        <Input
                                id="prep-time"
                                type="number"
                                bind:value={formData.prepTime}
                                min="0"
                        />
                    </div>

                    <div>
                        <Label for="cook-time">Cook Time (min)</Label>
                        <Input
                                id="cook-time"
                                type="number"
                                bind:value={formData.cookTime}
                                min="0"
                        />
                    </div>

                    <div>
                        <Label for="recipe-type">Type</Label>
                        <Select
                                id="recipe-type"
                                bind:value={formData.type}
                                options={recipeTypes}
                        />
                    </div>
                </div>

                <div>
                    <Label for="heating-method">Heating Method</Label>
                    <Select
                            id="heating-method"
                            bind:value={formData.heating}
                            options={heatingTypes}
                    />
                </div>
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <Label>Ingredients</Label>
                        <Button
                                variant="outline"
                                size="sm"
                                onclick={addIngredient}
                        >
                            Add Ingredient
                        </Button>
                    </div>

                    <div class="space-y-2">
                        {#each formData.ingredients as ingredient, index}
                            <div class="flex gap-2">
                                <Input
                                        id={`ingredient-${index}`}
                                        type="text"
                                        bind:value={formData.ingredients[index]}
                                        placeholder="Enter ingredient"
                                        class="flex-1"
                                />
                                {#if formData.ingredients.length > 1}
                                    <Button
                                            variant="destructive"
                                            size="sm"
                                            onclick={() => removeIngredient(index)}
                                    >
                                        Remove
                                    </Button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <Label>Instructions</Label>
                        <Button
                                variant="outline"
                                size="sm"
                                onclick={addStep}
                        >
                            Add Step
                        </Button>
                    </div>

                    <div class="space-y-2">
                        {#each formData.steps as step, index}
                            <div class="flex gap-2">
                <span class="bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm font-medium min-w-[2.5rem] text-center">
                  {index + 1}
                </span>
                                <Textarea
                                        id={`step-${index}`}
                                        bind:value={formData.steps[index]}
                                        placeholder="Describe this step"
                                        rows={2}
                                        class="flex-1"
                                />
                                {#if formData.steps.length > 1}
                                    <Button
                                            variant="destructive"
                                            size="sm"
                                            onclick={() => removeStep(index)}
                                    >
                                        Remove
                                    </Button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>

                <Button
                        onclick={saveRecipe}
                        class="w-full"
                >
                    Save Recipe
                </Button>
            </div>
        </div>
        <div class="bg-card rounded-lg border border-border p-6">
            <h2 class="text-2xl font-semibold text-card-foreground mb-6">Live Preview</h2>

            <div class="bg-background rounded-lg border border-border overflow-hidden">
                <div class="aspect-video overflow-hidden">
                    <img
                            src={formData.image || "/placeholder.svg"}
                            alt="Recipe preview"
                            class="w-full h-full object-cover"
                    />
                </div>

                <div class="p-6">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="text-xl font-semibold text-foreground text-balance">
                            {formData.title || 'Recipe Title'}
                        </h3>
                        <span class="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-2">
              {formData.type}
            </span>
                    </div>

                    <p class="text-muted-foreground mb-4 text-pretty">
                        {formData.description || 'Recipe description will appear here...'}
                    </p>

                    <div class="flex items-center justify-between text-sm text-muted-foreground">
                        <span class="font-medium">By {formData.author || 'Author Name'}</span>
                        <div class="flex items-center space-x-4">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                  {formData.prepTime + formData.cookTime}min
              </span>
                            <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                                {formData.servings}
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
