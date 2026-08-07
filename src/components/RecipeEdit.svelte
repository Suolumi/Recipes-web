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
    import {Trash2} from "@lucide/svelte";

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

    const steps = [
        {id: 'basics', icon: 'M4 6h16M4 12h16M4 18h7'},
        {id: 'ingredients', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'},
        {id: 'instructions', icon: 'M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33'},
        {id: 'photos', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'},
    ]
    let currentStep = $state(0);

    function goToStep(index: number) {
        currentStep = Math.max(0, Math.min(steps.length - 1, index));
    }

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
            saveRecipeFile(file).then(({response, data}) => {
                if (response.ok && data) {
                    if (!formData.pictures)
                        formData.pictures = []
                    formData.pictures.push(data.id);
                }
            })
        }
    }

    let hasPictures = $derived(formData.pictures.length > 0 && !formData.pictures[0].includes('placeholder'));
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-4xl font-bold text-foreground mb-2 text-balance">{headLabel}</h1>
    <p class="text-lg text-muted-foreground text-pretty">{commentLabel}</p>
  </div>

  <div class="grid grid-cols-1 gap-8">
    <div class="bg-card rounded-lg border border-border p-6">
      <h2 class="text-2xl font-semibold text-card-foreground mb-6">{$_('edit.details')}</h2>
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-8">
          <!-- Form column -->
          <div class="lg:col-span-3">
            <!-- Stepper -->
            <div class="mb-8">
              <ol class="flex items-center">
                {#each steps as step, index}
                  {@const isDone = index < currentStep}
                  {@const isActive = index === currentStep}
                  <li class="flex items-center {index < steps.length - 1 ? 'flex-1' : ''}">
                    <button
                        type="button"
                        onclick={() => goToStep(index)}
                        class="flex flex-col items-center gap-2 group focus:outline-none"
                        aria-current={isActive ? 'step' : undefined}
                    >
                                <span
                                    class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                                        {isActive ? 'border-primary bg-primary text-primary-foreground' :
                                         isDone ? 'border-primary bg-primary/10 text-primary' :
                                         'border-border bg-card text-muted-foreground group-hover:border-primary/50'}"
                                >
                                    {#if isDone}
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    {:else}
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={step.icon}></path>
                                        </svg>
                                    {/if}
                                </span>
                      <span class="text-xs font-medium hidden sm:block {isActive ? 'text-foreground' : 'text-muted-foreground'}">
                                    {$_('edit.wizard.' + step.id + '.name')}
                                </span>
                    </button>
                    {#if index < steps.length - 1}
                      <div class="flex-1 h-0.5 mx-2 -mt-6 sm:-mt-6 transition-colors {isDone ? 'bg-primary' : 'bg-border'}"></div>
                    {/if}
                  </li>
                {/each}
              </ol>
            </div>

            <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div class="mb-6">
                <p class="text-sm font-medium text-primary mb-1">
                  {$_('edit.wizard.stepLabel', {values: {current: currentStep + 1, total: steps.length}})}
                </p>
                <h2 class="text-2xl font-semibold text-card-foreground">
                  {$_('edit.wizard.' + steps[currentStep].id + '.name')}
                </h2>
                <p class="text-sm text-muted-foreground mt-1">
                  {$_('edit.wizard.' + steps[currentStep].id + '.hint')}
                </p>

                <!-- Step 1: Basics -->
                {#if currentStep === 0}
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
                        <Input id="servings" type="number" bind:value={formData.quantity} min="1" />
                      </div>
                      <div>
                        <Label for="prep-time">{$_('edit.prep.label')} ({$_('recipes.min')})</Label>
                        <Input id="prep-time" type="number" bind:value={formData.preparation_time} min="0" />
                      </div>
                      <div>
                        <Label for="cook-time">{$_('edit.cook.label')} ({$_('recipes.min')})</Label>
                        <Input id="cook-time" type="number" bind:value={formData.cooking_time} min="0" />
                      </div>
                      <div>
                        <Label for="resting-time">{$_('edit.rest.label')} ({$_('recipes.min')})</Label>
                        <Input id="resting-time" type="number" bind:value={formData.resting_time} min="0" />
                      </div>
                    </div>
                  </div>
                {/if}

                <!-- Step 2: Ingredients -->
                {#if currentStep === 1}
                  <div>
                    {#if formData.ingredients.length === 0}
                      <div class="text-center py-8 px-4 rounded-lg border border-dashed border-border bg-muted/30 mb-4">
                        <p class="text-sm text-muted-foreground">{$_('edit.wizard.empty.ingredients')}</p>
                      </div>
                    {/if}
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
                            <button
                                type="button"
                                onclick={() => removeIngredient(index)}
                                aria-label={$_('edit.ingredients.remove')}
                                class="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <Trash2 class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      {/each}
                    </div>
                    <div class="mt-4">
                      <Button
                          variant="outline"
                          class="w-full"
                          size="md"
                          onclick={() => addIngredient({name: '', quantity: 0, unit: ''})}
                      >
                        {$_('edit.ingredients.add')}
                      </Button>
                    </div>
                  </div>
                {/if}

                <!-- Step 3: Instructions -->
                {#if currentStep === 2}
                  <div>
                    {#if formData.steps.length === 0}
                      <div class="text-center py-8 px-4 rounded-lg border border-dashed border-border bg-muted/30 mb-4">
                        <p class="text-sm text-muted-foreground">{$_('edit.wizard.empty.instructions')}</p>
                      </div>
                    {/if}
                    <div class="space-y-3">
                      {#each formData.steps as step, index}
                        <div class="flex gap-3 items-start rounded-lg border border-border p-4">
                                    <span class="bg-primary text-primary-foreground w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center flex-shrink-0 mt-1">
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
                          <button
                              type="button"
                              onclick={() => removeStep(index)}
                              aria-label={$_('edit.instructions.remove')}
                              class="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0 mt-1"
                          >
                            <Trash2 class="w-4 h-4" />
                          </button>
                        </div>
                      {/each}
                    </div>
                    <div class="mt-4">
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
                {/if}

                <!-- Step 4: Photos -->
                {#if currentStep === 3}
                  <div>
                    <FileUpload onFilesSelected={onFileUpload} class="mb-4" />

                    {#if hasPictures}
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
                {/if}

                <!-- Navigation -->
                <div class="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
                  <Button
                      variant="outline"
                      onclick={() => goToStep(currentStep - 1)}
                      disabled={currentStep === 0}
                  >
                    {$_('edit.wizard.back')}
                  </Button>

                  {#if currentStep < steps.length - 1}
                    <Button onclick={() => goToStep(currentStep + 1)}>
                      {$_('edit.wizard.next')}
                    </Button>
                  {:else}
                    <Button onclick={saveRecipe}>
                      {$_('edit.submit')}
                    </Button>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Live preview column -->
            <div class="lg:col-span-2">
              <div class="lg:sticky lg:top-8 space-y-6">
                <h2 class="text-2xl font-semibold text-card-foreground">{$_('edit.preview')}</h2>

                <RecipeCard recipe={{...formData, author: $user ?? {id: '', username: 'aa', picture: ''}, id: ''}} translate={false} disabled />

                <div class="bg-card rounded-xl border border-border p-6">
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

                <div class="bg-card rounded-xl border border-border p-6">
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
        </div>
      </div>
    </div>
  </div>
</div>