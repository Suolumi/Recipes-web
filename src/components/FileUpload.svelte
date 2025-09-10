<script lang="ts">
    import {_} from 'svelte-i18n'
    interface Props {
        accept?: string
        onFilesSelected: (files: FileList) => void
        class?: string
    }

    let { accept = "image/*", onFilesSelected, class: className = "" }: Props = $props();

    let fileInput: HTMLInputElement;
    let isDragOver = $state(false);

    function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            onFilesSelected(target.files);
        }
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        isDragOver = false;

        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            onFilesSelected(event.dataTransfer.files);
        }
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        isDragOver = true;
    }

    function handleDragLeave() {
        isDragOver = false;
    }

    function openFileDialog() {
        fileInput.click();
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
        class="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:cursor-pointer {isDragOver ? 'border-primary bg-primary/5' : 'border-border'} {className}"
        ondrop={handleDrop}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        onclick={openFileDialog}
        role="button"
        tabindex="0"
        aria-label="Upload files"
>
    <input
            bind:this={fileInput}
            type="file"
            {accept}
            multiple
            onchange={handleFileSelect}
            class="hidden"
    />

    <div class="space-y-2">
        <svg class="w-12 h-12 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <div>
            <button
                    type="button"
                    class="text-primary hover:text-primary/80 font-medium"
            >
                {$_('fileUpload.click')}
            </button>
            <span class="text-muted-foreground"> {$_('fileUpload.drag')}</span>
        </div>
        <p class="text-sm text-muted-foreground">
            {$_('fileUpload.multiple')}
        </p>
    </div>
</div>
