<script lang="ts">
    import Button from '../../../../components/Button.svelte';
    import Input from '../../../../components/Input.svelte';
    import Label from '../../../../components/Label.svelte';

    let email = $state('');
    let message = $state('');
    let isSubmitted = $state(false);

    function handleSubmit(event: Event) {
        event.preventDefault();

        if (!email) {
            message = 'Please enter your email address';
            return;
        }

        // Simulate password reset email sending
        isSubmitted = true;
        message = `Password reset instructions have been sent to ${email}`;
    }

    function goToLogin() {
        currentPage.set('login');
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h2 class="text-3xl font-bold text-foreground">Reset your password</h2>
            <p class="mt-2 text-muted-foreground">
                {#if !isSubmitted}
                    Enter your email address and we'll send you instructions to reset your password
                {:else}
                    Check your email for reset instructions
                {/if}
            </p>
        </div>

        {#if !isSubmitted}
            <form class="mt-8 space-y-6" onsubmit={handleSubmit}>
                <div>
                    <Label for="email" required>Email address</Label>
                    <Input
                            id="email"
                            type="email"
                            bind:value={email}
                            required
                            placeholder="Enter your email address"
                    />
                </div>

                {#if message && !isSubmitted}
                    <div class="text-destructive text-sm text-center">{message}</div>
                {/if}

                <Button type="submit" class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                    Send reset instructions
                </Button>
            </form>
        {:else}
            <div class="mt-8 space-y-6">
                <div class="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div class="text-emerald-600 dark:text-emerald-400 text-sm">{message}</div>
                </div>

                <Button onclick={goToLogin} class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                    Back to sign in
                </Button>
            </div>
        {/if}

        <div class="text-center">
            <p class="text-muted-foreground">
                Remember your password?
                <Button variant="link" onclick={goToLogin} class="p-0 h-auto font-medium">
                    Back to sign in
                </Button>
            </p>
        </div>
    </div>
</div>
