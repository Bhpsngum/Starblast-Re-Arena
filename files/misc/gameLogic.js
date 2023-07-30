/* import misc/GameConfig.js */

/* import misc/Misc.js */

/* import misc/tickFunctions.js */

if (DEBUG) {
	const debug = { ...this };
	debug.tick = initialization;
	this.tick = function (game) {
		try { debug.tick(game); } catch (e) { console.error(e) }
	}
}
else this.tick = initialization;

/* import misc/eventFunction.js */

/* import misc/gameOptions.js */

/* import misc/gameInfo.js */