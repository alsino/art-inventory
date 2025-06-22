<script lang="ts">
	import { artPieces } from '$lib/stores/artPieces.js';
	import type { ArtPiece } from '$lib/types/ArtPiece.js';
	import { browser } from '$app/environment';

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

	async function exportToPDF() {
		if (!browser) return;

		try {
			// Dynamic import for client-side only
			const { jsPDF } = await import('jspdf');
			
			const doc = new jsPDF();
			const pageWidth = doc.internal.pageSize.getWidth();
			const pageHeight = doc.internal.pageSize.getHeight();
			const margin = 20;
			const lineHeight = 10;
			let yPosition = margin;

			// Add sleek header with icon (if available)
			try {
				// Try to add the icon
				const iconImg = new Image();
				iconImg.src = '/icon.png';
				await new Promise((resolve) => {
					iconImg.onload = () => {
						try {
							doc.addImage(iconImg, 'PNG', margin, yPosition, 8, 8);
						} catch (error) {
							console.warn('Could not add icon to PDF');
						}
						resolve(null);
					};
					iconImg.onerror = () => resolve(null);
				});
			} catch (error) {
				console.warn('Could not load icon for PDF');
			}

			// Main header - aligned with icon center
			doc.setFontSize(16);
			doc.setFont('helvetica', 'normal');
			doc.text('INVENTAR', margin + 12, yPosition + 6); // +6 to center with 8px icon
			yPosition += 15;

			// Thin line under header
			doc.setDrawColor(0);
			doc.setLineWidth(0.1);
			doc.line(margin, yPosition, pageWidth - margin, yPosition);
			yPosition += 15;

			// Filter info in smaller, elegant style
			doc.setFontSize(11);
			doc.setFont('helvetica', 'normal');
			const filterText = selectedStatus === 'all' 
				? `All Artworks — ${filteredAndSortedArtPieces.length} pieces`
				: `${statusOptions.find(opt => opt.value === selectedStatus)?.label} — ${filteredAndSortedArtPieces.length} pieces`;
			doc.text(filterText, margin, yPosition);
			yPosition += 8;

			// Date in subtle style
			doc.setFontSize(9);
			doc.setTextColor(120);
			doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, yPosition);
			doc.setTextColor(0);
			yPosition += 25;

			// Clean table headers
			doc.setFontSize(9);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(100);
			doc.text('TITLE', margin, yPosition);
			doc.text('YEAR', margin + 85, yPosition);
			doc.text('MEDIUM', margin + 115, yPosition);
			doc.text('DIMENSIONS', margin + 155, yPosition);
			yPosition += 3;

			// Subtle line under headers
			doc.setDrawColor(200);
			doc.setLineWidth(0.3);
			doc.line(margin, yPosition, pageWidth - margin, yPosition);
			yPosition += 12;

			// Reset for content
			doc.setTextColor(0);
			doc.setDrawColor(0);

			// Artwork entries with improved layout
			doc.setFont('helvetica', 'normal');
			
			for (let i = 0; i < filteredAndSortedArtPieces.length; i++) {
				const piece = filteredAndSortedArtPieces[i];
				const hasPrice = piece.price && piece.price > 0;
				const entryHeight = hasPrice ? 18 : 12;
				
				// Check if we need a new page
				if (yPosition > pageHeight - entryHeight - 15) {
					doc.addPage();
					yPosition = margin + 20; // Leave space at top of new page
				}

				// Artwork data
				const title = piece.title || 'Untitled';
				const year = piece.year?.toString() || '';
				const medium = piece.medium || '';
				
				// Dimensions
				let dimensionsText = '';
				if (piece.dimensions?.width && piece.dimensions?.height) {
					dimensionsText = `${piece.dimensions.width} × ${piece.dimensions.height} ${piece.dimensions.unit}`;
				}

				// Smart text truncation
				const truncatedTitle = title.length > 32 ? title.substring(0, 29) + '...' : title;
				const truncatedMedium = medium.length > 16 ? medium.substring(0, 13) + '...' : medium;
				const truncatedDimensions = dimensionsText.length > 16 ? dimensionsText.substring(0, 13) + '...' : dimensionsText;

				// Main artwork info
				doc.setFontSize(10);
				doc.setFont('helvetica', 'normal');
				doc.text(truncatedTitle, margin, yPosition);
				doc.text(year, margin + 85, yPosition);
				doc.text(truncatedMedium, margin + 115, yPosition);
				doc.text(truncatedDimensions, margin + 155, yPosition);

				// Price in elegant style if available - below title
				if (hasPrice) {
					doc.setFontSize(8);
					doc.setTextColor(100);
					doc.setFont('helvetica', 'normal');
					const price = `${piece.currency || 'EUR'} ${piece.price.toLocaleString()}`;
					doc.text(price, margin, yPosition + 4);
					doc.setTextColor(0);
				}

				yPosition += entryHeight;
			}

			// Footer
			const totalPages = doc.internal.getNumberOfPages();
			for (let i = 1; i <= totalPages; i++) {
				doc.setPage(i);
				doc.setFontSize(8);
				doc.setTextColor(100);
				doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
			}

			// Download PDF with timestamp
			const now = new Date();
			const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
			const filename = selectedStatus === 'all' 
				? `inventar-all-artworks-${timestamp.replace(/\//g, '-')}.pdf`
				: `inventar-${selectedStatus}-artworks-${timestamp.replace(/\//g, '-')}.pdf`;
			doc.save(filename);

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
	<div class="header-actions">
		<button class="export-button" on:click={exportToPDF}>
			📄 Export PDF
		</button>
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
		display: flex;
		justify-content: flex-end;
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
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 40px 30px;
		max-width: 100%;
	}

	.artwork {
		background: #fff;
		max-width: 400px;
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

		.header-actions {
			flex-direction: column;
			gap: 8px;
		}

		.export-button,
		.add-button {
			padding: 8px 16px;
			font-size: 12px;
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