<script lang="ts">
	import { artPieces } from '$lib/stores/artPieces.js';
	import type { ArtPiece } from '$lib/types/ArtPiece.js';

	let selectedStatus: ArtPiece['status'] | 'all' = 'all';

	const statusOptions = [
		{ value: 'all', label: 'All Artworks' },
		{ value: 'available', label: 'Available' },
		{ value: 'sold', label: 'Sold' },
		{ value: 'on_hold', label: 'On Hold' },
		{ value: 'exhibition', label: 'Exhibition' },
		{ value: 'damaged', label: 'Damaged' }
	] as const;

	function formatStatus(status: ArtPiece['status']): string {
		return status.replace('_', ' ').toLowerCase();
	}

	function getStatusColor(status: ArtPiece['status']): string {
		switch (status) {
			case 'available':
				return '#28a745';
			case 'sold':
				return '#dc3545';
			case 'on_hold':
				return '#ffc107';
			case 'exhibition':
				return '#17a2b8';
			case 'damaged':
				return '#6c757d';
			default:
				return '#6c757d';
		}
	}

	// Filter and sort artworks
	$: filteredAndSortedArtPieces = $artPieces
		.filter(piece => piece.id && piece.id.length > 0) // Filter out any pieces without valid IDs
		.filter(piece => selectedStatus === 'all' || piece.status === selectedStatus) // Filter by status
		.sort((a, b) => 
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);

	// Count artworks by status
	$: statusCounts = $artPieces.reduce((counts, piece) => {
		if (piece.id && piece.id.length > 0) {
			counts[piece.status] = (counts[piece.status] || 0) + 1;
		}
		return counts;
	}, {} as Record<ArtPiece['status'], number>);

</script>

<svelte:head>
	<title>Art Inventory</title>
</svelte:head>

<div class="container">
	<div class="header-actions">
		<a href="/add" class="add-button">+ Add New Artwork</a>
	</div>

	<!-- Status Filter -->
	<div class="filter-section">
		<div class="filter-buttons">
			{#each statusOptions as option}
				<button 
					class="filter-button" 
					class:active={selectedStatus === option.value}
					on:click={() => selectedStatus = option.value}
				>
					{option.label}
					{#if option.value !== 'all' && statusCounts[option.value]}
						<span class="count">({statusCounts[option.value]})</span>
					{/if}
					{#if option.value === 'all'}
						<span class="count">({$artPieces.filter(p => p.id && p.id.length > 0).length})</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>
	
	<div class="grid">
		{#each filteredAndSortedArtPieces as piece (piece.id)}
			<article class="artwork">
				<a href="/piece/{piece.id}">
					<div class="image-container">
						<img src={piece.imageUrl} alt={piece.title} loading="lazy" />
					</div>
					<div class="info">
						<h3>{piece.title}</h3>
						<p>{piece.year}</p>
						<p class="status">
							<span class="status-dot" style="background-color: {getStatusColor(piece.status)}"></span>
							{formatStatus(piece.status)}
						</p>
					</div>
				</a>
			</article>
		{/each}
	</div>
</div>

<style>
	.container {
		padding: 30px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.header-actions {
		margin-bottom: 40px;
		text-align: right;
	}

	.add-button {
		color: #000;
		border: 1px solid #000;
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.add-button:hover {
		background: #000;
		color: #fff;
	}

	.filter-section {
		margin-bottom: 40px;
	}

	.filter-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}

	.filter-button {
		padding: 8px 16px;
		border: 1px solid #ccc;
		background: #fff;
		color: #666;
		font-size: 14px;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-button:hover {
		border-color: #000;
		color: #000;
	}

	.filter-button.active {
		border-color: #000;
		background: #000;
		color: #fff;
	}

	.count {
		font-size: 12px;
		opacity: 0.8;
		margin-left: 4px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 40px 30px;
	}

	.artwork {
		background: #fff;
	}

	.artwork a {
		display: block;
		color: #000;
	}

	.image-container {
		width: 100%;
		height: 350px;
		overflow: hidden;
		margin-bottom: 15px;
	}

	.image-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.info {
		line-height: 1.3;
	}

	.info h3 {
		font-size: 16px;
		font-weight: 400;
		margin-bottom: 5px;
	}

	.info p {
		font-size: 16px;
		color: #000;
		margin-bottom: 3px;
	}

	.status {
		font-style: italic;
		color: #666 !important;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;
	}

	@media (max-width: 768px) {
		.container {
			padding: 20px;
		}

		.filter-buttons {
			justify-content: flex-start;
			gap: 8px;
		}

		.filter-button {
			padding: 6px 12px;
			font-size: 12px;
		}

		.grid {
			grid-template-columns: 1fr;
			gap: 30px;
		}

		.image-container {
			height: 300px;
		}
	}

	@media (max-width: 480px) {
		.container {
			padding: 15px;
		}

		.image-container {
			height: 250px;
		}
	}
</style>