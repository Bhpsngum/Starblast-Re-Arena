/* Dev's note

When calling `HelperFunctions.setPlaneOBJ`, if you want to set angle then set rotation like this:
{ x: Math.PI, y: 0, z: -<YOUR ANGLE> }
otherwise just do { x: 0, y: 0, z: 0 }
Reason: the plane obj is from neuronality's site, and it's weird

*/

/*
Currently, to use the Ability System (which is bundled with TeamManager and MapManager) in any mod:

1. Clone this Repository to your machine and navigate to that folder
2. Tune the files inside the "files" directory by your choice
The files below are recommended and better don't touch other files unless you know what you're doing
    - Config.js
    - Abilities.js
    - Maps.js
    - Teams.js
    - Commands.js (if you understand it, or else don't)

3. Paste your current's mod code in the templates/gameLogic.js file
Consider the things below:

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

// make sure to set `game.custom.started` to `true` so that ships can use the abilities

// Control the event
this.event = function (event, game) {
    AbilityManager.globalEvent(event, game);
    // your stuff here
}

4. Install NodeJS if you haven't yet
5. Open terminal/console, move to the folder in step 1 (use cd command or whatever you want)
6. Run `node mergeFile.js`
7. Profit

8. You might want to keep the files you've modified and replace them with original files
if you clones/pull the updates next time
*/

/* import Config.js */

/* import Abilities.js */

/* import Commands.js */

/* import Resources.js */

/* import HelperFunctions.js */

/* import Managers.js */

/* import templates/gameLogic.js */