import {apiFetchJson} from "$lib/api";
import type {User} from "$lib/user";
import type {GetRecipesRequest, RecipePreview} from "$lib/recipes";

// AdminUser is the full user document the back-office sees (unlike the
// public User type, which the API redacts for non-admin callers).
export type AdminUser = User

export type GetAdminUsersResponse = {
    length: number
    items: AdminUser[]
}

export type GetAdminRecipesResponse = {
    length: number
    items: RecipePreview[]
}

export type AdminStats = {
    total_users: number
    total_admins: number
    total_recipes: number
    recipes_by_category: Record<string, number>
}

export type CleanupImagesResult = {
    removed: Record<string, number>
}

// AdminRouteParam/AdminRouteDescriptor mirror the backend's
// models.AdminRouteParam/AdminRouteDescriptor (see SautéAPI's
// admin_manifest.go) - the shape driving the generic admin console.
export type AdminRouteParam = {
    name: string
    in: 'path' | 'query' | 'body'
    type: 'string' | 'int' | 'bool' | 'file'
    picker?: 'user' | 'recipe'
    required: boolean
    label: string
}

export type AdminRouteCategory = 'users' | 'recipes' | 'system'

export type AdminRouteDescriptor = {
    id: string
    method: string
    path: string
    label: string
    category: AdminRouteCategory
    description: string
    destructive: boolean
    params: AdminRouteParam[]
}

export function getAdminRoutes() {
    return apiFetchJson<AdminRouteDescriptor[]>('/admin/routes')
}

export function getAdminUsers(params: { username?: string, limit?: number, offset?: number }) {
    return apiFetchJson<GetAdminUsersResponse>('/admin/users', 'GET', null, params)
}

// adminUpdateUser/adminDeleteUser/adminUpdateUserPicture/adminDeleteUserPicture
// call the original (pre-/admin-group) admin routes - user CRUD that already
// existed before the back-office, reused as-is.
export function adminUpdateUser(id: string, fields: { username?: string, email?: string, password?: string }) {
    return apiFetchJson<AdminUser>(`/users/${id}`, 'PUT', fields)
}

export function adminDeleteUser(id: string) {
    return apiFetchJson<AdminUser>(`/users/${id}`, 'DELETE')
}

export function adminUpdateUserPicture(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiFetchJson<{ id: string }>(`/users/${id}/picture`, 'POST', formData, null, {})
}

export function adminDeleteUserPicture(id: string) {
    return apiFetchJson<{ message: string }>(`/users/${id}/picture`, 'DELETE')
}

export function setAdminStatus(id: string, admin: boolean) {
    return apiFetchJson<AdminUser>(`/admin/users/${id}/admin-status`, 'PATCH', {admin})
}

export function sendPasswordReset(id: string, locale?: string) {
    return apiFetchJson<{ message: string }>(`/admin/users/${id}/send-password-reset`, 'POST', null, locale ? {locale} : null)
}

export function revokeMcpToken(id: string) {
    return apiFetchJson<{ message: string }>(`/admin/users/${id}/mcp-token`, 'DELETE', null)
}

export function getAdminRecipes(params: Omit<GetRecipesRequest, 'own_recipes' | 'variation_of' | 'exclude_family' | 'favorite'>) {
    return apiFetchJson<GetAdminRecipesResponse>('/admin/recipes', 'GET', null, params)
}

export function retranslateRecipe(id: string) {
    return apiFetchJson<{ message: string }>(`/recipes/${id}/retranslate`, 'POST', null)
}

export function getAdminStats() {
    return apiFetchJson<AdminStats>('/admin/system/stats')
}

export function cleanupImages() {
    return apiFetchJson<CleanupImagesResult>('/admin/system/cleanup-images', 'POST')
}

// callAdminRoute fires an arbitrary route from the manifest. pathAndQuery is
// the already-resolved request target (e.g.
// "/admin/users/507f.../admin-status?locale=en"), taken verbatim from the
// console's editable path+query field - no further param substitution
// happens here. body is the parsed JSON body (or null for actions with none);
// file, when given, is appended to a multipart body alongside body's fields
// (JSON can't hold a File, so the two never combine into one JSON payload).
export function callAdminRoute(descriptor: AdminRouteDescriptor, pathAndQuery: string, body: Record<string, unknown> | null, file?: { field: string, value: File } | null) {
    let payload: object | FormData | null = body
    if (file?.value) {
        const formData = new FormData()
        formData.append(file.field, file.value)
        if (body)
            for (const [key, value] of Object.entries(body))
                formData.append(key, String(value))
        payload = formData
    }
    return apiFetchJson<unknown>(pathAndQuery, descriptor.method, payload)
}
