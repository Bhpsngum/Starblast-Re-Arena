const map_name = "Re:Arena Battlefield"; // leave `null` if you want randomized map name

Object.assign(GAME_OPTIONS, {
	duration: 2 * 60 * 60, // game duration in seconds
	points: 200, // points for one team to reach in order to win
	required_players: 2, // players required to start, min 2
	AFK_timeout: 1 * 60, // maximum AFK time before the ship will be kicked, in seconds
	waiting_time: 30, // in seconds
	ship_ui_timeout: 30, // time for the ship ui to hide, in seconds
	healing_ratio: 1, // better don't touch this
	crystal_drop: 0.5, // this.options.crystal_drop
	map_size: 200,
	radar_zoom: 2,
	buttons_cooldown: 0.25, // must wait after x (seconds) before the same button can be triggered again
	duplicate_choose_limit: 5, // immediately close the ship menu after a single ship has been chosen x times
	killsCap: {
		start: 5, // initial cap
		seconds: 30, // increases after every <x> "judged" seconds on point, don't do 0 btw
		bonus: 3 // and increase by "bonus" each
	},
	alienSpawns: {
		level: {
			min: 1,
			max: 2
		},
		codes: [10, 11, 13, 14, 16, 17, 18],
		collectibles: [10, 11, 12, 20, 21, 41, 42, 90, 91],
		crystals: {
			min: 45,
			max: 80
		},
		interval: 5, // in seconds
		capacity: 200, // number of aliens should be on map at a time (including aliens spawned by abilities),
		distanceFromBases: 30 // avoid spawning aliens <x> radius from the outer border of bases and control points
	},
	nerd: 1, // 🤓
	x: 1 // ?
});

const CONTROL_POINT = {
	neutral_color: "#fff", // color of control point when neutral, better don't change this
	neutral_fill: "hsla(0, 0%, 0%, 0)", // this is for displaying bar point
	position: {
		x: 0,
		y: 0
	},
	size: 95, // in radius
	control_bar: {
		percentage_increase: 3.5, // percentage of control point increased/decreased for each ship
		controlling_percentage: 66, // % of control one team needs in order to be a winning team
		dominating_percentage: 90 // % of control one team needs in order to dominate and gain points
	},
	score_increase: 0.1, // team points increases per sec for the dominating team
	player_multiplier: false, // when set to true, the increase is per player per sec, and not per sec anymore
	textures: [
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/capture_area.png",
			author: "Nexagon", // it's shown nowhere on the mod, but at least a token of respect
			scale: 2.24
		}
	]
}

const BASES = {
	size: 65, // in radius
	intrusion_damage: 145, // damage per sec if enemy enters the base
	textures: [ // textures list to choose from (randomized)
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_0.png",
			author: "Nexagon", // it's shown nowhere on the mod, but at least a token of respect
			scale: 2.24
		},
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_1.png",
			author: "Nexagon",
			scale: 2.24
		},
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_2.png",
			author: "Caramel",
			scale: 2.07
		},
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_3.png",
			author: "Caramel",
			scale: 2.07
		},
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_4.png",
			author: "Caramel",
			scale: 2.07
		},
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_5.png",
			author: "Caramel",
			scale: 2.07
		},
		{
			url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_6.png",
			author: "Caramel",
			scale: 2.07
		}
	]
}

GAME_OPTIONS.required_players = Math.trunc(Math.max(GAME_OPTIONS.required_players, 2)) || 2; // restriction
CONTROL_POINT.control_bar.dominating_percentage = Math.min(Math.max(CONTROL_POINT.control_bar.controlling_percentage, CONTROL_POINT.control_bar.dominating_percentage), 100) || 100;