/* Dev's note

This code can run on any browser but fck IE

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

```js
// to initialize the Ability System (required):
AbilityManager.initialize()

// to get ship codes to put in `this.options`:
// there are 2 ways
var ships;
// first one
ships = [
	// Your other ships, you must include the 101 since ability manager won't make you one
	...AbilityManager.getShipCodes()
];

// second one, if you want some custom ships to be managed by AbilityManager
AbilityManager.addCustomShip({
	code: "JSON string",
	next: [505, "A-Speedster"] // number for static ship, string for ability ship
});

// Please note that after initialization, a value in `AbilityManager.lastModelUsage`
// indicates that all model slots from 799 down to `AbilityManager.lastModelUsage + 1` have been used up for building models for the Ability System
// Don't use any model number higher than that given value, only equal or lower.

// Note that it will initialize first if it hasn't yet

// Control the tick
this.tick = function (game) {
	AbilityManager.globalTick(game);
	// your stuff here
}

// make sure to set
//    - `game.custom.abilitySystemEnabled` to `true` 
//	  - `ship.custom.useAbilitySystem` to `true`
//    - `ship.custom.abilitySystemDisabled` to `false` (it should be by default)
// so that ship can use the abilities

// Control the event
this.event = function (event, game) {
	AbilityManager.globalEvent(event, game);
	// your stuff here
}

// Use the function above if you want to set default ship for anyone joining the game
// Ability System will check if the first joined ship fits any existing templates to assign
// Or else, it will use the default template or randomize ships if there is no default template
// or current default template is invalid
AbilityManager.setDefaultTemplate("A-Speedster");

// Additionally, there are events that you can modify their functions for your own use:
AbilityManager.onShipsListUpdate = function (team, newList, oldList) {
	// Triggers when assignable ship list on one team change
	// Parameters:
	// - team: the Team Object (same structure in Teams.js file)
	// - newList: an array of updated assignable ship names
	// - oldList: an array of previous assignable ship names
}

AbilityManager.onAbilityEnd = function (ship) {
	// Triggers when a ship ends its ability
	// Parameters:
	// - ship: the ship object
}

AbilityManager.onAbilityStart = function (ship, inAbilityBeforeStart) {
	// Triggers when a ship starts its ability
	// Parameters:
	// - ship: the ship object
}

AbilityManager.onActionBlockStateChange = function (ship) {
	// Triggers when a ship has been blocked from certain activities (using activities, changing ships)
	// Parameters:
	// - ship: the ship object
}

TeamManager.onShipTeamChange = function (ship, newTeamOBJ, oldTeamOBJ) {
	// Triggers when a ship's team has been changed
	// Parameters
	// - ship: the ship object
	// - newTeamOBJ: Team Object of the new team that ship belongs to
	// - oldTeamOBJ: Team Object of the old team before changes. Note that a `null` is expected if before given ship wasn't assigned to any teams yet (including ghost team)
}
```

4. Install NodeJS and NPM if you haven't yet
5. Open terminal/console, move to the folder in step 1 (use cd command or whatever you want)
6. Run `npm run compile main`
7. Profit

8. You might want to keep the files you've modified and replace them with original files
if you clones/pull the updates next time
9. Also if you have enough experience with Node and related stuff,
you can fck around and find out how to compile custom templates as well
*/