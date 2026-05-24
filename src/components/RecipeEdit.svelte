<script lang="ts">
    import Button from "./Button.svelte";
    import Input from "./Input.svelte";
    import Textarea from './Textarea.svelte';
    import Select from './Select.svelte';
    import Label from './Label.svelte';
    import RecipeCard from "./RecipeCard.svelte";
    import {
        getIngredientName,
        type Ingredient,
        type RecipeForm,
        RecipeTypes,
        saveRecipeFile,
        type Step
    } from "$lib/recipes";
    import FileUpload from "./FileUpload.svelte";
    import {recipeCache, serverUrl, user} from "$lib/stores";
    import {_} from 'svelte-i18n'
    import {toastError} from "$lib/utils";

    interface Props {
        onChange?: (recipe: RecipeForm) => void;
        onSubmit?: (recipe: RecipeForm) => void;
        recipe?: RecipeForm
        headLabel: string
        commentLabel: string
    }

    let {
        onChange = (recipe: RecipeForm) => {},
        onSubmit = (recipe: RecipeForm) => {},
        recipe = undefined,
        headLabel = $_('create.headLabel'),
        commentLabel = $_('create.commentLabel'),
    }: Props = $props()

    let formData = $state<RecipeForm>(getRecipe(recipe));

    $effect(() => {
        if (recipe)
            formData = recipe
    })

    $effect(() => {
        onChange(formData)
        $recipeCache = formData
    })

    function getRecipe(recipeProps: RecipeForm | undefined): RecipeForm {
        let r = <RecipeForm>{
            title: '',
            description: '',
            quantity: 0,
            kind: 'dish',
            preparation_time: 0,
            cooking_time: 0,
            resting_time: 0,
            ingredients: [],
            steps: [],
            pictures: []
        }

        if (!recipeProps) {
            return $recipeCache ?? r
        }
        return $recipeCache?.title == recipeProps.title ? $recipeCache : recipeProps
    }

    function addIngredient(ingredient: Ingredient) {
        formData.ingredients = [...formData.ingredients, ingredient];
    }

    function removeIngredient(index: number) {
        formData.ingredients = formData.ingredients.filter((_, i) => i !== index);
    }

    function addStep(step: Step) {
        formData.steps = [...formData.steps, step];
    }

    function removeStep(index: number) {
        formData.steps = formData.steps.filter((_, i) => i !== index);
    }

    async function saveRecipe() {
        for (let nb of [...formData.ingredients.map(e => e.quantity), formData.cooking_time, formData.resting_time, formData.preparation_time, formData.quantity]) {
            if (nb < 0)
                return toastError($_('create.toasts.negativeNumber'))
        }
        onSubmit(formData);
    }

    function removePicture(index: number) {
        formData.pictures = formData.pictures.filter((_, i) => i !== index);
    }

    async function onFileUpload(files: FileList) {
        for (const file of files) {
            saveRecipeFile(file).then(res => {
                if (res.data) {
                    if (!formData.pictures)
                        formData.pictures = []
                    formData.pictures.push(res.data.id);
                }
            })
        }
    }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-4 text-balance">{headLabel}</h1>
        <p class="text-xl text-muted-foreground text-pretty">{commentLabel}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-card rounded-lg border border-border p-6">
            <h2 class="text-2xl font-semibold text-card-foreground mb-6">{$_('edit.details')}</h2>
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label for="recipe-title" required>{$_('edit.title.label')}</Label>
                        <Input
                                id="recipe-title"
                                type="text"
                                bind:value={formData.title}
                                placeholder={$_('edit.title.placeholder')}
                        />
                    </div>
                    <div>
                        <Label for="recipe-type">{$_('edit.type.label')}</Label>
                        <Select
                                id="recipe-type"
                                bind:value={formData.kind}
                                options={RecipeTypes.map(e => ({label: $_('recipes.types.' + e), value: e}))}
                        />
                    </div>
                </div>

                <div>
                    <Label for="description" required>{$_('edit.description.label')}</Label>
                    <Textarea
                            id="description"
                            bind:value={formData.description}
                            placeholder={$_('edit.description.placeholder')}
                            rows={3}
                    />
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <Label for="servings">{$_('edit.servings.label')}</Label>
                        <Input
                                id="servings"
                                type="number"
                                bind:value={formData.quantity}
                                min="1"
                        />
                    </div>

                    <div>
                        <Label for="prep-time">{$_('edit.prep.label')} ({$_('recipes.min')})</Label>
                        <Input
                                id="prep-time"
                                type="number"
                                bind:value={formData.preparation_time}
                                min="0"
                        />
                    </div>

                    <div>
                        <Label for="cook-time">{$_('edit.cook.label')} ({$_('recipes.min')})</Label>
                        <Input
                                id="cook-time"
                                type="number"
                                bind:value={formData.cooking_time}
                                min="0"
                        />
                    </div>

                    <div>
                        <Label for="resting-time">{$_('edit.rest.label')} ({$_('recipes.min')})</Label>
                        <Input
                                id="resting-time"
                                type="number"
                                bind:value={formData.resting_time}
                                min="0"
                        />
                    </div>
                </div>

                <div>
                    <Label>{$_('edit.images')}</Label>
                    <FileUpload onFilesSelected={onFileUpload} class="mb-4" />

                    {#if formData.pictures.length > 0 && !formData.pictures[0].includes('placeholder')}
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {#each formData.pictures as image, index}
                                <div class="relative group">
                                    <img
                                            src={`${$serverUrl}/recipe-pictures/${image}`}
                                            alt="Recipe image {index + 1}"
                                            class="w-full h-24 object-cover rounded-lg border border-border"
                                    />
                                    <button
                                            type="button"
                                            onclick={() => removePicture(index)}
                                            class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
                <div>
                    <Label class="mb-4">{$_('edit.ingredients.label')}</Label>

                    <div class="space-y-3">
                        {#each formData.ingredients as ingredient, index}
                            <div class="grid grid-cols-12 gap-2 items-end">
                                <div class="col-span-6">
                                    <Label for={`ingredient-name-${index}`} required>{$_('edit.ingredients.name.label')}</Label>
                                    <Input
                                            id={`ingredient-name-${index}`}
                                            type="text"
                                            bind:value={formData.ingredients[index].name}
                                            placeholder={$_('edit.ingredients.name.placeholder')}
                                    />
                                </div>
                                <div class="col-span-2">
                                    <Label for={`ingredient-quantity-${index}`}>{$_('edit.ingredients.quantity.label')}</Label>
                                    <Input
                                            id={`ingredient-quantity-${index}`}
                                            type="number"
                                            bind:value={formData.ingredients[index].quantity}
                                            placeholder={$_('edit.ingredients.quantity.placeholder')}
                                    />
                                </div>
                                <div class="col-span-3">
                                    <Label for={`ingredient-unit-${index}`}>{$_('edit.ingredients.unit.label')}</Label>
                                    <Input
                                            id={`ingredient-unit-${index}`}
                                            type="text"
                                            bind:value={formData.ingredients[index].unit}
                                            placeholder={$_('edit.ingredients.unit.placeholder')}
                                    />
                                </div>
                                <div class="col-span-1 flex justify-center">
                                    {#if formData.ingredients.length > 1}
                                        <Button
                                                variant="destructive"
                                                size="sm"
                                                onclick={() => removeIngredient(index)}
                                        >
                                            ×
                                        </Button>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div class="flex justify-center items-center mt-4">
                        <Button
                                variant="outline"
                                class="w-full"
                                size="md"
                                onclick={() => addIngredient({
                                    name: '',
                                    quantity: 0,
                                    unit: ''
                                })}
                        >
                            {$_('edit.ingredients.add')}
                        </Button>
                    </div>
                </div>
                <div>
                    <Label class="mb-4">{$_('edit.instructions.label')}</Label>

                    <div class="space-y-3">
                        {#each formData.steps as step, index}
                            <div class="flex gap-2 items-start">
                                <span class="bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm font-medium min-w-[2.5rem] text-center mt-6">
                                    {index + 1}
                                </span>
                                <div class="flex-1 space-y-2">
                                    <div>
                                        <Label for={`step-title-${index}`}>{$_('edit.instructions.title.label')}</Label>
                                        <Input
                                                id={`step-title-${index}`}
                                                type="text"
                                                bind:value={formData.steps[index].title}
                                                placeholder={$_('edit.instructions.title.placeholder')}
                                        />
                                    </div>
                                    <div>
                                        <Label for={`step-description-${index}`}>{$_('edit.instructions.description.label')}</Label>
                                        <Textarea
                                                id={`step-description-${index}`}
                                                bind:value={formData.steps[index].description}
                                                placeholder={$_('edit.instructions.description.placeholder')}
                                                rows={2}
                                        />
                                    </div>
                                </div>
                                {#if formData.steps.length > 1}
                                    <Button
                                            variant="destructive"
                                            size="sm"
                                            onclick={() => removeStep(index)}
                                            class="mt-6"
                                    >
                                        {$_('edit.instructions.remove')}
                                    </Button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                    <div class="flex justify-center items-center mt-4">
                        <Button
                                variant="outline"
                                class="w-full"
                                size="md"
                                onclick={() => addStep({description: '', title: ''})}
                        >
                            {$_('edit.instructions.add')}
                        </Button>
                    </div>
                </div>

                <Button
                        onclick={saveRecipe}
                        class="w-full"
                >
                    {$_('edit.submit')}
                </Button>
            </div>
        </div>
        <div class="bg-card rounded-lg border border-border p-6">
            <h2 class="text-2xl font-semibold text-card-foreground mb-6">{$_('edit.preview')}</h2>

            <RecipeCard recipe={{...formData, author: $user ?? {id: '', username: 'aa', picture: ''}, id: ''}} translate={false} disabled />

            <div class="bg-card rounded-lg border border-border p-6 mb-6 mt-6">
                <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    {$_('recipe.ingredients')}
                </h3>

                {#if formData.ingredients.length > 0 && formData.ingredients.some(i => i.name.trim())}
                    <ul class="space-y-2">
                        {#each formData.ingredients as ingredient}
                            {#if ingredient.name.trim()}
                                <li class="flex items-start text-sm">
                                    <div class="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                    <span class="text-foreground">
                                        {getIngredientName(ingredient)}
                                    </span>
                                </li>
                            {/if}
                        {/each}
                    </ul>
                {:else}
                    <p class="text-sm text-muted-foreground">{$_('create.noIngredient')}</p>
                {/if}
            </div>

            <div class="bg-card rounded-lg border border-border p-6">
                <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
                    </svg>
                    {$_('recipe.instructions')}
                </h3>

                {#if formData.steps.length > 0 && formData.steps.some(s => s.title.trim() || s.description.trim())}
                    <div class="space-y-4">
                        {#each formData.steps as step}
                            {#if step.title.trim() || step.description.trim()}
                                <div class="flex gap-3">
                                    <div class="text-sm">
                                        {#if step.title.trim()}
                                            <h4 class="font-semibold text-foreground mb-1">{step.title}</h4>
                                        {/if}
                                        {#if step.description.trim()}
                                            <p class="text-foreground leading-relaxed">{step.description}</p>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    </div>
                {:else}
                    <p class="text-sm text-muted-foreground">{$_('create.noStep')}</p>
                {/if}
            </div>
        </div>
    </div>
</div>
