<script lang="ts">
    import Button from "./Button.svelte";
    import Input from "./Input.svelte";
    import Textarea from './Textarea.svelte';
    import Select from './Select.svelte';
    import Label from './Label.svelte';
    import RecipeCard from "./RecipeCard.svelte";
    import {type Ingredient, type RecipeForm, RecipeTypes, saveRecipeFile, type Step} from "$lib/recipes";
    import FileUpload from "./FileUpload.svelte";
    import {serverUrl} from "$lib/stores";
    import {_} from 'svelte-i18n'

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
        headLabel = 'Create',
        commentLabel = 'Today I will surprise everyone with...',
    }: Props = $props()

    let formData = $state<RecipeForm>(recipe ?? {
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
    });

    $effect(() => {
        if (recipe)
            formData = recipe
    })

    $effect(() => onChange(formData))

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
        onSubmit(formData);
    }

    function removePicture(index: number) {
        formData.pictures = formData.pictures.filter((_, i) => i !== index);
    }

    async function onFileUpload(files: FileList) {
        for (const file of files) {
            saveRecipeFile(file).then(res => {
                if (res.data) {
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
                    <div class="flex items-center justify-between mb-4">
                        <Label>{$_('edit.ingredients.label')}</Label>
                        <Button
                                variant="outline"
                                size="sm"
                                onclick={() => addIngredient({
                                    name: '',
                                    quantity: 0,
                                    unit: ''
                                })}
                        >
                            {$_('edit.ingredients.add')}
                        </Button>
                    </div>

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
                                <div class="col-span-1">
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
                </div>
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <Label>{$_('edit.instructions.label')}</Label>
                        <Button
                                variant="outline"
                                size="sm"
                                onclick={() => addStep({description: '', title: ''})}
                        >
                            {$_('edit.instructions.add')}
                        </Button>
                    </div>

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

            <RecipeCard recipe={{...formData, author: $user ?? {id: '', username: 'aa', picture: ''}, id: ''}} />
        </div>
    </div>
</div>
