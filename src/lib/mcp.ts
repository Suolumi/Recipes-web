import {apiFetchJson} from "$lib/api";

export type McpTokenResponse = {
    token: string
}

export function generateMcpToken() {
    return apiFetchJson<McpTokenResponse>('/mcp/token', 'POST')
}

export function revokeMcpAccess() {
    return apiFetchJson<unknown>('/mcp/token', 'DELETE')
}
