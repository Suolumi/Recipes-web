<script lang="ts">
    interface Props {
        value: string;
        options: {value: string, label: string}[];
        disabled?: boolean;
        required?: boolean;
        id?: string;
        class?: string;
        [key: string]: any;
    }

    let {
        value = $bindable(''),
        options = [],
        disabled = false,
        required = false,
        id = '',
        class: className = '',
        ...props
    }: Props = $props();

    const baseClasses: string = 'w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors';
</script>

<select
        {id}
        {disabled}
        {required}
        bind:value
        class="{baseClasses} {className}"
        {...props}
>
    {#each options as option}
        <option value={option.value}>{option.label}</option>
    {/each}
</select>
