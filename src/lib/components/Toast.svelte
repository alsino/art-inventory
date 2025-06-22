<script lang="ts">
	import { toasts } from '$lib/stores/toast.js';
	import { fly } from 'svelte/transition';

	function getToastIcon(type: 'success' | 'error' | 'info') {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'info':
			default:
				return 'ℹ';
		}
	}

	function getToastColor(type: 'success' | 'error' | 'info') {
		switch (type) {
			case 'success':
				return '#28a745';
			case 'error':
				return '#dc3545';
			case 'info':
			default:
				return '#17a2b8';
		}
	}
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<div 
			class="toast"
			transition:fly={{ y: -20, duration: 300 }}
		>
			<div class="toast-content">
				<span 
					class="toast-icon" 
					style="color: {getToastColor(toast.type)}"
				>
					{getToastIcon(toast.type)}
				</span>
				<span class="toast-message">{toast.message}</span>
			</div>
			<button 
				class="toast-close" 
				on:click={() => toasts.remove(toast.id)}
				aria-label="Close notification"
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 30px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 500px;
		pointer-events: none;
	}

	.toast {
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		padding: 18px 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		pointer-events: auto;
		min-width: 350px;
		backdrop-filter: blur(10px);
	}

	.toast-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}

	.toast-icon {
		font-size: 20px;
		font-weight: bold;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.9);
	}

	.toast-message {
		font-size: 15px;
		color: #333;
		line-height: 1.4;
		font-weight: 500;
	}

	.toast-close {
		background: rgba(0, 0, 0, 0.05);
		border: none;
		font-size: 18px;
		color: #666;
		cursor: pointer;
		padding: 0;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 16px;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.toast-close:hover {
		background: rgba(0, 0, 0, 0.1);
		color: #333;
	}

	@media (max-width: 768px) {
		.toast-container {
			bottom: 20px;
			left: 20px;
			right: 20px;
			transform: none;
			max-width: none;
		}

		.toast {
			min-width: auto;
			padding: 16px 18px;
		}

		.toast-message {
			font-size: 14px;
		}

		.toast-close {
			width: 26px;
			height: 26px;
			margin-left: 12px;
		}
	}
</style>