import { accessToken, refreshToken, serverUrl, user } from '$lib/stores';
import { get } from 'svelte/store';

type FetchFn = typeof fetch;

export type ApiError = {
    error?: string
    code?: string
    request_id?: string
}

export function apiErrorMessage(data: unknown, fallback: string): string {
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' && data.error.length > 0)
        return data.error
    return fallback
}

function buildRequest(
    url: string,
    {
        method,
        body,
        query,
        token,
        headers,
    }: {
        method: string;
        body?: object | FormData | null;
        query?: Record<string, unknown> | null;
        token?: string | null;
        headers?: HeadersInit;
    },
    f: FetchFn = fetch
) {
    if (query) {
        const params = new URLSearchParams()
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null || value === '')
                continue
            if (Array.isArray(value)) {
                for (const item of value)
                    params.append(key, String(item))
            } else {
                params.set(key, String(value))
            }
        }
        url += `?${params}`;
    }

    const h = new Headers(headers);

    if (!(body instanceof FormData) && !h.has('Content-Type')) {
        h.set('Content-Type', 'application/json');
    }

    if (token) {
        h.set('Authorization', `Bearer ${token}`);
    }

    return f(url, {
        method,
        headers: h,
        body: body
            ? body instanceof FormData
                ? body
                : JSON.stringify(body)
            : undefined,
    });
}

export async function refreshAccessToken(f: FetchFn = fetch) {
    const response = await buildRequest(
        `${get(serverUrl)}/refresh`,
        {
            method: 'POST',
            body: {
                refresh_token: get(refreshToken),
            },
        },
        f
    );

    if (!response.ok) {
        user.set(null);
        return;
    }

    const { access_token } = await response.json();

    if (!access_token) {
        console.error('No token in response');
        return;
    }

    accessToken.set(access_token);
    return access_token;
}

export async function apiFetch(
    url: string,
    method = 'GET',
    body: object | FormData | null = null,
    query: Record<string, unknown> | null = null,
    headers?: HeadersInit,
    f: FetchFn = fetch
) {
    const fullUrl = `${get(serverUrl)}${url}`;

    const send = (token: string | null) =>
        buildRequest(
            fullUrl,
            { method, body, query, token, headers },
            f
        );

    let response = await send(get(accessToken));

    if (response.status === 401) {
        const token = await refreshAccessToken(f);

        if (token) {
            response = await send(token);
        }
    }

    return response;
}

export async function apiFetchJson<T>(
    ...args: Parameters<typeof apiFetch>
): Promise<{ data: T; response: Response }> {
    const response = await apiFetch(...args);

    const data = await response.json().catch(() => ({} as T | ApiError))
    return {response, data: data as T}
}
