export class BotRoom extends Room<RoomState> {
	session?: BotSession;
	url?: string;
	guestCount: number = 0;

	async onCreate(options: RoomCreateOptions) {
		const sessionInstance = await hyperbeam.createSession({
			region: options.region,
		});
		const sessionData = await db.session.upsert({
			where: { sessionId: sessionInstance.sessionId },
			create: {
				sessionId: sessionInstance.sessionId,
				url: nanoid(8),
				embedUrl: sessionInstance.embedUrl,
				adminToken: sessionInstance.adminToken,
			},
			update: {
				sessionId: sessionInstance.sessionId,
				url: nanoid(8),
				embedUrl: sessionInstance.embedUrl,
				adminToken: sessionInstance.adminToken,
			},
		});
		this.session = {
			...sessionData,
			instance: sessionInstance,
		};
		console.log("Session created: ");
	}

	async onAuth(client: Client, options: any, req?: IncomingMessage | undefined): Promise<AfterAuth> {
		if (!req) throw new ServerError(400, "No request.");
		if (!this.session) throw new ServerError(400, "No session created.");

		const authHeader = req.headers.authorization;
		if (!authHeader) {
			client.send("noAuth", {
				session: sanitize.session(this.session),
			});
			return { user: null };
		}

		const token = authHeader.split(" ")[1];
		if (!token) throw new ServerError(400, "No token provided");
		const result = TokenHandler.verify(token);
		if (!result) throw new ServerError(400, "Invalid token");

		const { id, verify } = result;
		const user = await db.user.findFirst({ where: { id } });

		if (!user) throw new ServerError(400, "User not found");
		if (!user.hash) throw new ServerError(400, "User not logged in");
		if (!verify(user)) throw new ServerError(400, "Invalid token");

		console.log(`User authenticated: ${user.id}`);
		client.send("authSuccess", {
			user: sanitize.user(user),
			session: sanitize.session(this.session),
		});
		return { user };
	}

	onJoin(client: AuthenticatedClient) {
		console.log(`Member joined: ${client.auth.user ? client.auth.user.id : "Guest"}`);
		const member = new Member();
		if (client.auth.user) {
			member.id = client.auth.user.id;
			member.name = `${client.auth.user.username}#${client.auth.user.discriminator}`;
			member.avatarUrl = client.auth.user.avatar
				? `https://cdn.discordapp.com/avatars/${client.auth.user.id}/${client.auth.user.avatar}.png`
				: `https://cdn.discordapp.com/embed/avatars/${+client.auth.user.discriminator % 5}.png`;
		} else {
			member.id = client.sessionId;
			member.name = `Guest ${++this.guestCount}`;
			member.avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png";
		}
		this.state.members.set(client.sessionId, member);
	}

	onLeave(client: AuthenticatedClient) {
		console.log("Member left!", client.auth.user ? client.auth.user.id : "Guest");
		this.state.members.delete(client.sessionId);
	}

	onDispose() {
		console.log("Dispose HyperbeamSession");
	}

	registerMessageHandlers() {
		this.onMessage("cursorMove", (client: AuthenticatedClient, message: { x: number; y: number }) => {
			if (client.auth.user) {
				const member = this.state.members.get(client.auth.user.id);
				if (member) {
					member.cursor.x = message.x;
					member.cursor.y = message.y;
				}
			}
		});
	}
}
