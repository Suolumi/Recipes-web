import {accessToken, refreshToken, serverUrl, user} from '$lib/stores';
import { get } from 'svelte/store';

function buildRequest(url: string, method: string, body: object | null, query: object | null, token: string | null, headers?: object, f: Function = fetch) {
    const config: any = {
        method,
    }

    config.headers = headers ?? {'Content-Type': 'application/json'};
    if (body) {
        config.body = body instanceof FormData ? body : JSON.stringify(body);
    }
    if (query) {
        Object.entries(query).forEach(([key, value], i) => {
            url += `${i === 0 ? '?': '&'}${key}=${value}`
        })
    }
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return f(url, config);
}

export async function refreshAccessToken(f: Function = fetch) {
    const response = await buildRequest(`${get(serverUrl)}/refresh`, 'POST', {
        refresh_token: get(refreshToken),
    }, null, null, f)

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

export async function apiFetch<T>(
    url: string,
    method = "GET",
    body: object | null = null,
    query: object | null = null,
    json = false,
    headers?: object,
    f: Function = fetch
): Promise<{
    data?: T
    response: Response
}> {
    let response = await buildRequest(get(serverUrl) + url, method, body, query, get(accessToken), headers, f);

    if (response.status === 401) {
        const newToken = await refreshAccessToken(f);

        if (newToken) {
            response = await buildRequest(get(serverUrl) + url, method, body, query, newToken, headers, f);

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

export function apiFetchJson<T>(
    url: string,
    method = "GET",
    body: object | null = null,
    query: object | null = null,
    headers?: object,
    f: Function = fetch
) {
    return apiFetch<T>(url, method, body, query, true, headers, f)
}