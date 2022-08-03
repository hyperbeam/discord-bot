module.exports = {
	apps: [
		{
			name: "hyperbeam-bot",
			script: "pnpm run bot",
			max_restarts: 10,
		},
		{
			name: "hyperbeam-client",
			script: "pnpm run client",
			max_restarts: 10,
		},
	],
};
