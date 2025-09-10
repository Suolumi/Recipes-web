<script lang="ts">
    import '$lib/i18n' // Import to initialize. Important :)
    
    // The load function is now in +layout.ts
    let { children } = $props()
</script>

{@render children?.()}