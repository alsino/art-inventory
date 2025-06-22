
<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
</script>

<header>
	<nav>
		<h1><a href="/">ART INVENTORY</a></h1>
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
		padding: 20px 30px;
		text-align: center;
	}
	
	nav h1 {
		font-size: 16px;
		font-weight: 400;
		letter-spacing: 2px;
	}
	
	nav a {
		color: #000;
	}
	
	main {
		margin-top: 60px;
		min-height: calc(100vh - 60px);
	}

	@media (max-width: 768px) {
		nav {
			padding: 15px 20px;
		}
		
		nav h1 {
			font-size: 14px;
		}
		
		main {
			margin-top: 50px;
		}
	}
</style>