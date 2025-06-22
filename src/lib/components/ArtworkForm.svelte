<script lang="ts">
	import type { ArtPiece } from '$lib/types/ArtPiece.js';
	import { createEventDispatcher } from 'svelte';
	import ImageUpload from './ImageUpload.svelte';

	export let artwork: Partial<ArtPiece> = {};
	export let isEditing = false;

	const dispatch = createEventDispatcher<{
		save: ArtPiece;
		cancel: void;
	}>();

	let formData = {
		title: '',
		artist: 'Artist Name',
		year: new Date().getFullYear(),
		medium: '',
		description: '',
		imageUrl: '',
		imagePath: '',
		status: 'available' as ArtPiece['status'],
		price: 0,
		currency: 'EUR',
		location: '',
		dimensions: {
			width: 0,
			height: 0,
			unit: 'cm' as const
		}
	};

	// Initialize form data when component mounts or artwork changes
	function initializeFormData() {
		formData = {
			title: artwork.title || '',
			artist: artwork.artist || 'Artist Name',
			year: artwork.year || new Date().getFullYear(),
			medium: artwork.medium || '',
			description: artwork.description || '',
			imageUrl: artwork.imageUrl || '',
			imagePath: artwork.imagePath || '',
			status: artwork.status || 'available' as ArtPiece['status'],
			price: artwork.price || 0,
			currency: artwork.currency || 'EUR',
			location: artwork.location || '',
				dimensions: {
				width: artwork.dimensions?.width || 0,
				height: artwork.dimensions?.height || 0,
				unit: artwork.dimensions?.unit || 'cm' as const
			}
		};
	}

	// Initialize when artwork prop changes
	$: if (artwork) {
		initializeFormData();
	}

	function handleSubmit() {
		// For new artworks, don't include id, createdAt, updatedAt - let the store handle these
		if (isEditing && artwork.id) {
			const artworkData: ArtPiece = {
				id: artwork.id,
				...formData,
				createdAt: artwork.createdAt || new Date(),
				updatedAt: new Date()
			};
			dispatch('save', artworkData);
		} else {
			// For new artworks, only send the form data without id/timestamps
			dispatch('save', formData);
		}
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleImageChange(event: CustomEvent<string>) {
		formData.imageUrl = event.detail;
	}

	function handleImagePathChange(event: CustomEvent<string>) {
		formData.imagePath = event.detail;
	}

	// Generate a unique ID for new artworks (used for image uploads)
	// Use a consistent ID so the same form always uses the same ID for image uploads
	let tempArtworkId = artwork.id;
	if (!tempArtworkId) {
		// Generate once and keep the same ID for this form instance
		tempArtworkId = crypto.randomUUID();
	}
</script>

<div class="form-container">
	<form on:submit|preventDefault={handleSubmit}>
		<div class="form-grid">
			<div class="form-group">
				<label for="title">Title *</label>
				<input
					id="title"
					type="text"
					bind:value={formData.title}
					required
				/>
			</div>


			<div class="form-group">
				<label for="year">Year *</label>
				<input
					id="year"
					type="number"
					bind:value={formData.year}
					min="1000"
					max={new Date().getFullYear() + 10}
					required
				/>
			</div>

			<div class="form-group">
				<label for="medium">Medium *</label>
				<input
					id="medium"
					type="text"
					bind:value={formData.medium}
					required
				/>
			</div>

			<div class="form-group full-width">
				<ImageUpload 
					currentImageUrl={formData.imageUrl}
					artworkId={tempArtworkId}
					required={!isEditing || !formData.imageUrl}
					on:imageChange={handleImageChange}
					on:imagePathChange={handleImagePathChange}
				/>
			</div>

			<div class="form-group">
				<label for="status">Status</label>
				<select id="status" bind:value={formData.status}>
					<option value="available">Available</option>
					<option value="sold">Sold</option>
					<option value="on_hold">On Hold</option>
					<option value="exhibition">Exhibition</option>
					<option value="damaged">Damaged</option>
				</select>
			</div>

			<div class="form-group">
				<label for="price">Price</label>
				<input
					id="price"
					type="number"
					bind:value={formData.price}
					min="0"
					step="0.01"
				/>
			</div>

			<div class="form-group">
				<label for="currency">Currency</label>
				<select id="currency" bind:value={formData.currency}>
					<option value="EUR">EUR</option>
					<option value="USD">USD</option>
					<option value="GBP">GBP</option>
					<option value="JPY">JPY</option>
				</select>
			</div>

			<div class="form-group">
				<label for="location">Location</label>
				<input
					id="location"
					type="text"
					bind:value={formData.location}
				/>
			</div>
		</div>

		<div class="dimensions-section">
			<h3>Dimensions</h3>
			<div class="dimensions-grid">
				<div class="form-group">
					<label for="width">Width *</label>
					<input
						id="width"
						type="number"
						bind:value={formData.dimensions.width}
						min="0"
						step="0.1"
						required
					/>
				</div>

				<div class="form-group">
					<label for="height">Height *</label>
					<input
						id="height"
						type="number"
						bind:value={formData.dimensions.height}
						min="0"
						step="0.1"
						required
					/>
				</div>


				<div class="form-group">
					<label for="unit">Unit</label>
					<select id="unit" bind:value={formData.dimensions.unit}>
						<option value="cm">cm</option>
						<option value="in">in</option>
						<option value="mm">mm</option>
					</select>
				</div>
			</div>
		</div>

		<div class="form-group full-width">
			<label for="description">Description</label>
			<textarea
				id="description"
				bind:value={formData.description}
				rows="4"
			></textarea>
		</div>


		<div class="form-actions">
			<button type="button" class="cancel-button" on:click={handleCancel}>
				Cancel
			</button>
			<button type="submit" class="save-button">
				{isEditing ? 'Update' : 'Create'} Artwork
			</button>
		</div>
	</form>
</div>

<style>
	.form-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 30px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 30px;
	}

	.dimensions-section {
		margin-bottom: 30px;
	}

	.dimensions-section h3 {
		font-size: 16px;
		font-weight: 400;
		margin-bottom: 15px;
		border-bottom: 1px solid #000;
		padding-bottom: 10px;
	}

	.dimensions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 15px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	label {
		font-size: 14px;
		font-weight: 400;
		margin-bottom: 5px;
		color: #000;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	input, select, textarea {
		padding: 10px;
		border: 1px solid #ccc;
		font-size: 16px;
		font-family: inherit;
		background: #fff;
	}

	input:focus, select:focus, textarea:focus {
		outline: none;
		border-color: #000;
	}

	textarea {
		resize: vertical;
	}

	.form-actions {
		display: flex;
		gap: 15px;
		justify-content: flex-end;
		margin-top: 30px;
		padding-top: 30px;
		border-top: 1px solid #000;
	}

	.cancel-button, .save-button {
		padding: 12px 24px;
		font-size: 14px;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 1px;
		border: 1px solid #000;
		background: #fff;
		color: #000;
		cursor: pointer;
	}

	.save-button {
		background: #000;
		color: #fff;
	}

	.cancel-button:hover {
		background: #f5f5f5;
	}

	.save-button:hover {
		background: #333;
	}

	@media (max-width: 768px) {
		.form-container {
			padding: 20px;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}

		.dimensions-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>