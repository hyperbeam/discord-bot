import { copyFile, readdir, rm } from "fs/promises";
import { resolve } from "path";

// simple script to sync schema files between bot and client

const botDir = resolve(__dirname, "../bot");
const clientDir = resolve(__dirname, "../client");

readdir(`${clientDir}/src/schemas`).then(async (files) => {
	for (const file of files) {
		console.log(`Deleting schema ${file}`);
		await rm(resolve(`${clientDir}/src/schemas/${file}`), { force: true }).catch((err) => console.error(err));
	}
	readdir(`${botDir}/schemas/`).then(async (files) => {
		for (const file of files) {
			const source = resolve(`${botDir}/schemas/${file}`);
			const destination = resolve(`${clientDir}/src/schemas/${file}`);
			console.log(`Copying ${file} to ${destination}`);
			await copyFile(source, destination).catch((err) => console.error(err));
		}
	});
});
