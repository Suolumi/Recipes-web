<script>
    import { run } from 'svelte/legacy';

    import Button from '../../../components/Button.svelte';
    import Input from '../../../components/Input.svelte';
    import Label from '../../../components/Label.svelte';
    import { user, users, recipes } from "$lib/stores";
    import RecipeCard from '../../../components/RecipeCard.svelte';
    import {goto} from "$app/navigation";

    let username = $state('');
    let email = $state('');
    let firstName = $state('');
    let profilePictureUrl = $state('');
    let message = $state('');

    const userRecipes = $recipes.filter(recipe => recipe.authorId === $user?.id);

    function updateProfile(event) {
        event.preventDefault();
        if (!username || !email) {
            message = 'Please fill in all required fields';
            return;
        }

        // Update user in store
        users.update(userList =>
            userList.map(user =>
                user.id === $user.id
                    ? {
                        ...user,
                        username,
                        email,
                        firstName,
                        profilePicture: profilePictureUrl || user.profilePicture
                    }
                    : user
            )
        );

        // Update current user
        user.set({
            ...$user,
            username,
            email,
            firstName,
            profilePicture: profilePictureUrl || $user.profilePicture
        });

        message = 'Profile updated successfully!';
        setTimeout(() => {
            message = '';
        }, 3000);
    }

    function editRecipe() {
        // Navigate to edit page with recipe data
        goto('/edit')
        // You would set the editing recipe here
    }

    run(() => {
        username = $user?.username || '';
        email = $user?.email || '';
        firstName = $user?.firstName || '';
    });
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p class="text-muted-foreground">Manage your account and recipes</p>
    </div>

    <!-- Profile Settings -->
    <div class="bg-card rounded-lg border border-border p-6 mb-8">
        <h2 class="text-xl font-semibold text-card-foreground mb-4">Profile Information</h2>

        <form class="space-y-4" onsubmit={updateProfile}>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label for="firstName">First Name</Label>
                    <Input
                            id="firstName"
                            type="text"
                            bind:value={firstName}
                            placeholder="Enter your first name"
                    />
                </div>

                <div>
                    <Label for="username" required>Username</Label>
                    <Input
                            id="username"
                            type="text"
                            bind:value={username}
                            required
                            placeholder="Enter your username"
                    />
                </div>
            </div>

            <div>
                <Label for="email" required>Email</Label>
                <Input
                        id="email"
                        type="email"
                        bind:value={email}
                        required
                        placeholder="Enter your email"
                />
            </div>

            <div>
                <Label for="profilePicture">Profile Picture URL</Label>
                <Input
                        id="profilePicture"
                        type="url"
                        bind:value={profilePictureUrl}
                        placeholder="Enter image URL"
                />
            </div>

            {#if message}
                <div class="text-primary text-sm">{message}</div>
            {/if}

            <Button type="submit">
                Update Profile
            </Button>
        </form>
    </div>

    <!-- User's Recipes -->
    <div class="bg-card rounded-lg border border-border p-6">
        <h2 class="text-xl font-semibold text-card-foreground mb-4">Your Recipes ({userRecipes.length})</h2>

        {#if userRecipes.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each userRecipes as recipe}
                    <div class="relative">
                        <RecipeCard {recipe} />
                        <Button
                                variant="outline"
                                size="sm"
                                onclick={() => editRecipe(recipe)}
                                class="absolute top-2 right-2 p-2 bg-card/90 hover:bg-card border border-border"
                                aria-label="Edit recipe"
                        >
                            <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </Button>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="text-center py-8">
                <p class="text-muted-foreground mb-4">You haven't created any recipes yet.</p>
                <Button onclick={() => goto('/create')}>
                    Create Your First Recipe
                </Button>
            </div>
        {/if}
    </div>
</div>
