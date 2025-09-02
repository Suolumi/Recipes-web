<script lang="ts">
    interface Props {
        type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
        value: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        id?: string;
        class?: string;
        [key: string]: any;
    }

    let {
        type = 'text',
        value = $bindable(''),
        placeholder = '',
        disabled = false,
        required = false,
        id = '',
        class: className = '',
        ...props
    }: Props = $props();

    const baseClasses: string = 'w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors';
</script>

<input
        {type}
        {id}
        {placeholder}
        {disabled}
        {required}
        bind:value
        class="{baseClasses} {className}"
        {...props}
/>
