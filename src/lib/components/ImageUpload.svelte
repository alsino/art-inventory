 <script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { uploadImageWithProgress } from '$lib/firebase/storage.js';

	export let currentImageUrl: string = '';
	export let required: boolean = false;
	export let artworkId: string = '';

	const dispatch = createEventDispatcher<{
		imageChange: string;
		imagePathChange: string;
	}>();

	let fileInput: HTMLInputElement;
	let dragOver = false;
	let previewUrl = currentImageUrl;
	let uploading = false;
	let uploadProgress = 0;
	let uploadError = '';
	
	// Update preview when currentImageUrl changes
	$: if (currentImageUrl) {
		previewUrl = currentImageUrl;
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			handleFile(target.files[0]);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		
		if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
			handleFile(event.dataTransfer.files[0]);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	async function handleFile(file: File) {
		if (!file.type.startsWith('image/')) {
			uploadError = 'Please select an image file';
			return;
		}

		if (!artworkId) {
			uploadError = 'Artwork ID is required for upload';
			return;
		}

		// Clear any previous errors
		uploadError = '';
		uploading = true;
		uploadProgress = 0;

		try {
			// Create object URL for immediate preview
			const objectUrl = URL.createObjectURL(file);
			previewUrl = objectUrl;
			
			// Upload to Firebase Storage with progress tracking
			const result = await uploadImageWithProgress(file, artworkId, (progress) => {
				uploadProgress = progress;
			});
			
			// Update preview with the final URL and dispatch the changes
			previewUrl = result.url;
			dispatch('imageChange', result.url);
			dispatch('imagePathChange', result.path);
			
		} catch (error) {
			console.error('Image upload failed:', error);
			uploadError = 'Failed to upload image. Please try again.';
			// Reset preview on error
			previewUrl = currentImageUrl;
		} finally {
			uploading = false;
			uploadProgress = 0;
		}
	}

	function removeImage() {
		previewUrl = '';
		if (fileInput) {
			fileInput.value = '';
		}
		dispatch('imageChange', '');
		dispatch('imagePathChange', '');
	}

	function openFileDialog() {
		fileInput?.click();
	}
</script>

<div class="image-upload">
	<label class="upload-label">
		Image {required ? '*' : ''}
	</label>
	
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		on:change={handleFileSelect}
		style="display: none;"
		required={required && !previewUrl}
	/>

	{#if uploadError}
		<div class="error-message">
			{uploadError}
		</div>
	{/if}

	{#if previewUrl}
		<div class="preview-container">
			<img src={previewUrl} alt="Preview" class="preview-image" />
			{#if uploading}
				<div class="upload-overlay">
					<div class="progress-container">
						<div class="progress-bar">
							<div class="progress-fill" style="width: {uploadProgress}%"></div>
						</div>
						<p class="progress-text">{Math.round(uploadProgress)}% uploaded</p>
					</div>
				</div>
			{:else}
				<div class="image-actions">
					<button type="button" class="change-button" on:click={openFileDialog} disabled={uploading}>
						Change Image
					</button>
					<button type="button" class="remove-button" on:click={removeImage} disabled={uploading}>
						Remove
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<div 
			class="upload-area"
			class:drag-over={dragOver}
			on:drop={handleDrop}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:click={openFileDialog}
			role="button"
			tabindex="0"
			on:keydown={(e) => e.key === 'Enter' && openFileDialog()}
		>
			<div class="upload-content">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
					<circle cx="8.5" cy="8.5" r="1.5"/>
					<polyline points="21,15 16,10 5,21"/>
				</svg>
				<p class="upload-text">
					Click to upload or drag and drop<br>
					<span class="upload-subtext">PNG, JPG, GIF up to 10MB</span>
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.image-upload {
		display: flex;
		flex-direction: column;
	}

	.upload-label {
		font-size: 14px;
		font-weight: 400;
		margin-bottom: 5px;
		color: #000;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.upload-area {
		border: 2px dashed #ccc;
		border-radius: 4px;
		padding: 40px 20px;
		text-align: center;
		cursor: pointer;
		transition: border-color 0.2s ease;
		background: #fafafa;
	}

	.upload-area:hover,
	.upload-area.drag-over {
		border-color: #000;
		background: #f5f5f5;
	}

	.upload-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.upload-content svg {
		color: #666;
	}

	.upload-text {
		font-size: 16px;
		color: #333;
		margin: 0;
		line-height: 1.4;
	}

	.upload-subtext {
		font-size: 14px;
		color: #666;
	}

	.preview-container {
		position: relative;
		border: 1px solid #ddd;
		border-radius: 4px;
		overflow: hidden;
	}

	.preview-image {
		width: 100%;
		height: 200px;
		object-fit: cover;
		display: block;
	}

	.image-actions {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		gap: 10px;
	}

	.change-button,
	.remove-button {
		padding: 6px 12px;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 1px solid #fff;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.change-button:hover {
		background: rgba(0, 0, 0, 0.9);
	}

	.remove-button {
		background: rgba(220, 53, 69, 0.8);
	}

	.remove-button:hover {
		background: rgba(220, 53, 69, 1);
	}

	.upload-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.progress-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		width: 200px;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #fff;
		transition: width 0.3s ease;
		border-radius: 4px;
	}

	.progress-text {
		margin: 0;
		font-size: 14px;
		color: white;
		font-weight: 500;
	}

	.error-message {
		background: #fee;
		border: 1px solid #fcc;
		color: #c33;
		padding: 10px;
		border-radius: 4px;
		margin-bottom: 10px;
		font-size: 14px;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.upload-area {
			padding: 30px 15px;
		}

		.preview-image {
			height: 150px;
		}

		.image-actions {
			position: static;
			padding: 10px;
			background: #f5f5f5;
			justify-content: center;
		}

		.change-button,
		.remove-button {
			border-color: #ddd;
			background: #fff;
			color: #333;
		}

		.remove-button {
			background: #dc3545;
			color: #fff;
		}
	}
</style>