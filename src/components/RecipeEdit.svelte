<script lang="ts">
    import Button from "./Button.svelte";
    import Input from "./Input.svelte";
    import Textarea from './Textarea.svelte';
    import Select from './Select.svelte';
    import Label from './Label.svelte';
    import RecipeCard from "./RecipeCard.svelte";
    import {
        getIngredientName,
        groupIngredients,
        type Ingredient,
        type RecipeForm,
        RecipeTypes,
        type Step
    } from "$lib/recipes";
    import FileUpload from "./FileUpload.svelte";
    import ImageCropModal from "./ImageCropModal.svelte";
    import {createRecipeCache, editRecipeCache, serverUrl, user} from "$lib/stores";
    import {untrack} from "svelte";
    import {_} from 'svelte-i18n'
    import {toastError} from "$lib/utils";
    import {Trash2, GripVertical, EllipsisVertical, Plus} from "@lucide/svelte";

    interface Props {
        onChange?: (recipe: RecipeForm) => void;
        onSubmit?: (recipe: RecipeForm, newPictures: File[]) => void;
        recipe?: RecipeForm
        recipeId?: string
        headLabel: string
        commentLabel: string
    }

    let {
        onChange = (recipe: RecipeForm) => {},
        onSubmit = (recipe: RecipeForm, newPictures: File[]) => {},
        recipe = undefined,
        recipeId = undefined,
        headLabel = $_('create.headLabel'),
        commentLabel = $_('create.commentLabel'),
    }: Props = $props()

    let formData = $state<RecipeForm>(getRecipe(recipe));
    let pendingPictures = $state<{file: File, url: string}[]>([])

    const steps = [
        {id: 'basics', icon: 'M4 6h16M4 12h16M4 18h7'},
        {id: 'ingredients', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'},
        {id: 'instructions', icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'},
        {id: 'photos', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'},
    ]
    let currentStep = $state(0);

    function goToStep(index: number) {
        currentStep = Math.max(0, Math.min(steps.length - 1, index));
    }

    $effect(() => {
        if (recipe)
            untrack(() => {
                formData = getRecipe(recipe)
                sections = buildSections(formData.ingredients)
            })
    })

    $effect(() => {
        onChange(formData)
        if (recipeId !== undefined)
            $editRecipeCache = {id: recipeId, data: formData}
        else
            $createRecipeCache = formData
    })

    function normalizeRecipe(data: RecipeForm): RecipeForm {
        return {
            ...data,
            ingredients: (data.ingredients ?? []).map(ingredient => ({...ingredient, label: ingredient.label ?? ''})),
            steps: data.steps ?? [],
            pictures: data.pictures ?? [],
        }
    }

    // A cache entry that has no content is indistinguishable from the blank
    // bootstrap value written before the real recipe has loaded; treat it as
    // "no draft" so it never shadows freshly-fetched data.
    function isBlank(data: RecipeForm): boolean {
        return !data.title && !data.description &&
            (data.ingredients?.length ?? 0) === 0 &&
            (data.steps?.length ?? 0) === 0 &&
            (data.pictures?.length ?? 0) === 0
    }

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

        if (recipeId !== undefined) {
            const cached = $editRecipeCache?.id === recipeId ? $editRecipeCache.data : undefined
            return normalizeRecipe(cached && !isBlank(cached) ? cached : (recipeProps ?? r))
        }

        return normalizeRecipe($createRecipeCache && !isBlank($createRecipeCache) ? $createRecipeCache : (recipeProps ?? r))
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
        onSubmit(formData, pendingPictures.map(picture => picture.file));
    }

    function removePicture(index: number) {
        formData.pictures = formData.pictures.filter((_, i) => i !== index);
    }

    let cropQueue = $state<File[]>([])
    let currentCropFile = $state<File | null>(null)

    function advanceCropQueue() {
        const [next, ...rest] = cropQueue
        currentCropFile = next ?? null
        cropQueue = rest
    }

    async function onFileUpload(files: FileList) {
        cropQueue = [...cropQueue, ...Array.from(files)]
        if (!currentCropFile)
            advanceCropQueue()
    }

    function onCropConfirm(croppedFile: File) {
        pendingPictures = [...pendingPictures, {file: croppedFile, url: URL.createObjectURL(croppedFile)}]
        advanceCropQueue()
    }

    function onCropCancel() {
        advanceCropQueue()
    }

    function removePendingPicture(index: number) {
        const picture = pendingPictures[index]
        if (picture)
            URL.revokeObjectURL(picture.url)
        pendingPictures = pendingPictures.filter((_, i) => i !== index)
    }

    let hasPictures = $derived(((formData.pictures?.length ?? 0) > 0 && !formData.pictures[0].includes('placeholder')) || pendingPictures.length > 0);

    let previewIngredientGroups = $derived(groupIngredients(formData.ingredients.filter(i => i.name.trim())));

    // --- Ingredient categories -------------------------------------------------
    // The backend only stores a free-text `label` per ingredient; a "category" is
    // just the set of ingredients sharing one. The block below turns that into an
    // editable structure (add/rename/delete/drag-reorder categories, drag ingredients
    // between them) and syncs the result straight back into formData.ingredients -
    // so `label` stays the single source of truth on save, nothing new is added to
    // the recipe schema.

    type EditSection = { id: string, name: string | null, ingredients: Ingredient[] };

    let sectionUid = 0;

    function nextSectionId(): string {
        sectionUid += 1;
        return `sec-${sectionUid}`;
    }

    // The unlabeled group (id 'uncategorized', name null) is always present, even
    // empty, so there's always a default drop target and an "Add ingredient" button.
    function buildSections(ingredients: Ingredient[]): EditSection[] {
        const groups = groupIngredients(ingredients);
        const withUncategorized = groups[0]?.label === null ? groups : [{label: null, items: []}, ...groups];
        return withUncategorized.map(group => ({
            id: group.label === null ? 'uncategorized' : nextSectionId(),
            name: group.label,
            ingredients: group.items
        }));
    }

    function flattenSections(list: EditSection[]): Ingredient[] {
        return list.flatMap(section => section.ingredients.map(ingredient => ({...ingredient, label: section.name ?? ''})));
    }

    let sections = $state<EditSection[]>(untrack(() => buildSections(formData.ingredients)));

    $effect(() => {
        formData.ingredients = flattenSections(sections);
    });

    let editingSectionId = $state<string | null>(null);
    let editingSectionName = $state('');
    let openMenuFor = $state<Ingredient | null>(null);

    function addCategory() {
        const id = nextSectionId();
        sections = [...sections, {id, name: '', ingredients: []}];
        editingSectionId = id;
        editingSectionName = '';
    }

    function startRename(section: EditSection) {
        if (section.id === 'uncategorized') return;
        editingSectionId = section.id;
        editingSectionName = section.name ?? '';
    }

    // An empty, never-named category (created via "Add category" then abandoned)
    // has nothing to persist - drop it instead of leaving a stray empty header.
    function cancelSectionEdit() {
        if (!editingSectionId) return;
        const section = sections.find(s => s.id === editingSectionId);
        if (section && section.ingredients.length === 0 && !section.name)
            sections = sections.filter(s => s.id !== editingSectionId);
        editingSectionId = null;
        editingSectionName = '';
    }

    function confirmSectionName() {
        if (!editingSectionId) return;
        const id = editingSectionId;
        const trimmed = editingSectionName.trim();
        const section = sections.find(s => s.id === id);
        if (!section) {
            editingSectionId = null;
            editingSectionName = '';
            return;
        }

        if (!trimmed) {
            if (section.ingredients.length === 0)
                sections = sections.filter(s => s.id !== id);
            editingSectionId = null;
            editingSectionName = '';
            return;
        }

        // Renaming to match another category's name merges the two, same as
        // giving two ingredients the same label used to.
        const match = sections.find(s => s.id !== id && s.name !== null && s.name.toLowerCase() === trimmed.toLowerCase());
        sections = match
            ? sections
                .map(s => s.id === match.id ? {...s, ingredients: [...s.ingredients, ...section.ingredients]} : s)
                .filter(s => s.id !== id)
            : sections.map(s => s.id === id ? {...s, name: trimmed} : s);
        editingSectionId = null;
        editingSectionName = '';
    }

    function deleteSection(id: string) {
        const section = sections.find(s => s.id === id);
        if (!section) return;
        sections = sections
            .map(s => s.id === 'uncategorized' ? {...s, ingredients: [...s.ingredients, ...section.ingredients]} : s)
            .filter(s => s.id !== id);
        if (editingSectionId === id) {
            editingSectionId = null;
            editingSectionName = '';
        }
    }

    function addIngredientToSection(sectionId: string) {
        sections = sections.map(s => s.id === sectionId
            ? {...s, ingredients: [...s.ingredients, {name: '', quantity: 0, unit: '', label: s.name ?? ''}]}
            : s);
    }

    function removeIngredientFromSection(sectionId: string, ingredient: Ingredient) {
        sections = sections.map(s => s.id === sectionId
            ? {...s, ingredients: s.ingredients.filter(it => it !== ingredient)}
            : s);
    }

    function moveIngredientToSection(ingredient: Ingredient, fromSectionId: string, toSectionId: string) {
        openMenuFor = null;
        if (fromSectionId === toSectionId) return;
        sections = sections.map(s => {
            if (s.id === fromSectionId) return {...s, ingredients: s.ingredients.filter(it => it !== ingredient)};
            if (s.id === toSectionId) return {...s, ingredients: [...s.ingredients, ingredient]};
            return s;
        });
    }

    // --- Drag & drop -------------------------------------------------------
    // Pointer capture on the grip handle keeps move/up events targeted at it even
    // once the cursor leaves the row, so no window-level listeners are needed.

    type Dragging =
        | { type: 'ingredient', sectionId: string, ingredient: Ingredient }
        | { type: 'section', sectionId: string };

    type DropIndicator =
        | { kind: 'ingredient', sectionId: string, beforeItem: Ingredient | null, before: boolean }
        | { kind: 'section', beforeSectionId: string, before: boolean };

    let dragging = $state<Dragging | null>(null);
    let dropIndicator = $state<DropIndicator | null>(null);
    let dragPos = $state<{ x: number, y: number } | null>(null);

    function isSectionDragged(section: EditSection): boolean {
        return dragging !== null && dragging.type === 'section' && dragging.sectionId === section.id;
    }

    function isSectionDropAbove(section: EditSection): boolean {
        return dropIndicator !== null && dropIndicator.kind === 'section' && dropIndicator.beforeSectionId === section.id && dropIndicator.before;
    }

    function isSectionDropBelow(section: EditSection): boolean {
        return dropIndicator !== null && dropIndicator.kind === 'section' && dropIndicator.beforeSectionId === section.id && !dropIndicator.before;
    }

    function isSectionEmptyDropTarget(section: EditSection): boolean {
        return dropIndicator !== null && dropIndicator.kind === 'ingredient' && dropIndicator.sectionId === section.id && section.ingredients.length === 0;
    }

    function isRowDragged(ingredient: Ingredient): boolean {
        return dragging !== null && dragging.type === 'ingredient' && dragging.ingredient === ingredient;
    }

    function isRowDropAbove(section: EditSection, ingredient: Ingredient): boolean {
        return dropIndicator !== null && dropIndicator.kind === 'ingredient' && dropIndicator.sectionId === section.id && dropIndicator.beforeItem === ingredient && dropIndicator.before;
    }

    function isRowDropBelow(section: EditSection, ingredient: Ingredient): boolean {
        return dropIndicator !== null && dropIndicator.kind === 'ingredient' && dropIndicator.sectionId === section.id && dropIndicator.beforeItem === ingredient && !dropIndicator.before;
    }

    function startIngredientDrag(e: PointerEvent, sectionId: string, ingredient: Ingredient) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        dragging = {type: 'ingredient', sectionId, ingredient};
        dragPos = {x: e.clientX + 14, y: e.clientY + 14};
        dropIndicator = null;
    }

    function startSectionDrag(e: PointerEvent, sectionId: string) {
        if (sectionId === 'uncategorized') return;
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        dragging = {type: 'section', sectionId};
        dragPos = {x: e.clientX + 14, y: e.clientY + 14};
        dropIndicator = null;
    }

    function handleDragPointerMove(e: PointerEvent) {
        if (!dragging) return;
        dragPos = {x: e.clientX + 14, y: e.clientY + 14};

        if (dragging.type === 'ingredient') {
            const dragged = dragging.ingredient;
            let best: { sectionId: string, item: Ingredient, mid: number } | null = null;
            let bestDist = Infinity;
            for (const row of document.querySelectorAll<HTMLElement>('[data-row]')) {
                const sectionId = row.dataset.section!;
                const rowIndex = Number(row.dataset.rowIndex);
                const item = sections.find(s => s.id === sectionId)?.ingredients[rowIndex];
                if (!item || item === dragged) continue;
                const rect = row.getBoundingClientRect();
                const mid = rect.top + rect.height / 2;
                const dist = Math.abs(e.clientY - mid);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = {sectionId, item, mid};
                }
            }
            if (best) {
                dropIndicator = {kind: 'ingredient', sectionId: best.sectionId, beforeItem: best.item, before: e.clientY < best.mid};
                return;
            }
            let zone: HTMLElement | undefined;
            for (const z of document.querySelectorAll<HTMLElement>('[data-section-dropzone]')) {
                const rect = z.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    zone = z;
                    break;
                }
            }
            dropIndicator = zone ? {kind: 'ingredient', sectionId: zone.dataset.section!, beforeItem: null, before: true} : null;
        } else {
            let best: { sectionId: string, mid: number } | null = null;
            let bestDist = Infinity;
            for (const block of document.querySelectorAll<HTMLElement>('[data-section-block]')) {
                const sectionId = block.dataset.section!;
                if (sectionId === 'uncategorized' || sectionId === dragging.sectionId) continue;
                const rect = block.getBoundingClientRect();
                const mid = rect.top + rect.height / 2;
                const dist = Math.abs(e.clientY - mid);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = {sectionId, mid};
                }
            }
            dropIndicator = best ? {kind: 'section', beforeSectionId: best.sectionId, before: e.clientY < best.mid} : null;
        }
    }

    function handleDragPointerUp() {
        if (!dragging) return;
        const drag = dragging;
        const drop = dropIndicator;

        if (drag.type === 'ingredient' && drop?.kind === 'ingredient') {
            const item = drag.ingredient;
            let working = sections.map(s => s.id === drag.sectionId
                ? {...s, ingredients: s.ingredients.filter(it => it !== item)}
                : s);
            const toIdx = working.findIndex(s => s.id === drop.sectionId);
            if (toIdx !== -1) {
                const list = working[toIdx].ingredients.slice();
                let insertAt = list.length;
                if (drop.beforeItem) {
                    const pos = list.indexOf(drop.beforeItem);
                    if (pos !== -1) insertAt = drop.before ? pos : pos + 1;
                }
                list.splice(insertAt, 0, item);
                working[toIdx] = {...working[toIdx], ingredients: list};
            }
            sections = working;
        } else if (drag.type === 'section' && drop?.kind === 'section') {
            const fromIdx = sections.findIndex(s => s.id === drag.sectionId);
            if (fromIdx !== -1) {
                const moving = sections[fromIdx];
                let working = sections.filter(s => s.id !== drag.sectionId);
                let insertAt = working.length;
                const pos = working.findIndex(s => s.id === drop.beforeSectionId);
                if (pos !== -1) insertAt = drop.before ? pos : pos + 1;
                if (insertAt < 1) insertAt = 1; // uncategorized always stays first
                working.splice(insertAt, 0, moving);
                sections = working;
            }
        }

        dragging = null;
        dropIndicator = null;
        dragPos = null;
    }

    let dragGhostLabel = $derived.by(() => {
        const drag = dragging;
        if (!drag) return '';
        if (drag.type === 'ingredient') return drag.ingredient.name || $_('edit.ingredients.name.placeholder');
        return sections.find(s => s.id === drag.sectionId)?.name ?? '';
    });

    $effect(() => {
        function onDocPointerDown(e: PointerEvent) {
            if (openMenuFor && !(e.target instanceof Element && e.target.closest('[data-keep-menu]')))
                openMenuFor = null;
        }

        document.addEventListener('pointerdown', onDocPointerDown, true);
        return () => document.removeEventListener('pointerdown', onDocPointerDown, true);
    });
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
                        <Input id="servings" type="number" bind:value={formData.quantity} min={1} />
                      </div>
                      <div>
                        <Label for="prep-time">{$_('edit.prep.label')} ({$_('recipes.min')})</Label>
                        <Input id="prep-time" type="number" bind:value={formData.preparation_time} min={0} />
                      </div>
                      <div>
                        <Label for="cook-time">{$_('edit.cook.label')} ({$_('recipes.min')})</Label>
                        <Input id="cook-time" type="number" bind:value={formData.cooking_time} min={0} />
                      </div>
                      <div>
                        <Label for="resting-time">{$_('edit.rest.label')} ({$_('recipes.min')})</Label>
                        <Input id="resting-time" type="number" bind:value={formData.resting_time} min={0} />
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

                    <p class="text-sm text-muted-foreground mb-4">{$_('edit.ingredients.dragHint')}</p>

                    <div class="space-y-5">
                      {#each sections as section (section.id)}
                        <div
                            data-section-block
                            data-section={section.id}
                            class="transition-opacity"
                            style={isSectionDragged(section) ? 'opacity:0.4' : ''}
                        >
                          {#if isSectionDropAbove(section)}
                            <div class="h-0.5 bg-primary rounded mb-2"></div>
                          {/if}

                          {#if section.name !== null}
                            <div class="flex items-center gap-1 mb-2">
                              <button
                                  type="button"
                                  onpointerdown={(e) => startSectionDrag(e, section.id)}
                                  onpointermove={handleDragPointerMove}
                                  onpointerup={handleDragPointerUp}
                                  onpointercancel={handleDragPointerUp}
                                  class="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-grab touch-none transition-colors"
                                  aria-label="Reorder category"
                              >
                                <GripVertical class="w-4 h-4" />
                              </button>

                              {#if editingSectionId === section.id}
                                <Input
                                    value={editingSectionName}
                                    oninput={(e: Event) => editingSectionName = (e.target as HTMLInputElement).value}
                                    onblur={confirmSectionName}
                                    onkeydown={(e: KeyboardEvent) => {
                                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                        if (e.key === 'Escape') cancelSectionEdit();
                                    }}
                                    placeholder={$_('edit.ingredients.categoryNamePlaceholder')}
                                    class="max-w-[240px] py-1.5 px-2 text-sm font-semibold"
                                />
                              {:else}
                                <button
                                    type="button"
                                    ondblclick={() => startRename(section)}
                                    class="font-semibold text-sm text-foreground px-1 py-1 rounded hover:underline decoration-dotted underline-offset-4 text-left"
                                    title="Double-click to rename"
                                >
                                  {section.name}
                                </button>
                              {/if}

                              <div class="flex-1"></div>

                              <button
                                  type="button"
                                  onclick={() => deleteSection(section.id)}
                                  class="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  aria-label={$_('edit.ingredients.deleteCategory')}
                                  title={$_('edit.ingredients.deleteCategory')}
                              >
                                <Trash2 class="w-4 h-4" />
                              </button>
                            </div>
                          {/if}

                          <div
                              data-section-dropzone
                              data-section={section.id}
                              class="flex flex-col gap-3 min-h-[2.5rem] rounded-lg border-2 border-dashed transition-colors {isSectionEmptyDropTarget(section) ? 'bg-primary/5 border-primary' : 'border-transparent'}"
                          >
                            {#each section.ingredients as ingredient, rowIndex (ingredient)}
                              <div>
                                {#if isRowDropAbove(section, ingredient)}
                                  <div class="h-0.5 bg-primary rounded mb-1.5"></div>
                                {/if}

                                <div
                                    data-row
                                    data-section={section.id}
                                    data-row-index={rowIndex}
                                    class="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-border bg-card transition-opacity touch-none {isRowDragged(ingredient) ? 'opacity-35' : ''}"
                                >
                                  <button
                                      type="button"
                                      onpointerdown={(e) => startIngredientDrag(e, section.id, ingredient)}
                                      onpointermove={handleDragPointerMove}
                                      onpointerup={handleDragPointerUp}
                                      onpointercancel={handleDragPointerUp}
                                      class="col-span-1 flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-grab touch-none transition-colors"
                                      aria-label="Reorder ingredient"
                                  >
                                    <GripVertical class="w-4 h-4" />
                                  </button>

                                  <div class="col-span-5">
                                    <Input
                                        type="text"
                                        bind:value={ingredient.name}
                                        placeholder={$_('edit.ingredients.name.placeholder')}
                                        required
                                        aria-label={$_('edit.ingredients.name.label')}
                                    />
                                  </div>
                                  <div class="col-span-2">
                                    <Input
                                        type="number"
                                        bind:value={ingredient.quantity}
                                        placeholder={$_('edit.ingredients.quantity.placeholder')}
                                        aria-label={$_('edit.ingredients.quantity.label')}
                                    />
                                  </div>
                                  <div class="col-span-2">
                                    <Input
                                        type="text"
                                        bind:value={ingredient.unit}
                                        placeholder={$_('edit.ingredients.unit.placeholder')}
                                        aria-label={$_('edit.ingredients.unit.label')}
                                    />
                                  </div>

                                  <div class="col-span-1 flex justify-center relative" data-keep-menu>
                                    <button
                                        type="button"
                                        onclick={(e) => { e.stopPropagation(); openMenuFor = openMenuFor === ingredient ? null : ingredient; }}
                                        class="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                        aria-label={$_('edit.ingredients.moveTo')}
                                    >
                                      <EllipsisVertical class="w-4 h-4" />
                                    </button>
                                    {#if openMenuFor === ingredient}
                                      <div data-keep-menu class="absolute right-0 top-9 z-30 min-w-[180px] bg-card border border-border rounded-lg shadow-lg p-1.5 flex flex-col gap-0.5">
                                        <div class="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-2 pt-1 pb-0.5">
                                          {$_('edit.ingredients.moveTo')}
                                        </div>
                                        {#each sections.filter(s => s.id !== section.id) as target (target.id)}
                                          <button
                                              type="button"
                                              onclick={() => moveIngredientToSection(ingredient, section.id, target.id)}
                                              class="text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-foreground"
                                          >
                                            {target.name ?? $_('edit.ingredients.uncategorized')}
                                          </button>
                                        {/each}
                                      </div>
                                    {/if}
                                  </div>

                                  <div class="col-span-1 flex justify-center">
                                    <button
                                        type="button"
                                        onclick={() => removeIngredientFromSection(section.id, ingredient)}
                                        aria-label={$_('edit.ingredients.remove')}
                                        class="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                      <Trash2 class="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {#if ingredient.name.trim()}
                                  <p class="text-xs text-muted-foreground mt-1 pl-1">
                                    {$_('edit.ingredients.preview', {values: {text: getIngredientName(ingredient)}})}
                                  </p>
                                {/if}

                                {#if isRowDropBelow(section, ingredient)}
                                  <div class="h-0.5 bg-primary rounded mt-1.5"></div>
                                {/if}
                              </div>
                            {/each}
                          </div>

                          <div class="mt-3">
                            <Button
                                variant="outline"
                                class="w-full"
                                size="sm"
                                onclick={() => addIngredientToSection(section.id)}
                            >
                              {section.name ? $_('edit.ingredients.addToSection', {values: {section: section.name}}) : $_('edit.ingredients.add')}
                            </Button>
                          </div>

                          {#if isSectionDropBelow(section)}
                            <div class="h-0.5 bg-primary rounded mt-2"></div>
                          {/if}
                        </div>
                      {/each}
                    </div>

                    <Button
                        variant="outline"
                        class="w-full mt-4 border-dashed"
                        size="md"
                        onclick={addCategory}
                    >
                      <Plus class="w-4 h-4 mr-1" />
                      {$_('edit.ingredients.addCategory')}
                    </Button>
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
                                class="w-full aspect-video object-cover rounded-lg border border-border"
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
                        {#each pendingPictures as picture, index}
                          <div class="relative group">
                            <img
                                src={picture.url}
                                alt="New recipe image {index + 1}"
                                class="w-full aspect-video object-cover rounded-lg border border-border"
                            />
                            <button
                                type="button"
                                onclick={() => removePendingPicture(index)}
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
                <h2 class="text-2xl font-semibold text-card-foreground mt-4">{$_('edit.preview')}</h2>

                <RecipeCard recipe={{...formData, author: $user ?? {id: '', username: 'aa', picture: ''}, id: '', favorite: false, favorite_count: 0}} translate={false} disabled />

                <div class="bg-card rounded-xl border border-border p-6">
                  <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    {$_('recipe.ingredients')}
                  </h3>

                  {#if previewIngredientGroups.length > 0}
                    <div class="space-y-4">
                      {#each previewIngredientGroups as group}
                        <div>
                          {#if group.label}
                            <h4 class="font-semibold text-foreground text-sm mb-2">{group.label}</h4>
                          {/if}
                          <ul class="space-y-2">
                            {#each group.items as ingredient}
                              <li class="flex items-start text-sm">
                                <div class="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <span class="text-foreground">
                                                {getIngredientName(ingredient)}
                                            </span>
                              </li>
                            {/each}
                          </ul>
                        </div>
                      {/each}
                    </div>
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
                                <p class="text-foreground leading-relaxed whitespace-pre-line">{step.description}</p>
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

<ImageCropModal file={currentCropFile} onConfirm={onCropConfirm} onCancel={onCropCancel} />

{#if dragging && dragPos}
  <div
      class="fixed z-50 pointer-events-none bg-card border border-primary rounded-lg px-3 py-2 text-sm font-medium text-foreground shadow-lg"
      style="left:{dragPos.x}px; top:{dragPos.y}px; transform:rotate(-1.5deg);"
  >
    {dragGhostLabel}
  </div>
{/if}
