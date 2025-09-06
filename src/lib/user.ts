import {apiFetchJson} from "$lib/api";

export type User = {
    id: string
    username: string
    email?: string
    picture: string
}

export async function getSelf() {
    return apiFetchJson<User>("/users/me")
}

export async function updateSelf(user: User) {
    return apiFetchJson<User>(`/users/me`, 'PUT', user)
}
