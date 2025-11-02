<script lang="ts">
	let chosen: HTMLInputElement | null = null;
	let uploading = false;
	let message = '';
	let uploadedPath = '';

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		const f = chosen?.files?.[0];
		if (!f) return (message = 'Choose a file first');

		uploading = true;
		message = '';

		const fd = new FormData();
		fd.append('file', f);

		const res = await fetch('/upload', { method: 'POST', body: fd });
		let j;
		try {
			j = await res.json();
		} catch (e) {
			j = {};
		}

		uploading = false;

		if (!res.ok) {
			message = j?.error || 'Upload failed';
			return;
		}

		message = 'Upload successful';
		uploadedPath = j.path;
	}
</script>

<h1>Image Upload</h1>

<form on:submit|preventDefault={onSubmit}>
	<input bind:this={chosen} type="file" accept="image/*" />
	<div style="height:12px"></div>
	<button type="submit" disabled={uploading}>
		{#if uploading}Uploading...{/if}
		{#if !uploading}Upload{/if}
	</button>
</form>

{#if message}
	<p>{message}</p>
{/if}

{#if uploadedPath}
	<h3>Preview</h3>
	<img
		src={uploadedPath}
		alt="uploaded"
		style="max-width:100%;border-radius:8px;border:1px solid rgba(255,255,255,0.04)"
	/>
{/if}

<style>
	h1 {
		margin: 0 0 0.25rem 0;
		font-size: 1.5rem;
	}
	p {
		margin: 0 0 1rem 0;
		color: #c7d7ea;
	}
	form {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	input[type='file'] {
		color: inherit;
	}
	button {
		background: #1f6feb;
		color: white;
		border: none;
		padding: 0.5rem 0.9rem;
		border-radius: 8px;
	}
	button:disabled {
		opacity: 0.6;
	}
	img {
		margin-top: 1rem;
		display: block;
	}
</style>
