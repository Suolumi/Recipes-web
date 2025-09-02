<script lang="ts">
	import '../app.css';
	import Header from "../components/Header.svelte";
    import {afterNavigate, goto} from "$app/navigation";
	import {onMount} from "svelte";
    import {accessToken, refreshToken, user} from "$lib/stores";
    import {getSelf} from "$lib/user";
	
	let { children } = $props();

	onMount(() => {
		if (window.location.pathname === "/")
			goto("/home")
	})

    afterNavigate(async () => {
        if ($accessToken && !$user) {
            const response = await getSelf()
            if (response.data) {
                user.set(response.data)
            } else {
                accessToken.set(null)
                refreshToken.set(null)
                console.error(response.response)
            }
        }
    });
</script>

<Header />
{@render children?.()}
