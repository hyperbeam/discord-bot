<div class="icon-button" on:click on:keypress>
	<slot />
</div>

<style lang="scss">
	.icon-button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		margin: 4px;
		border-radius: 8px;
		width: 40px;
		height: 40px;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}

		&:active {
			background-color: rgba(255, 255, 255, 0.2);
		}
	}
</style>
