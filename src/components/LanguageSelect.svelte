<script lang="ts">
    import {locales} from "$lib/i18n";
    import {ChevronDown} from "@lucide/svelte";
    import {goto} from "$app/navigation";
    import {locale} from "svelte-i18n";

    let value = $derived($locale)

    function switchLocale(newLocale: string) {
        const parts = window.location.pathname.split('/');
        parts[1] = newLocale;
        goto(parts.join('/'));
    }
</script>

<div class="relative flex items-center text-foreground hover:text-primary transition-colors">
    <select
        bind:value={value}
        onchange={e => switchLocale(e.currentTarget.value)}
        aria-label="Select language"
        class="bg-transparent border-0 appearance-none pl-2 pr-7 py-2 text-sm rounded-lg cursor-pointer hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        style="background-image: none"
    >
        {#each locales as l}
            <option value={l.code}>{`${l.flag}  ${l.label}`}</option>
        {/each}
    </select>
    <ChevronDown class="absolute right-2 h-4 w-4 opacity-60 pointer-events-none" />
</div>
