const DEBUG = true; // if in debug phase

// This is generic Ability System options only
// for Arena game options please edit in misc/GameConfig.js
const GAME_OPTIONS = {
	teams_count: 4, // number of teams
	max_players: 200, // number of max players, used to define minimum ship usage limit
	map_preset_name: null, // the name of the map used in this match (e.g Genesis or Deathwing), leave null for a randomized map
	ability: {
		include_rings_on_model: false, // the individual ship's ring model inclusion are only checked if this one is `true`
		shortcut: "X", // ability activation shortcut
		switchShortcut: [String.fromCharCode(220), "\\"], // switch from clickable ability UI to unclickable (only responds to shortcut)
		// first member, actual shortcut, second member shortcut shown as text (if those 2 are different from each other)
		ship_levels: 6, // all ship levels
		max_stats: 1e8 - 1, // maximum stats for ships
		crystals: 720, // crystals when first set, default of `abilityTemplate.crystals`
		notice: {
			show: true, // to show it or not
			timeout: 10 * 60, // time for instructor to disappear, in ticks
			message: function (ship) { // notice message function for each ships
				// this function binds to `GAME_OPTIONS` object
				return `Greetings, Commander.
Your ship is equipped with a special ability module.
Press [${this.ability.shortcut}] to activate it.
Capture the objective and get ${this.points} points to win. Good luck!`
			}
		},
		usage_limit: 3 // default usage limit of a ship in one team
		// minimum 1, maximum Infinity, you can also omit the limit to obtain same result
		// to define different limit for a certain ship, use `usageLimit` spec in ship template
		// please tune the usage limits so total usages will exceed max players, otherwise the mod may not function properly
	},
	plane_3D_OBJ_Z_level: -3 // z value of 3D Plane OBJ
}

// don't remove those
GAME_OPTIONS.teams_count = Math.trunc(Math.min(Math.max(GAME_OPTIONS.teams_count, 0), 5)) || 0; // restriction
GAME_OPTIONS.max_players = Math.trunc(Math.min(Math.max(GAME_OPTIONS.max_players, 1), 240)) || 1;

if (!Array.isArray(GAME_OPTIONS.ability.shortcut)) GAME_OPTIONS.ability.shortcut = Array(2).fill(GAME_OPTIONS.ability.shortcut);
if (!Array.isArray(GAME_OPTIONS.ability.switchShortcut)) GAME_OPTIONS.ability.switchShortcut = Array(2).fill(GAME_OPTIONS.ability.switchShortcut);