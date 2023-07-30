const DEBUG = true; // if in debug phase

// This is generic Ability System options only
// for Arena game options please edit in misc/GameConfig.js
const GAME_OPTIONS = {
	teams_count: 0, // you might set number of teams to 2-4 if you want to test Anomaly
	max_players: 80, // number of max players, used to define minimum ship usage limit
	map_preset_name: null, // the name of the map used in this match (e.g Genesis or Deathwing), leave null for a randomized map
	ability: {
		include_rings_on_model: false, // the individual ship's ring model inclusion are only checked if this one is `true`
		shortcut: "X", // ability activation shortcut
		ship_levels: 6, // all ship levels
		max_stats: 1e8 - 1, // maximum stats for ships
		crystals: 720, // crystals when first set, default of `abilityTemplate.crystals`
		notice: {
			show: true, // to show it or not
			timeout: 5 * 60, // time for instructor to disappear, in ticks
			message: function (ship) { // notice message function for each ships
				// this function binds to `GAME_OPTIONS` object
				return `Greetings, Commander.
Your ship is equipped with a special ability module.
Press [${this.ability.shortcut}] to activate it.`
// Capture the point in the middle to win! Stand inside the point to capture it.`
			}
		},
		usage_limit: Infinity // default usage limit of a ship in one team
		// minimum depends on number of teams, max players and number of ability ships
		// maximum Infinity, you can also omit the limit to obtain same result
		// to define different limit for a certain ship, use `usageLimit` spec in ship template
	},
	plane_3D_OBJ_Z_level: -3 // z value of 3D Plane OBJ
}

// don't remove those
GAME_OPTIONS.teams_count = Math.trunc(Math.min(Math.max(GAME_OPTIONS.teams_count, 0), 5)) || 0; // restriction
GAME_OPTIONS.max_players = Math.trunc(Math.min(Math.max(GAME_OPTIONS.max_players, 1), 240)) || 1;