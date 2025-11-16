import {apiFetchJson} from "$lib/api";

export type User = {
    id: string
    username: string
    email?: string
    picture: string
}

export type UserSettingsForm = {
    username?: string
    email?: string
    password?: string
}

export type UpdateUserPictureResponse = {
    id: string
}

export async function getSelf() {
    return apiFetchJson<User>("/users/me")
}

export async function updateSelf(user: UserSettingsForm) {
    return apiFetchJson<User>(`/users/me`, 'PUT', user)
}

export function updateUserPicture(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiFetchJson<UpdateUserPictureResponse>('/users/me/picture', 'POST', formData, null, {})
}
