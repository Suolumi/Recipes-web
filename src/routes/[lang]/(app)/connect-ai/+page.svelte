<script lang="ts">
    import Button from "../../../../components/Button.svelte";
    import Modal from "../../../../components/Modal.svelte";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {accessToken, serverUrl} from "$lib/stores";
    import {toastError, toastSuccess} from "$lib/utils";
    import {apiErrorMessage} from "$lib/api";
    import {generateMcpToken, revokeMcpAccess} from "$lib/mcp";
    import {locale, _} from "svelte-i18n";
    import {Copy, Check, Sparkles} from "@lucide/svelte";

    let token: string | null = $state(null);
    let generating = $state(false);
    let disconnecting = $state(false);
    let confirmDisconnect = $state(false);
    let copiedField: 'url' | 'token' | 'claudeCli' | 'chatgptCli' | null = $state(null);

    let mcpUrl = $derived($serverUrl.replace(/\/api\/v1\/?$/, '') + '/mcp');
    let claudeCliCommand = $derived(`claude mcp add --transport http recipes ${mcpUrl} --header "Authorization: Bearer ${token}"`);
    let chatgptCliConfig = $derived(`[mcp_servers.recipes]\nurl = "${mcpUrl}"\nbearer_token = "${token}"`);

    onMount(() => {
        if (!$accessToken || $accessToken === "") {
            toastError($_('connectAi.toasts.noAccount'))
            goto(`/${$locale}/home`)
        }
    })

    async function generate() {
        generating = true
        const {response, data} = await generateMcpToken()
        generating = false
        if (response.ok && data)
            token = data.token
        else
            toastError(apiErrorMessage(data, $_('connectAi.toasts.generateError')))
    }

    async function disconnect() {
        disconnecting = true
        const {response, data} = await revokeMcpAccess()
        disconnecting = false
        confirmDisconnect = false
        if (response.ok) {
            token = null
            toastSuccess($_('connectAi.toasts.disconnectSuccess'))
        } else
            toastError(apiErrorMessage(data, $_('connectAi.toasts.disconnectError')))
    }

    async function copy(text: string, field: 'url' | 'token' | 'claudeCli' | 'chatgptCli') {
        await navigator.clipboard.writeText(text)
        copiedField = field
        setTimeout(() => {
            if (copiedField === field)
                copiedField = null
        }, 1500)
    }
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-2 text-balance flex items-center gap-3">
            <Sparkles class="text-ai-accent" />
            {$_('connectAi.headLabel')}
        </h1>
        <p class="text-lg text-muted-foreground text-pretty">{$_('connectAi.commentLabel')}</p>
    </div>

    <div class="grid grid-cols-1 gap-6">
        <div class="bg-card rounded-lg border border-border p-6">
            <h2 class="text-xl font-semibold text-card-foreground mb-2">{$_('connectAi.intro.title')}</h2>
            <p class="text-foreground leading-relaxed">{$_('connectAi.intro.body')}</p>
            <p class="text-muted-foreground leading-relaxed mt-3 text-sm">{$_('connectAi.intro.tokenPurpose')}</p>
        </div>

        <div class="bg-card rounded-lg border border-border p-6">
            {#if !token}
                <Button onclick={generate} disabled={generating}>
                    {generating ? $_('connectAi.generate.loading') : $_('connectAi.generate.button')}
                </Button>
            {:else}
                <div class="space-y-4">
                    <div>
                        <p class="text-sm font-medium text-muted-foreground mb-1">{$_('connectAi.generate.urlLabel')}</p>
                        <div class="flex items-center gap-2">
                            <code class="flex-1 min-w-0 truncate bg-muted rounded-lg px-3 py-2 text-sm text-foreground">{mcpUrl}</code>
                            <Button variant="outline" size="sm" onclick={() => copy(mcpUrl, 'url')} aria-label="Copy address">
                                {#if copiedField === 'url'}
                                    <Check class="w-4 h-4 mr-1" />{$_('connectAi.generate.copied')}
                                {:else}
                                    <Copy class="w-4 h-4 mr-1" />{$_('connectAi.generate.copy')}
                                {/if}
                            </Button>
                        </div>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-muted-foreground mb-1">{$_('connectAi.generate.tokenLabel')}</p>
                        <div class="flex items-center gap-2">
                            <code class="flex-1 min-w-0 truncate bg-muted rounded-lg px-3 py-2 text-sm text-foreground">{token}</code>
                            <Button variant="outline" size="sm" onclick={() => copy(token ?? '', 'token')} aria-label="Copy connection code">
                                {#if copiedField === 'token'}
                                    <Check class="w-4 h-4 mr-1" />{$_('connectAi.generate.copied')}
                                {:else}
                                    <Copy class="w-4 h-4 mr-1" />{$_('connectAi.generate.copy')}
                                {/if}
                            </Button>
                        </div>
                    </div>

                    <div class="pt-2">
                        <h3 class="text-lg font-semibold text-card-foreground mb-3">{$_('connectAi.generate.steps.title')}</h3>
                        <ol class="space-y-2 list-decimal list-inside text-foreground">
                            <li>{$_('connectAi.generate.steps.one')}</li>
                            <li>{$_('connectAi.generate.steps.two')}</li>
                            <li>{$_('connectAi.generate.steps.three')}</li>
                            <li>{$_('connectAi.generate.steps.four')}</li>
                        </ol>
                    </div>

                    <div class="pt-2">
                        <h3 class="text-lg font-semibold text-card-foreground mb-3">{$_('connectAi.generate.examples.title')}</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="bg-muted rounded-lg p-4">
                                <p class="font-medium text-foreground mb-2">{$_('connectAi.generate.examples.claude.title')}</p>
                                <ol class="space-y-1 list-decimal list-inside text-sm text-foreground">
                                    <li>{$_('connectAi.generate.examples.claude.one')}</li>
                                    <li>{$_('connectAi.generate.examples.claude.two')}</li>
                                    <li>{$_('connectAi.generate.examples.claude.three')}</li>
                                </ol>
                            </div>
                            <div class="bg-muted rounded-lg p-4">
                                <p class="font-medium text-foreground mb-2">{$_('connectAi.generate.examples.chatgpt.title')}</p>
                                <ol class="space-y-1 list-decimal list-inside text-sm text-foreground">
                                    <li>{$_('connectAi.generate.examples.chatgpt.one')}</li>
                                    <li>{$_('connectAi.generate.examples.chatgpt.two')}</li>
                                    <li>{$_('connectAi.generate.examples.chatgpt.three')}</li>
                                </ol>
                            </div>
                            <div class="bg-muted rounded-lg p-4">
                                <p class="font-medium text-foreground mb-2">{$_('connectAi.generate.examples.claudeCli.title')}</p>
                                <p class="text-sm text-foreground mb-2">{$_('connectAi.generate.examples.claudeCli.intro')}</p>
                                <div class="flex items-start gap-2">
                                    <pre class="flex-1 min-w-0 overflow-x-auto bg-background rounded-lg px-3 py-2 text-xs text-foreground"><code>{claudeCliCommand}</code></pre>
                                    <Button variant="outline" size="sm" onclick={() => copy(claudeCliCommand, 'claudeCli')} aria-label="Copy command">
                                        {#if copiedField === 'claudeCli'}
                                            <Check class="w-4 h-4" />
                                        {:else}
                                            <Copy class="w-4 h-4" />
                                        {/if}
                                    </Button>
                                </div>
                            </div>
                            <div class="bg-muted rounded-lg p-4">
                                <p class="font-medium text-foreground mb-2">{$_('connectAi.generate.examples.chatgptCli.title')}</p>
                                <p class="text-sm text-foreground mb-2">{$_('connectAi.generate.examples.chatgptCli.intro')}</p>
                                <div class="flex items-start gap-2">
                                    <pre class="flex-1 min-w-0 overflow-x-auto bg-background rounded-lg px-3 py-2 text-xs text-foreground"><code>{chatgptCliConfig}</code></pre>
                                    <Button variant="outline" size="sm" onclick={() => copy(chatgptCliConfig, 'chatgptCli')} aria-label="Copy config">
                                        {#if copiedField === 'chatgptCli'}
                                            <Check class="w-4 h-4" />
                                        {:else}
                                            <Copy class="w-4 h-4" />
                                        {/if}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <p class="text-xs text-muted-foreground mt-3">{$_('connectAi.generate.examples.note')}</p>
                    </div>

                    <Button variant="outline" size="sm" onclick={generate} disabled={generating}>
                        {generating ? $_('connectAi.generate.loading') : $_('connectAi.generate.regenerate')}
                    </Button>
                </div>
            {/if}
        </div>

        <div class="bg-card rounded-lg border border-border p-6">
            <Button variant="destructive" onclick={() => confirmDisconnect = true}>
                {$_('connectAi.disconnect.button')}
            </Button>
        </div>
    </div>
</div>

<Modal
        open={confirmDisconnect}
        title={$_('connectAi.disconnect.confirmTitle')}
        onClose={() => confirmDisconnect = false}
>
    <p class="text-foreground">{$_('connectAi.disconnect.confirmBody')}</p>
    {#snippet footer()}
        <Button variant="outline" onclick={() => confirmDisconnect = false}>
            {$_('connectAi.disconnect.cancel')}
        </Button>
        <Button variant="destructive" onclick={disconnect} disabled={disconnecting}>
            {$_('connectAi.disconnect.confirm')}
        </Button>
    {/snippet}
</Modal>
