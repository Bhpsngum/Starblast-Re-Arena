const Teams = [
	{
		names: ["Red"],
		hues: [0],
		instructor: "Zoltar",
		need_spawnpoint: true,
		spawning_radius: 69 // radius to spawn randomly from within base center, default 0
	},
	{
		names: ["Cyan"],
		hues: [180],
		instructor: "Lucina",
		need_spawnpoint: true
	},
	// {
	//     names: ["Green"],
	//     hues: [150],
	//     instructor: "Klaus",
	//     need_spawnpoint: true
	// },
	{
		names: ["Yellow"],
		hues: [60],
		instructor: "Maria",
		need_spawnpoint: true
	},
	{
		names: ["Purple"],
		hues: [270],
		instructor: "Kan",
		need_spawnpoint: true
	}
];

const StaticTeams = [0, 1]; // list of team indices that MUST BE on list of teams regardless of randomization

const GhostTeam = {
	ghost: true,
	id: [],
	name: "Sussy Amogus",
	hue: 340,
	instructor: "Kan",
	need_spawnpoint: false
};