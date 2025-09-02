<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
        size?: 'sm' | 'md' | 'lg';
        type?: 'button' | 'submit' | 'reset';
        disabled?: boolean;
        onclick?: () => void;
        children: Snippet;
        class?: string;
        [key: string]: any;
    }

    let {
        variant = 'primary',
        size = 'md',
        type = 'button',
        disabled = false,
        onclick = () => {},
        children,
        class: className = '',
        ...props
    }: Props = $props();

    const variants: Record<string, string> = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
    };

    const sizes: Record<string, string> = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    const baseClasses: string = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:cursor-pointer';
</script>

<button
        {type}
        {disabled}
        {onclick}
        class="{baseClasses} {variants[variant]} {sizes[size]} {className}"
        {...props}
>
    {@render children()}
</button>
