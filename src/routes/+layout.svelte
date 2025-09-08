<script lang="ts">
	import '../app.css';
	import Header from "../components/Header.svelte";
    import {afterNavigate, goto} from "$app/navigation";
	import {onMount} from "svelte";
    import {accessToken, refreshToken, serverUrl, user} from "$lib/stores";
    import {getSelf} from "$lib/user";
    import {SvelteToast} from "@zerodevx/svelte-toast";

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
<SvelteToast options={{ reversed: true, intro: { y: 192 } }} />

<style>
    :root {
        --toastContainerTop: auto;
        --toastContainerRight: auto;
        --toastContainerBottom: 8rem;
        --toastContainerLeft: calc(50vw - 8rem);
    }
</style>
