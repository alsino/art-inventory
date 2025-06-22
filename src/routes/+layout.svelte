
<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
</script>

<header>
	<nav>
		<h1>
			<a href="/" class="logo">
				<img src="/icon.png" alt="Inventar" class="logo-icon" />
				INVENTAR
			</a>
		</h1>
	</nav>
</header>

<main>
	<slot />
</main>

<Toast />

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: #fff;
		border-bottom: 1px solid #000;
	}
	
	nav {
		padding: 15px 30px;
		text-align: left;
		max-width: 1200px;
		margin: 0 auto;
	}
	
	nav h1 {
		font-size: 18px;
		font-weight: 400;
		letter-spacing: 1.5px;
		margin: 0;
	}
	
	.logo {
		color: #000;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		transition: all 0.2s ease;
	}
	
	.logo:hover {
		opacity: 0.7;
	}
	
	.logo-icon {
		width: 20px;
		height: 20px;
		object-fit: contain;
		filter: brightness(0);
	}
	
	main {
		margin-top: 60px;
		min-height: calc(100vh - 60px);
	}

	@media (max-width: 768px) {
		nav {
			padding: 12px 20px;
		}
		
		nav h1 {
			font-size: 16px;
			letter-spacing: 1px;
		}
		
		.logo {
			gap: 8px;
		}
		
		.logo-icon {
			width: 18px;
			height: 18px;
		}
		
		main {
			margin-top: 55px;
		}
	}
</style>