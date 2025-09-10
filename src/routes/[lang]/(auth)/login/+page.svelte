<script lang="ts">
    import Button from '../../../../components/Button.svelte';
    import Input from '../../../../components/Input.svelte';
    import Label from '../../../../components/Label.svelte';
    import {goto} from "$app/navigation";
    import {login, type LoginRequest} from "$lib/auth";
    import {accessToken, refreshToken} from "$lib/stores";
    import {toastError, toastSuccess} from "$lib/utils";
    import {locale, _} from "svelte-i18n";

    let id = $state('');
    let password = $state('');
    let error = $state('');

    async function handleLogin(event: SubmitEvent) {
        event.preventDefault();
        error = '';

        if (!id || !password) {
            error = $_('login.errors.field');
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
            toastSuccess($_('login.toasts.success'));
            await goto(`/${$locale}/home`)
        } else
            toastError($_('login.toasts.error'));
    }

    function goToRegister() {
        goto(`/${$locale}/register`);
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h2 class="text-3xl font-bold text-foreground">{$_('login.signIn')}</h2>
            <p class="mt-2 text-muted-foreground">{$_('login.welcome')}</p>
        </div>

        <form class="mt-8 space-y-6" onsubmit={handleLogin}>
            <div class="space-y-4">
                <div>
                    <Label for="id" required>{$_('login.id.label')}</Label>
                    <Input
                            id="id"
                            type="text"
                            bind:value={id}
                            placeholder={$_('login.id.placeholder')}
                    />
                </div>

                <div>
                    <Label for="password" required>{$_('login.password.label')}</Label>
                    <Input
                            id="password"
                            type="password"
                            bind:value={password}
                            placeholder={$_('login.password.placeholder')}
                    />
                </div>
            </div>

            {#if error}
                <div class="text-destructive text-sm text-center">{error}</div>
            {/if}

            <Button type="submit" class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                {$_('login.submit')}
            </Button>

            <div class="text-center">
                <p class="text-muted-foreground">
                    {$_('login.noAccount')}
                    <Button variant="link" onclick={goToRegister} class="p-0 h-auto font-medium">
                        {$_('login.signUp')}
                    </Button>
                </p>
            </div>
        </form>
    </div>
</div>
