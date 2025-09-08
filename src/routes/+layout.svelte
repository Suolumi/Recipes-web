<script lang="ts">
	import '../app.css';
	import Header from "../components/Header.svelte";
    import {afterNavigate, goto} from "$app/navigation";
	import {onMount} from "svelte";
    import {accessToken, refreshToken, serverUrl, user} from "$lib/stores";
    import {getSelf} from "$lib/user";
    import {PUBLIC_SERVER_URL} from "$env/static/public";

	let { children } = $props();

	onMount(() => {
		if (window.location.pathname === "/")
			goto("/home")
        serverUrl.set('https://recipes-api.suolumi.fr/api/v1')
	})

    afterNavigate(async () => {
        if ($accessToken && $accessToken !== '' && !$user) {
            const response = await getSelf()
            if (response.data) {
                user.set(response.data)
            } else {
                accessToken.set('')
                refreshToken.set('')
                console.error(response.response)
            }
        }
    });
</script>

<Header />
{@render children?.()}
