<div class="icon-button" on:click on:keypress>
	<slot />
</div>

<style lang="scss">
	.icon-button {
		display: inline-flex;
		margin: 4px;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		align-items: center;
		justify-content: center;
		cursor: pointer;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}

		&:active {
			background-color: rgba(255, 255, 255, 0.2);
		}
	}
</style>
