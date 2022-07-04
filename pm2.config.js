module.exports = {
	apps: [
		{
			name: "hyperbeam-bot",
			script: "node",
			args: "dist/bot/index.js",
			max_restarts: 10,
		},
		{
			name: "hyperbeam-client",
			script: "pnpm",
			args: "run launch:client",
		},
	],
};
