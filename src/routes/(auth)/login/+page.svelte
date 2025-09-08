<script lang="ts">
    import Button from '../../../components/Button.svelte';
    import Input from '../../../components/Input.svelte';
    import Label from '../../../components/Label.svelte';
    import {goto} from "$app/navigation";
    import {login, type LoginRequest} from "$lib/auth";
    import {accessToken, refreshToken} from "$lib/stores";
    import {toastError, toastSuccess} from "$lib/utils";

    let id = $state('');
    let password = $state('');
    let error = $state('');

    async function handleLogin(event: SubmitEvent) {
        event.preventDefault();
        error = '';

        if (!id || !password) {
            error = 'Please fill in all fields';
            return;
        }

        const request: LoginRequest = {
            id,
            password
        }
        const response = await login(request);
        if (response.data) {
            accessToken.set(response.data.access_token);
            refreshToken.set(response.data.refresh_token);
            toastSuccess("Successfully logged in");
            await goto('/home')
        } else
            toastError("Failed to login");
    }

    function goToRegister() {
        goto('/register');
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h2 class="text-3xl font-bold text-foreground">Sign in to Recipes</h2>
            <p class="mt-2 text-muted-foreground">Welcome back! Please sign in to your account</p>
        </div>

        <form class="mt-8 space-y-6" onsubmit={handleLogin}>
            <div class="space-y-4">
                <div>
                    <Label for="id" required>Email / Username</Label>
                    <Input
                            id="id"
                            type="text"
                            bind:value={id}
                            placeholder="Enter your email / username"
                    />
                </div>

                <div>
                    <Label for="password" required>Password</Label>
                    <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder="Enter your password"
                    />
                </div>
            </div>

            {#if error}
                <div class="text-destructive text-sm text-center">{error}</div>
            {/if}

            <Button type="submit" class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Sign in
            </Button>

            <div class="text-center">
                <p class="text-muted-foreground">
                    Don't have an account?
                    <Button variant="link" onclick={goToRegister} class="p-0 h-auto font-medium">
                        Sign up
                    </Button>
                </p>
            </div>
        </form>
    </div>
</div>
