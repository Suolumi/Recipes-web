import { PUBLIC_SERVER_URL } from '$env/static/public';
import { accessToken, refreshToken, user } from '$lib/stores';
import { get } from 'svelte/store';

function buildRequest(url: string, method: string, body: object | null, token: string | null, headers = {
    'Content-Type': 'application/json',
}) {
    // @TODO change
    const config: any = {
        method,
        headers
    }

    if (body) {
        config.body = JSON.stringify(body);
    }
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return fetch(url, config);
}

export async function refreshAccessToken() {
    const response = await buildRequest(`${PUBLIC_SERVER_URL}/refresh`, 'POST', {
        refresh_token: get(refreshToken),
    }, null)

    if (response.ok) {
        const {access_token} = await response.json()

        if (access_token) {
            accessToken.set(access_token)
            return access_token
        } else {
            console.error("No token in response, please check payload")
            // toast.push("An unexpected error occurred, please try again later.")
        }
    }
    user.set(null)
}

export async function apiFetch<T>(url: string, method = "GET", body: object | null = null, json = false, headers = undefined): Promise<{
    data?: T
    response: Response
}> {
    let response = await buildRequest(PUBLIC_SERVER_URL + url, method, body, get(accessToken), headers);

    if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
            response = await buildRequest(PUBLIC_SERVER_URL + url, method, body, newToken, headers);

            if (response.status === 401) {
                return {response}
            }
        }
    }
    if (json) {
        return {
            data: await response.json() as T,
            response
        }
    }
    return {response}
}

export function apiFetchJson<T>(url: string, method = "GET", body: object | null = null, headers = undefined) {
    return apiFetch<T>(url, method, body, true, headers)
}