module.exports = {
	apps: [
		{
			name: "hyperbeam-bot",
			script: "npm run bot",
			max_restarts: 10,
		},
		{
			name: "hyperbeam-client",
			script: "npm run client",
			max_restarts: 10,
		},
	],
};
