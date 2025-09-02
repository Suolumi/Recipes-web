import {apiFetchJson} from "$lib/api";

export type LoginRequest = {
    id: string
    password: string
}
export type LoginResponse = {
    access_token: string
    refresh_token: string
}
export function login(data: LoginRequest) {
    return apiFetchJson<LoginResponse>("/login", "POST", data)
}

export type RegisterRequest = {
    email: string
    username: string
    password: string
}

export type RegisterResponse = {
    access_token: string
    refresh_token: string
}
export function register(data: RegisterRequest) {
    return apiFetchJson<RegisterResponse>("/register", "POST", data)
}
