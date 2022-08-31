<script lang="ts">
	import demoUrl from "../demo.mp4";

	const inviteUrl = [
		`https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}`,
		"permissions=277062470720",
		`redirect_uri=${encodeURIComponent(import.meta.env.VITE_CLIENT_BASE_URL + "/authorize")}`,
		"response_type=code",
		"scope=identify%20email%20bot%20applications.commands",
	].join("&");
</script>

<div class="container">
	<main>
		<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M45.639 7.73568C45.7124 7.96529 45.7836 8.18796 45.853 8.40013C47.9155 14.6439 48.0373 20.0626 47.9905 22.9501C47.9851 23.2814 47.9803 23.6085 47.9756 23.9316C47.8797 30.4296 47.808 35.2959 44.1373 39.422C42.2623 41.5314 40.0311 42.947 39.2248 43.4064C36.2905 45.0845 33.6561 45.5626 31.3217 45.9845C28.4155 46.5095 26.1748 46.5095 23.9998 46.5095C21.8248 46.5095 19.5842 46.5095 16.678 45.9845C14.3436 45.5626 11.7186 45.0845 8.77485 43.4064C7.9686 42.947 5.73734 41.5314 3.86234 39.4314C0.206075 35.3214 0.129017 30.4686 0.0265535 24.0158C0.0210368 23.6684 0.0154465 23.3163 0.00921995 22.9595C-0.0376551 20.0626 0.0842199 14.6439 2.15609 8.38138C2.22758 8.16348 2.30105 7.93426 2.37688 7.69764C3.12651 5.35871 4.10778 2.297 5.69984 2.297C7.52797 2.297 9.1311 6.75013 9.71235 8.46576C10.0558 9.41425 10.9911 11.8532 11.2744 12.5919C11.3159 12.7001 11.3434 12.7718 11.353 12.797C11.3624 12.7923 11.3733 12.7868 11.3853 12.7807C11.4688 12.7383 11.6122 12.6657 11.7842 12.6001C11.9386 12.5412 12.0855 12.4856 12.2174 12.4356C12.5262 12.3187 12.7536 12.2327 12.8061 12.2064C13.094 12.1115 13.2952 12.0497 13.4534 12.0011C13.7484 11.9105 13.8941 11.8658 14.1748 11.7376C14.2015 11.7251 14.2293 11.7125 14.2579 11.6995C14.4002 11.6351 14.5641 11.5609 14.728 11.4283C14.7458 11.4118 14.7684 11.3918 14.7951 11.3681C14.9514 11.2296 15.2488 10.966 15.553 10.5658C15.971 9.93875 16.2532 9.17599 16.4799 8.56339C16.5684 8.32414 16.6485 8.10779 16.7248 7.93138C17.0342 7.26575 17.6623 6.40325 19.1155 5.65325C19.0405 5.88763 18.9561 6.35638 19.078 6.9095C19.2373 7.697 19.7436 8.20325 19.9405 8.36263C20.1748 7.772 20.6061 6.95638 21.2342 6.047C22.9498 3.73138 25.0686 2.7095 25.6592 2.43763C25.6802 2.42866 25.7017 2.41948 25.7235 2.41013C26.6383 2.01877 28.2979 1.30873 30.4405 1.53763C31.7248 1.697 32.7092 2.08138 33.3373 2.40013C32.7467 2.4845 31.6498 2.71888 30.7873 3.58138C29.1373 5.19388 29.0623 8.06263 30.2342 9.62825C31.1322 10.8443 32.8888 11.435 33.9489 11.7915L33.9561 11.7939C34.0238 11.8297 34.1678 11.8775 34.3714 11.945C34.6469 12.0363 35.0315 12.1637 35.4842 12.347C35.8311 12.4595 36.2248 12.6189 36.6561 12.8158C36.7405 12.6189 37.9123 9.572 38.2967 8.4845C38.878 6.7595 40.4811 2.31576 42.3092 2.31576C43.9061 2.31576 44.8885 5.38837 45.639 7.73568ZM18.0748 35.072C18.853 34.2845 18.9748 33.272 19.0498 32.297C19.1342 31.7439 19.4811 28.2001 16.7811 25.7532C16.2373 25.2376 14.3248 23.4845 11.7186 23.9532C9.42171 24.3376 7.50921 26.2876 7.19984 28.5939C6.91205 30.8438 8.30348 32.5503 8.87639 33.2529C8.91937 33.3056 8.95775 33.3527 8.99046 33.3939C10.3068 34.8635 11.9007 35.2753 12.8213 35.5131C12.8579 35.5226 12.8935 35.5318 12.928 35.5407C12.9744 35.5515 13.0229 35.5629 13.0735 35.5748C14.2987 35.8621 16.6883 36.4225 18.0748 35.072ZM35.1558 35.5071C36.0749 35.2692 37.6862 34.8521 38.9998 33.3845C39.0326 33.343 39.0714 33.2954 39.115 33.2418C39.6832 32.5433 41.0771 30.8301 40.7811 28.5751C40.4717 26.2782 38.5592 24.3282 36.2623 23.9345C33.6561 23.4657 31.7436 25.2282 31.1998 25.7345C28.5092 28.1907 28.8655 31.7439 28.9405 32.2876C29.0155 33.2626 29.1373 34.2845 29.9155 35.0626C31.302 36.4132 33.6916 35.8527 34.9168 35.5654C34.9674 35.5535 35.0159 35.5421 35.0623 35.5314C35.0926 35.5235 35.1238 35.5154 35.1558 35.5071Z"
				fill="#ffffff" />
		</svg>

		<h1>Browse the web with your community</h1>
		<p>Hyperbeam's Discord bot is the best way to browse any website together right from Discord.</p>

		<button
			class="add-btn"
			on:click={() => {
				window.location.href = inviteUrl;
			}}>
			Add on Discord
		</button>
		<button
			class="support-btn"
			on:click={() => {
				window.location.href = import.meta.env.VITE_DISCORD_SUPPORT_SERVER;
			}}>
			Support
		</button>

		<ul>
			<li>
				Want Hyperbeam's virtual browser in your app? <br />
				Check out the
				<a href="https://www.hyperbeam.com">Hyperbeam API</a>
				.
			</li>
			<li>
				<a href={import.meta.env.VITE_DISCORD_SUPPORT_SERVER}>Discord</a>
			</li>
			<li>
				<a href={import.meta.env.VITE_GITHUB_URL}>GitHub</a>
			</li>
		</ul>
	</main>
	<video src={demoUrl} type="video/mp4" autoplay loop muted />
</div>

<style lang="scss">
	.container {
		position: relative;
		margin: 0 auto;
		max-width: 1512px;
		height: 100vh;
	}

	main {
		position: absolute;
		top: 50%;
		width: 33%;
		margin-left: 8.33%;
		z-index: 1;
		transform: translateY(-50%);
	}

	svg {
		margin-bottom: 1rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	p {
		color: #fffd;
		margin-bottom: 1rem;
	}

	button {
		margin-bottom: 1rem;
	}

	.add-btn {
		margin-right: 1rem;
	}

	.support-btn {
		margin-right: 1rem;
		color: white;
		background-color: #fff2;
	}

	ul {
		list-style: none;
		margin-bottom: 1rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	a {
		color: #4ab7f5;
		text-underline-offset: 2px;
	}

	video {
		position: absolute;
		top: 50%;
		right: 0;
		transform: translateY(-50%);
		max-inline-size: 66%;
	}

	@media (max-width: 992px) {
		main {
			position: initial;
			margin: 144px 8.33% 0 8.33%;
			width: auto;
			transform: translate(0%);
		}

		video {
			max-inline-size: 100%;
			position: initial;
			transform: translate(0%);
		}
	}

	@media (max-width: 576px) {
		h1 {
			font-size: 2rem;
		}
	}
</style>
