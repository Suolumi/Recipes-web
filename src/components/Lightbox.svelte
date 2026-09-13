<script lang="ts">
    import {serverUrl} from "$lib/stores";
    import {ArrowLeft, ArrowRight, X} from "@lucide/svelte";
    import {fade, scale} from "svelte/transition";

    let { open = false, pictures = [], startIndex = 0, alt = '', onClose = () => {} }: {
        open?: boolean;
        pictures?: string[];
        startIndex?: number;
        alt?: string;
        onClose?: () => void;
    } = $props();

    let index = $state(startIndex);

    $effect(() => {
        if (open)
            index = startIndex;
    });

    $effect(() => {
        if (!open)
            return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    });

    const hasMultiple = $derived(pictures.length > 1);
    const canPrev = $derived(index > 0);
    const canNext = $derived(index < pictures.length - 1);

    function prev(e?: Event) {
        e?.stopPropagation();
        if (canPrev)
            index -= 1;
    }

    function next(e?: Event) {
        e?.stopPropagation();
        if (canNext)
            index += 1;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!open)
            return;
        if (e.key === 'Escape')
            onClose();
        else if (e.key === 'ArrowLeft')
            prev();
        else if (e.key === 'ArrowRight')
            next();
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget)
            onClose();
    }

    let touchStartX: number | null = null;

    function handleTouchStart(e: TouchEvent) {
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchEnd(e: TouchEvent) {
        if (touchStartX === null)
            return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        const threshold = 50;
        if (deltaX > threshold)
            prev();
        else if (deltaX < -threshold)
            next();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onclick={handleBackdropClick}
            ontouchstart={handleTouchStart}
            ontouchend={handleTouchEnd}
            role="presentation"
            transition:fade={{ duration: 200 }}
    >
        <button
                type="button"
                onclick={() => onClose()}
                class="absolute top-4 right-4 z-10 text-white/80 hover:text-white hover:cursor-pointer p-2"
                aria-label="Close"
        >
            <X size="28" />
        </button>

        {#if hasMultiple}
            <button
                    type="button"
                    onclick={prev}
                    disabled={!canPrev}
                    class="absolute left-2 sm:left-4 z-10 text-white/80 hover:text-white hover:cursor-pointer disabled:opacity-30 disabled:hover:text-white/80 disabled:cursor-default p-2"
                    aria-label="Previous picture"
            >
                <ArrowLeft size="32" />
            </button>
            <button
                    type="button"
                    onclick={next}
                    disabled={!canNext}
                    class="absolute right-2 sm:right-4 z-10 text-white/80 hover:text-white hover:cursor-pointer disabled:opacity-30 disabled:hover:text-white/80 disabled:cursor-default p-2"
                    aria-label="Next picture"
            >
                <ArrowRight size="32" />
            </button>
        {/if}

        {#if pictures[index]}
            <img
                    src={`${$serverUrl}/recipe-pictures/${pictures[index]}`}
                    {alt}
                    class="max-h-[90vh] max-w-full object-contain select-none"
                    transition:scale={{ duration: 200, start: 0.9 }}
            />
        {/if}

        {#if hasMultiple}
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
                {index + 1} / {pictures.length}
            </div>
        {/if}
    </div>
{/if}
