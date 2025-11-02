<script>
	export const data = {};
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width,initial-scale=1" />
	<title>Image Upload</title>
</svelte:head>

<div class="app">
	<main>
		<slot />
	</main>
</div>

<style>
	:global(html, body, #svelte) {
		height: 100%;
	}

	:global(body) {
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial;
		background: #0b0f12;
		color: #e6eef8;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.app {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	main {
		width: 100%;
		max-width: 720px;
		background: #0f1720;
		border: 1px solid rgba(255, 255, 255, 0.03);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 6px 18px rgba(2, 6, 23, 0.6);
	}
</style>
