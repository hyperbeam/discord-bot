export const swatches = [
	"#343a40",
	"#e03131",
	"#c2255c",
	"#9c36b5",
	"#6741d9",
	"#3b5bdb",
	"#1971c2",
	"#0c8599",
	"#099268",
	"#2f9e44",
	"#f08c00",
	"#e8590c",
];

export default function color(id: string) {
	const randomNumber = Math.round(Math.random() * swatches.length);
	let seed = `${randomNumber}${id}`;
	seed = seed.substring(seed.length - 5);
	const index = parseInt(seed, 16) % swatches.length;
	return swatches[index];
}
