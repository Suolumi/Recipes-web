<script>
    let {
        for: htmlFor = '',
        required = false,
        class: className = '',
        children
    } = $props();

    const baseClasses = 'block text-sm font-medium text-foreground mb-2';
</script>

<label
        for={htmlFor}
        class="{baseClasses} {className}"
>
    {@render children()}
    {#if required}
        <span class="text-destructive ml-1">*</span>
    {/if}
</label>
