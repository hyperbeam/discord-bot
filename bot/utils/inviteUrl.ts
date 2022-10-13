const inviteUrl = new URL("https://discord.com/api/oauth2/authorize");
inviteUrl.search = new URLSearchParams({
	client_id: process.env.VITE_CLIENT_ID,
	redirect_uri: process.env.VITE_CLIENT_BASE_URL + "/authorize",
	response_type: "code",
	scope: "identify email bot applications.commands",
	permissions: "277062470720",
}).toString();

export default inviteUrl.toString();
