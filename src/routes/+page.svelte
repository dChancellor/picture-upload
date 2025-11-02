<script lang="ts">
	import { onDestroy } from 'svelte';

	let chosen: HTMLInputElement | null = null;
	let uploading = false;
	let message = '';
	let uploadedPath = '';
	// previewUrl will contain either a blob: URL for the locally selected file
	// or the server path after a successful upload. We revoke blob URLs when
	// they're replaced or when the component is destroyed.
	let previewUrl = '';

	function revokePreview() {
		try {
			if (previewUrl && previewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(previewUrl);
			}
		} catch (e) {
			// ignore revoke errors
		}
	}

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input?.files?.[0];
		// if user starts a new browse/selection, clear prior success message
		if (message === 'Upload successful') message = '';
		if (!file) {
			revokePreview();
			previewUrl = '';
			return;
		}
		// revoke previous local preview if any
		revokePreview();
		// show immediate preview using an object URL
		previewUrl = URL.createObjectURL(file);
		// clear any previous uploaded path while user is selecting a new file
		uploadedPath = '';
	}

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

		// keep the success message, but reset the rest of the UI state so the
		// form appears cleared after a successful upload
		// revoke any local blob preview and clear the preview/showed path
		revokePreview();
		previewUrl = '';
		uploadedPath = '';

		// clear the file input so it's ready for a new selection
		if (chosen) {
			try {
				chosen.value = '';
			} catch (e) {
				// some browsers may restrict assigning to value; ignore failures
			}
		}
	}

	onDestroy(() => {
		revokePreview();
	});
</script>

{#if message}
	<p class="message">{message}</p>
{/if}

<h1>Upload your image</h1>
<form on:submit|preventDefault={onSubmit}>
	<input
		bind:this={chosen}
		type="file"
		accept="image/*"
		on:change={onFileChange}
		on:click={() => {
			if (message === 'Upload successful') message = '';
		}}
	/>
	<div style="height:12px"></div>
	<button type="submit" disabled={uploading}>
		{#if uploading}Uploading...{/if}
		{#if !uploading}Upload{/if}
	</button>
</form>

{#if previewUrl}
	<h3>Preview</h3>
	<img
		src={previewUrl}
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
	.message {
		color: green;
	}
</style>
