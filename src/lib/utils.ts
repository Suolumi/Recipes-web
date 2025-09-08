import {toast} from "@zerodevx/svelte-toast";

export function toastSuccess(msg: string) {
    toast.push(msg, {
        theme: {
            '--toastColor': 'mintcream',
            '--toastBackground': 'rgba(72,187,120,0.9)',
            '--toastBarBackground': '#2F855A'
        }
    })
}

export function toastError(msg: string) {
    toast.push(msg, {
        theme: {
            '--toastBackground': 'rgba(192, 21, 26, 0.95)',
            '--toastColor': '#ffffff',
            '--toastBarBackground': '#8c0000'
        }
    })
}