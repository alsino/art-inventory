<script lang="ts">
	import ArtworkForm from '$lib/components/ArtworkForm.svelte';
	import { artPieces } from '$lib/stores/artPieces.js';
	import { toasts } from '$lib/stores/toast.js';
	import { goto } from '$app/navigation';
	import type { ArtPiece } from '$lib/types/ArtPiece.js';

	function handleSave(event: CustomEvent<ArtPiece>) {
		const newArtwork = artPieces.add(event.detail);
		toasts.add(`Artwork "${newArtwork.title}" has been created successfully!`, 'success');
		goto(`/piece/${newArtwork.id}`);
	}

	function handleCancel() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Add New Artwork - Art Inventory</title>
</svelte:head>

<div class="container">
	<nav class="breadcrumb">
		<a href="/">← Back to Collection</a>
	</nav>

	<header>
		<h1>Add New Artwork</h1>
	</header>

	<ArtworkForm 
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
	}

	@media (max-width: 768px) {
		.container {
			padding: 20px;
		}

		.breadcrumb {
			margin-bottom: 30px;
		}

		header {
			margin-bottom: 30px;
		}
	}
</style>