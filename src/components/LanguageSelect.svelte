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

<button class="flex items-center hover:text-primary transition-colors group">
    <select bind:value={value} onchange={e => switchLocale(e.target.value)} class="bg-transparent border-0 appearance-none pr-0 py-2 text-sm focus:outline-none focus:ring-0 focus:border-0" style="background-image: none">
        {#each locales as l}
            <option value={l.code}>{`${l.label}  ${l.flag}`}</option>
        {/each}
    </select>
    <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" size="20" />
</button>
