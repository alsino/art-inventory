<script lang="ts">
	import ArtworkForm from '$lib/components/ArtworkForm.svelte';
	import { artPieces } from '$lib/stores/artPieces.js';
	import { toasts } from '$lib/stores/toast.js';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { ArtPiece } from '$lib/types/ArtPiece.js';

	export let data: PageData;
	
	const { piece } = data;

	async function handleSave(event: CustomEvent<ArtPiece>) {
		try {
			await artPieces.updatePiece(piece.id, event.detail);
			toasts.add(`Artwork "${event.detail.title}" has been updated successfully!`, 'success');
			goto(`/piece/${piece.id}`);
		} catch (error) {
			console.error('Failed to update artwork:', error);
			toasts.add('Failed to update artwork. Please try again.', 'error');
		}
	}

	function handleCancel() {
		goto(`/piece/${piece.id}`);
	}
</script>

<svelte:head>
	<title>Edit {piece.title} - Art Inventory</title>
</svelte:head>

<div class="container">
	<nav class="breadcrumb">
		<a href="/">← Back to Collection</a>
		<a href="/piece/{piece.id}">← Back to Artwork</a>
	</nav>

	<header>
		<h1>Edit Artwork</h1>
		<p class="subtitle">{piece.title}</p>
	</header>

	<ArtworkForm 
		artwork={piece}
		isEditing={true}
		on:save={handleSave}
		on:cancel={handleCancel}
	/>
</div>

<style>
	.container {
		padding: 30px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.breadcrumb {
		margin-bottom: 40px;
		display: flex;
		gap: 20px;
	}

	.breadcrumb a {
		color: #000;
		font-size: 16px;
	}

	header {
		margin-bottom: 40px;
		text-align: center;
	}

	header h1 {
		font-size: 24px;
		font-weight: 400;
		letter-spacing: 2px;
		text-transform: uppercase;
		margin-bottom: 10px;
	}

	.subtitle {
		font-size: 16px;
		color: #666;
		font-style: italic;
	}

	@media (max-width: 768px) {
		.container {
			padding: 20px;
		}

		.breadcrumb {
			margin-bottom: 30px;
			flex-direction: column;
			gap: 10px;
		}

		header {
			margin-bottom: 30px;
		}
	}
</style>