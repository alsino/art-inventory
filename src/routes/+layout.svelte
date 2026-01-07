<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
</script>

<header>
	<nav>
		<h1>
			<a href="/" class="logo">inventar</a>
		</h1>
	</nav>
</header>

<main>
	<slot />
</main>

<Toast />

<style>
	@font-face {
		font-family: 'IBM Plex Mono';
		font-style: normal;
		font-weight: 400;
		font-display: swap;
		src: url('/fonts/IBMPlexMono-Regular.woff2') format('woff2');
	}

	@font-face {
		font-family: 'IBM Plex Mono';
		font-style: normal;
		font-weight: 500;
		font-display: swap;
		src: url('/fonts/IBMPlexMono-Medium.woff2') format('woff2');
	}

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
		font-family: 'IBM Plex Mono', monospace;
		font-size: 18px;
		font-weight: 400;
		letter-spacing: 0.5px;
		margin: 0;
	}

	.logo {
		color: #000;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.logo:hover {
		opacity: 0.7;
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
		}

		main {
			margin-top: 55px;
		}
	}
</style>