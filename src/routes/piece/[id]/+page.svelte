<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	const { piece } = data;

	function formatPrice(price?: number, currency?: string): string {
		if (!price) return '';
		return `${currency || 'USD'} ${price.toLocaleString()}`;
	}

	function formatStatus(status: typeof piece.status): string {
		return status.replace('_', ' ').toLowerCase();
	}

	function getStatusColor(status: typeof piece.status): string {
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
</script>

<svelte:head>
	<title>{piece.title}</title>
</svelte:head>

<div class="container">
	<nav class="breadcrumb">
		<a href="/">← Back</a>
		<a href="/piece/{piece.id}/edit" class="edit-link">Edit</a>
	</nav>

	<div class="detail-layout">
		<div class="image-section">
			<div class="image-container">
				<img src={piece.imageUrl} alt={piece.title} />
			</div>
		</div>

		<div class="info-section">
			<div class="artwork-info">
				<h1>{piece.title}</h1>
				<p>{piece.year}</p>
				<p>{piece.medium}</p>
				<p class="dimensions">
					{piece.dimensions.width} × {piece.dimensions.height} {piece.dimensions.unit}
				</p>
				<p class="status">
					<span class="status-dot" style="background-color: {getStatusColor(piece.status)}"></span>
					{formatStatus(piece.status)}
				</p>
				{#if piece.price}
					<p class="price">{formatPrice(piece.price, piece.currency)}</p>
				{/if}
				{#if piece.location}
					<p class="location">{piece.location}</p>
				{/if}
			</div>

			{#if piece.description}
				<div class="description">
					<p>{piece.description}</p>
				</div>
			{/if}
		</div>
	</div>
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
		justify-content: space-between;
		align-items: center;
	}

	.breadcrumb a {
		color: #000;
		font-size: 16px;
	}

	.edit-link {
		border: 1px solid #000;
		padding: 8px 16px;
		font-size: 14px;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.edit-link:hover {
		background: #000;
		color: #fff;
	}

	.detail-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 60px;
		align-items: start;
	}

	.image-container {
		width: 100%;
	}

	.image-container img {
		width: 100%;
		height: auto;
		display: block;
	}

	.artwork-info {
		line-height: 1.3;
	}

	.artwork-info h1 {
		font-size: 16px;
		font-weight: 400;
		margin-bottom: 5px;
	}

	.artwork-info p {
		font-size: 16px;
		color: #000;
		margin-bottom: 3px;
	}

	.dimensions {
		margin-top: 15px !important;
		margin-bottom: 15px !important;
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

	.price {
		font-weight: 400;
		margin-top: 10px !important;
	}

	.location {
		color: #666 !important;
		font-size: 14px !important;
	}

	.description {
		margin-top: 40px;
		padding-top: 30px;
		border-top: 1px solid #000;
	}

	.description p {
		font-size: 16px;
		line-height: 1.4;
		color: #000;
	}

	@media (max-width: 768px) {
		.container {
			padding: 20px;
		}

		.detail-layout {
			grid-template-columns: 1fr;
			gap: 30px;
		}

		.breadcrumb {
			margin-bottom: 30px;
		}

		.description {
			margin-top: 30px;
			padding-top: 20px;
		}
	}
</style>