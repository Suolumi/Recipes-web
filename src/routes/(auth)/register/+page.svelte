<script lang="ts">
    import Button from '../../../components/Button.svelte';
    import Input from '../../../components/Input.svelte';
    import Label from '../../../components/Label.svelte';
    import {accessToken, refreshToken} from '$lib/stores';

    import {goto} from "$app/navigation";
    import {register, type RegisterRequest} from "$lib/auth";

    let email = $state('');
    let username = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let error = $state('');

    async function handleRegister(event: SubmitEvent) {
        event.preventDefault();
        error = '';

        if (!email || !username || !password || !confirmPassword) {
            error = 'Please fill in all fields';
            return;
        }

        if (password !== confirmPassword) {
            error = 'Passwords do not match';
            return;
        }

        if (password.length < 10) {
            error = 'Password must be at least 10 characters';
            return;
        }

        // Create new user
        const newUser: RegisterRequest = {
            username,
            email,
            password
        };

        const response = await register(newUser);
        if (response.data) {
            accessToken.set(response.data.access_token);
            refreshToken.set(response.data.refresh_token);
            await goto('/home')
        } else {
            console.error(response.response)
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h2 class="text-3xl font-bold text-foreground">Join Recipes</h2>
            <p class="mt-2 text-muted-foreground">Create your account to start sharing recipes</p>
        </div>

        <form class="mt-8 space-y-6" onsubmit={handleRegister}>
            <div class="space-y-4">
                <div>
                    <Label for="email" required>Email address</Label>
                    <Input
                            id="email"
                            type="email"
                            bind:value={email}
                            placeholder="Enter your email"
                    />
                </div>

                <div>
                    <Label for="username" required>Username</Label>
                    <Input
                            id="username"
                            type="text"
                            bind:value={username}
                            placeholder="Choose a username"
                    />
                </div>

                <div>
                    <Label for="password" required>Password</Label>
                    <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder="Create a password"
                    />
                </div>

                <div>
                    <Label for="confirmPassword" required>Confirm Password</Label>
                    <Input
                            id="confirmPassword"
                            type="password"
                            bind:value={confirmPassword}
                            placeholder="Confirm your password"
                    />
                </div>
            </div>

            {#if error}
                <div class="text-destructive text-sm text-center">{error}</div>
            {/if}

            <Button type="submit" class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Create Account
            </Button>

            <div class="text-center">
                <p class="text-muted-foreground">
                    Already have an account?
                    <Button variant="link" onclick={() => goto('/login')} class="p-0 h-auto font-medium">
                        Sign in
                    </Button>
                </p>
            </div>
        </form>
    </div>
</div>
