<script>
    let {
        value = $bindable(''),
        placeholder = '',
        disabled = false,
        required = false,
        id = '',
        rows = 3,
        class: className = '',
        ...props
    } = $props();

    const baseClasses = 'w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-vertical';
</script>

<textarea
        {id}
        {placeholder}
        {disabled}
        {required}
        {rows}
        bind:value
        class="{baseClasses} {className}"
        {...props}
></textarea>
