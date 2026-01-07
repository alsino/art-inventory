<script lang="ts">
	import { artPieces } from '$lib/stores/artPieces.js';
	import type { ArtPiece } from '$lib/types/ArtPiece.js';
	import { browser } from '$app/environment';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	let selectedStatus: ArtPiece['status'] | 'all' = 'all';
	let selectedSort = 'custom';
	let searchQuery = '';
	let animationReady = false;

	// Enable animation only after initial data has loaded and settled
	$: if ($artPieces.length > 0 && !animationReady) {
		setTimeout(() => {
			animationReady = true;
		}, 100);
	}

	const sortOptions = [
		{ value: 'custom', label: 'Custom order' },
		{ value: 'newest-added', label: 'Newest added' },
		{ value: 'oldest-added', label: 'Oldest added' },
		{ value: 'year-newest', label: 'Year: newest' },
		{ value: 'year-oldest', label: 'Year: oldest' },
		{ value: 'title-az', label: 'Title A-Z' },
		{ value: 'title-za', label: 'Title Z-A' },
		{ value: 'price-high', label: 'Price: high to low' },
		{ value: 'price-low', label: 'Price: low to high' }
	];

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

	// Search filter function
	function matchesSearch(piece: ArtPiece, query: string): boolean {
		if (!query.trim()) return true;
		const q = query.toLowerCase();
		return (
			(piece.title?.toLowerCase().includes(q)) ||
			(piece.medium?.toLowerCase().includes(q)) ||
			(piece.location?.toLowerCase().includes(q)) ||
			(piece.year?.toString().includes(q)) ||
			(piece.price?.toString().includes(q)) ||
			(piece.notes?.toLowerCase().includes(q))
		);
	}

	// Filter and sort artworks
	$: filteredAndSortedArtPieces = $artPieces
		.filter(piece => piece.id && piece.id.length > 0)
		.filter(piece => selectedStatus === 'all' || piece.status === selectedStatus)
		.filter(piece => matchesSearch(piece, searchQuery))
		.sort((a, b) => {
			switch (selectedSort) {
				case 'custom':
					return (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity);
				case 'oldest-added':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case 'year-newest':
					return (b.year || 0) - (a.year || 0);
				case 'year-oldest':
					return (a.year || 0) - (b.year || 0);
				case 'title-az':
					return (a.title || '').localeCompare(b.title || '');
				case 'title-za':
					return (b.title || '').localeCompare(a.title || '');
				case 'price-high':
					return (b.price || 0) - (a.price || 0);
				case 'price-low':
					return (a.price || 0) - (b.price || 0);
				case 'newest-added':
				default:
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}
		});

	// Track the items for drag-and-drop (needs to be mutable)
	let dragItems: ArtPiece[] = [];
	$: dragItems = [...filteredAndSortedArtPieces];

	// Drag-and-drop is only enabled in custom order mode, viewing all items, without search
	$: isDragEnabled = selectedSort === 'custom' && selectedStatus === 'all' && !searchQuery.trim();

	const flipDurationMs = 200;
	$: activeFlipDuration = animationReady ? flipDurationMs : 0;

	function handleDndConsider(e: CustomEvent<{ items: ArtPiece[] }>) {
		dragItems = e.detail.items;
	}

	async function handleDndFinalize(e: CustomEvent<{ items: ArtPiece[] }>) {
		dragItems = e.detail.items;
		// Persist the new order to Firebase
		try {
			await artPieces.updateSortOrders(dragItems);
		} catch (error) {
			console.error('Failed to save sort order:', error);
		}
	}

	// Count artworks by status
	$: statusCounts = $artPieces.reduce((counts, piece) => {
		if (piece.id && piece.id.length > 0) {
			counts[piece.status] = (counts[piece.status] || 0) + 1;
		}
		return counts;
	}, {} as Record<ArtPiece['status'], number>);

	async function exportToPDF() {
		if (!browser) return;

		try {
			const { generatePortfolioPDF } = await import('$lib/pdf/portfolioGenerator');
			await generatePortfolioPDF({
				artistName: 'Alsino Skowronnek',
				title: 'Dossier',
				artworks: filteredAndSortedArtPieces,
				statusFilter: selectedStatus
			});
		} catch (error) {
			console.error('PDF Export failed:', error);
			alert('Failed to export PDF. Please try again.');
		}
	}

</script>

<svelte:head>
	<title>Art Inventory</title>
</svelte:head>

<div class="container">
	<div class="header-bar">
		<div class="header-nav">
			<div class="search-wrapper">
				<input
					type="text"
					class="search-input"
					placeholder="Search..."
					bind:value={searchQuery}
				/>
				{#if searchQuery}
					<button class="search-clear" on:click={() => searchQuery = ''}>×</button>
				{/if}
			</div>
			<select class="sort-dropdown" bind:value={selectedSort}>
				{#each sortOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
		<div class="header-actions">
			<a href="/add" class="add-button">+ Add New Artwork</a>
			<button class="export-button" on:click={exportToPDF}>
				Export PDF
			</button>
		</div>
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
		<p class="result-count">
			Showing {filteredAndSortedArtPieces.length} of {$artPieces.filter(p => p.id && p.id.length > 0).length} artworks
		</p>
	</div>

	{#if filteredAndSortedArtPieces.length === 0}
		<div class="empty-state">
			<p>No artworks found</p>
			{#if searchQuery}
				<p class="empty-hint">Try adjusting your search or filters</p>
			{/if}
		</div>
	{:else}
	<div
		class="grid"
		class:drag-enabled={isDragEnabled}
		use:dndzone={{ items: dragItems, flipDurationMs: activeFlipDuration, dragDisabled: !isDragEnabled }}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each dragItems as piece (piece.id)}
			<article class="artwork" animate:flip={{ duration: activeFlipDuration }}>
				<a href="/piece/{piece.id}">
					<div class="image-container">
						<img src={piece.imageUrl} alt={piece.title} loading="lazy" draggable="false" />
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
	{/if}
</div>

<style>
	.container {
		padding: 30px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.header-bar {
		margin-bottom: 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
	}

	.header-nav {
		display: flex;
		gap: 10px;
	}

	.header-actions {
		display: flex;
		gap: 10px;
	}

	.export-button,
	.add-button {
		color: #000;
		border: 1px solid #000;
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 1px;
		background: #fff;
		cursor: pointer;
		font-family: inherit;
	}

	.export-button:hover,
	.add-button:hover {
		background: #000;
		color: #fff;
	}

	.export-button {
		border-color: #666;
		color: #666;
	}

	.export-button:hover {
		background: #666;
		color: #fff;
	}

	.sort-dropdown {
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 1px solid #ccc;
		background: #fff;
		color: #666;
		cursor: pointer;
		font-family: inherit;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 36px;
	}

	.sort-dropdown:hover {
		border-color: #000;
		color: #000;
	}

	.sort-dropdown:focus {
		outline: none;
		border-color: #000;
	}

	.search-input {
		padding: 10px 20px;
		font-size: 14px;
		font-weight: 400;
		border: 1px solid #ccc;
		background: #fff;
		color: #000;
		font-family: inherit;
		min-width: 200px;
	}

	.search-input::placeholder {
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.search-input:hover {
		border-color: #000;
	}

	.search-input:focus {
		outline: none;
		border-color: #000;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-clear {
		position: absolute;
		right: 8px;
		background: none;
		border: none;
		font-size: 20px;
		color: #999;
		cursor: pointer;
		padding: 0 4px;
		line-height: 1;
	}

	.search-clear:hover {
		color: #000;
	}

	.filter-section {
		margin-bottom: 40px;
	}

	.result-count {
		margin-top: 15px;
		font-size: 13px;
		color: #888;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #666;
	}

	.empty-state p {
		margin: 0;
		font-size: 16px;
	}

	.empty-hint {
		margin-top: 8px !important;
		font-size: 14px !important;
		color: #999;
	}

	.filter-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: flex-start;
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
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 40px 30px;
		max-width: 100%;
	}

	.grid.drag-enabled .artwork {
		cursor: grab;
	}

	.grid.drag-enabled .artwork:active {
		cursor: grabbing;
	}

	.artwork {
		background: #fff;
		max-width: 400px;
	}

	:global(.grid .artwork[aria-grabbed="true"]) {
		opacity: 0.8;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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

		.header-bar {
			flex-direction: column;
			align-items: stretch;
			gap: 12px;
		}

		.header-nav {
			flex-direction: column;
			gap: 8px;
		}

		.header-actions {
			gap: 8px;
		}

		.export-button,
		.add-button,
		.sort-dropdown,
		.search-input {
			padding: 8px 16px;
			font-size: 12px;
		}

		.sort-dropdown {
			padding-right: 30px;
		}

		.search-input {
			min-width: unset;
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