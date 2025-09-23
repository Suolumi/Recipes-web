import { writable } from "svelte/store"
import { persisted } from 'svelte-persisted-store';
import type {User} from "$lib/user";

const jsonParser = {
    parse: (text: any) => {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.log(e);
            return "";
        }
    },
    stringify: (object: any) => JSON.stringify(object)
}

export const accessToken = persisted('accessToken', '', {
    syncTabs: true,
    serializer: jsonParser,
});
export const refreshToken = persisted('refreshToken', '', {
    syncTabs: true,
    serializer: jsonParser,
});

export const user = writable<User | null>(null)
export const darkMode = persisted<boolean>('darkMode', false, {
    syncTabs: true,
    serializer: jsonParser,
})
export const serverUrl = writable<string>('https://recipes-api.suolumi.fr/api/v1')
