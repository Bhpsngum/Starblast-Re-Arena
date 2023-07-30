/* import Notes.js notimestamp */

/* import Config_Battlefield.js */

/* import Teams_Battlefield.js */

/* import Maps_Battlefield.js */

/* import Abilities.js */

/* import Commands.js */

/* import Resources.js */

/* import HelperFunctions.js */

/* import Managers.js */

/* import misc/GameConfig_Battlefield.js */

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