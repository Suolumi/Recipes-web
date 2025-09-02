<script lang="ts">
    import { user, darkMode } from '$lib/stores';
    import {goto} from "$app/navigation";
    import Button from "./Button.svelte";

    function toggleDarkMode(): void {
        darkMode.update((mode: boolean) => {
            const newMode: boolean = !mode;
            if (newMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return newMode;
        });
    }

    let showProfileDropdown: boolean = $state(false);

    function toggleProfileDropdown(): void {
        showProfileDropdown = !showProfileDropdown;
    }

    function logout(): void {
        user.set(null);
        showProfileDropdown = false;
        goto('/home');
    }
</script>

<nav class="bg-card border-b border-border sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
                <button
                        onclick={() => goto('/home')}
                        class="text-2xl font-bold text-primary hover:text-primary/80 transition-colors hover:cursor-pointer"
                        aria-label="Recipes"
                >
                    Recipes
                </button>

                <div class="hidden md:flex space-x-6">
                    <button
                            onclick={() => goto('/home')}
                            class="text-foreground hover:text-primary transition-colors font-medium hover:cursor-pointer"
                            aria-label="All Recipes"
                    >
                        All Recipes
                    </button>
                    <button
                            onclick={() => goto('/create')}
                            class="text-foreground hover:text-primary transition-colors font-medium hover:cursor-pointer"
                            aria-label="Create Recipe"
                    >
                        Create Recipe
                    </button>
                </div>
            </div>

            <div class="flex items-center space-x-4">
                <button
                        onclick={toggleDarkMode}
                        class="p-2 text-foreground hover:text-primary hover:cursor-pointer transition-colors rounded-lg hover:bg-muted"
                        aria-label="Toggle dark mode"
                >
                    {#if $darkMode}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    {:else}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    {/if}
                </button>

                {#if $user}
                    <div class="relative">
                        <button
                                onclick={toggleProfileDropdown}
                                class="flex items-center space-x-2 p-1 rounded-full hover:bg-muted transition-colors hover:cursor-pointer"
                                aria-label="Profile menu"
                        >
                            {#if $user.picture}
                                <img src={$user.picture || "/placeholder.svg"} alt="Profile" class="w-8 h-8 rounded-full object-cover" />
                            {:else}
                                <div class="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                    {$user.username?.charAt(0) || '?'}
                                </div>
                            {/if}
                        </button>

                        {#if showProfileDropdown}
                            <div class="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                                <button
                                        onclick={() => { goto('/settings'); showProfileDropdown = false; }}
                                        class="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors hover:cursor-pointer"
                                >
                                    Settings
                                </button>
                                <button
                                        onclick={logout}
                                        class="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors hover:cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="flex space-x-2">
                        <button
                                onclick={() => goto('login')}
                                class="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors hover:cursor-pointer"
                        >
                            Login
                        </button>
                        <Button
                                variant="primary"
                                onclick={() => goto('register')}
                                class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors hover:cursor-pointer"
                        >
                            Register
                        </Button>
                    </div>
                {/if}
            </div>

            <div class="md:hidden">
                <button class="text-foreground hover:text-primary" aria-label="Menu">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</nav>
