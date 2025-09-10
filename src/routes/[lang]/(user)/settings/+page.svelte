<script lang="ts">
    import Button from '../../../../components/Button.svelte';
    import Input from '../../../../components/Input.svelte';
    import Label from '../../../../components/Label.svelte';
    import RecipeCard from '../../../../components/RecipeCard.svelte';
    import {goto} from "$app/navigation";
    import {getRecipes, type RecipePreview} from "$lib/recipes";
    import {serverUrl, user} from "$lib/stores";
    import { SquarePen, Trash } from '@lucide/svelte';
    import {updateSelf, type User} from "$lib/user";
    import {toastError} from "$lib/utils";
    import {locale, _} from "svelte-i18n";

    let userForm: User = $state($user ?? {
        username: '',
        email: '',
        id: '',
        picture: ''
    })

    let userRecipes: RecipePreview[] = $state([])

    function updateProfile(event: Event) {
        event.preventDefault();
        updateSelf(userForm).then(res => {
            if (res.data)
                user.set(res.data)
            else
                toastError($_('settings.errors.update'));
        })
    }

    $effect(() => {
        getRecipes({
            author: $user?.username ?? '',
        }).then(res => {
            if (res.data)
                userRecipes = res.data.items
            else
                toastError($_('settings.errors.getRecipes'))
        })
    })

    $effect(() => {
        if ($user)
            userForm = $user
    })

    function editRecipe(id: string) {
        goto(`/${$locale}/recipes/${id}/edit`)
    }
</script>

<div class="max-w-5xl mx-auto px-4 py-8">
    <div class="mb-8">
        <div class="flex items-center gap-x-4">
            {#if $user && $user.picture}
                <img
                        src={`${$serverUrl}/pictures/${$user.picture}` || "/placeholder.svg"}
                        alt="{$user.username} profile"
                        class="w-24 h-24 rounded-full border-2 border-card object-cover"
                />
            {:else}
                <div class="w-24 h-24 rounded-full bg-primary text-primary-foreground border-2 border-card flex items-center justify-center text-4xl font-medium">
                    {($user?.username ?? '?').charAt(0)}
                </div>
            {/if}
            <div>
                <h1 class="text-3xl font-bold text-foreground mb-2">{$user?.username ?? 'No username??'}</h1>
                <p class="text-muted-foreground">{$user?.email ?? 'No email'}</p>
            </div>
        </div>
    </div>

    <!-- Profile Settings -->
    <div class="bg-card rounded-lg border border-border p-6 mb-8">
        <h2 class="text-xl font-semibold text-card-foreground mb-4">{$_('settings.info')}</h2>

        <form class="space-y-4" onsubmit={updateProfile}>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label for="username" required>{$_('settings.username.label')}</Label>
                    <Input
                            id="username"
                            type="text"
                            bind:value={userForm.username}
                            required
                            placeholder={$_('settings.username.placeholder')}
                    />
                </div>
            </div>
            <div>
                <Label for="email" required>{$_('settings.email.label')}</Label>
                <Input
                        id="email"
                        type="email"
                        bind:value={userForm.email}
                        required
                        placeholder={$_('settings.email.placeholder')}
                />
            </div>

            <Button type="submit">
                {$_('settings.submit')}
            </Button>
        </form>
    </div>

    <!-- User's Recipes -->
    <div class="bg-card rounded-lg border border-border p-6">
        <h2 class="text-xl font-semibold text-card-foreground mb-4">{$_('settings.recipeCount')} ({userRecipes.length})</h2>

        {#if userRecipes.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each userRecipes as recipe}
                    <div class="relative">
                        <RecipeCard {recipe} />
                        <Button
                                variant="outline"
                                size="sm"
                                onclick={() => editRecipe(recipe.id)}
                                class="absolute top-2 right-14 p-2 bg-card/90 hover:bg-card border border-border"
                                aria-label="Edit recipe"
                        >
                            <SquarePen class="text-black dark:text-white" size="16" />
                        </Button>
                        <Button
                                variant="destructive"
                                size="sm"
                                onclick={() => alert("Too lazy to make a modal right now, doesn't work")}
                                class="absolute top-2 right-2 p-2 bg-card/90 hover:bg-card"
                                aria-label="Edit recipe"
                        >
                            <Trash size="16" />
                        </Button>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="text-center py-8">
                <p class="text-muted-foreground mb-4">{$_('settings.noRecipes')}</p>
                <Button onclick={() => goto(`/${$locale}/create`)}>
                    {$_('settings.createRecipe')}
                </Button>
            </div>
        {/if}
    </div>
</div>
