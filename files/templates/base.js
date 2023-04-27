/* Dev's note

When calling `HelperFunctions.setPlaneOBJ`, if you want to set angle then set rotation like this:
{ x: Math.PI, y: 0, z: -<YOUR ANGLE> }
otherwise just do { x: 0, y: 0, z: 0 }
Reason: the plane obj is from neuronality's site, and it's weird

*/

/* 

// Currently, to use the Ability System in any mod, copy codes for
// DEBUG
// ShipAbilities, AbilityManager
// RESOURCES, HelperFunctions
// Teams, TeamManager
// Maps, MapManager

// NOTE: All stuffs below should be pasted after the codes for necessary variables above

// to initialize the Ability System (required):
AbilityManager.initialize()

// to get ship codes to put in `this.options`:
this.options = {
    reset_tree: true,
    ships: [
        // Your other ships, yous must include the 101 since ability manager won't make you one
        AbilityManager.getShipCodes()
    ]
}

// Note that it will initialize first if it hasn't yet

// Control the tick
this.tick = function (game) {
    AbilityManager.globalTick(game);
    // your stuff here
}

// Control the event
this.event = function (event, game) {
    AbilityManager.globalEvent(event, game);
    // your stuff here
}

*/

/* import Config.js */

/* import Abilities.js */

/* import Commands.js */

/* import Resources.js */

/* import HelperFunctions.js */

/* import Managers.js */

/* import templates/gameLogic.js */