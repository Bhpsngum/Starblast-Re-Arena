const Teams = [
    {
        names: ["Red", "Orange"],
        hues: [0, 30],
        instructor: "Zoltar",
        need_spawnpoint: true
    },
    {
        names: ["Cyan", "Blue"],
        hues: [180, 210],
        instructor: "Lucina",
        need_spawnpoint: true
    },
    {
        names: ["Green"],
        hues: [150],
        instructor: "Klaus",
        need_spawnpoint: true
    },
    {
        names: ["Yellow"],
        hues: [60],
        instructor: "Maria",
        need_spawnpoint: true
    },
    {
        names: ["Purple", "Pink"],
        hues: [270, 300],
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