import database from "../bot/classes/database";

const deleteInactiveUsers = async (days = 30) => {
	const day = 1000 * 60 * 60 * 24;
	const inactiveUsers = await database.user.findMany({
		where: {
			updatedAt: {
				lte: new Date(Date.now() - days * day),
			},
		},
	});
	if (!inactiveUsers.length) return console.log("No inactive users found.");
	for (const user of inactiveUsers) {
		// Delete user from database
		await database.user.delete({
			where: {
				id: user.id,
			},
		});
		console.log(`Deleted user ${user.id}`);

		// Delete session from database
		// const result = await database.session.deleteMany({
		// 	where: {
		// 		ownerId: user.id,
		// 	},
		// });
		// console.log(`Deleted ${result.count} sessions for user ${user.id}`);
	}
};

deleteInactiveUsers(30);
