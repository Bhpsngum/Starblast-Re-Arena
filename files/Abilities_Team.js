const ShipAbilities = {
	"Test ship": {
		/* THIS IS AN ABILITY SHIP TEMPLATE */
		hidden: true, // set to `true` if you want the mod to ignore this ship when compiling
		models: {
			default: "JSON string",
			ability: "another JSON string"
			// something: "another string",
		},
		name: "Test ability",
		tickInterval: 20, // in ticks, defaults to 1
		duration: 690, // in ticks,
		customEndcondition: true, // if you have other conditions to end the ability other than duration time
		// omit duration time if you don't need it to end on duration
		cooldown: 120, // in ticks,
		cooldownRestartOnEnd: true, // cooldown will restart on ability end
		customInAbilityText: true, // requirementsText(ship) will show up instead of "In Ability"
		// default false, only applied when `cooldownRestartOnEnd` is set
		range: 69, // ability range for special ships, in radii

		showAbilityRangeUI: true, // show the range UI on screen
		// or it could be done with individual model like this:
		// showAbilityRangeUI: {
		//    default: true,
		//    ability: false
		// },
		includeRingOnModel: true, // to include the indicator model in ship model or not
		// please note that `AbilityManager.includeRingOnModel` must be `true` in order for this to apply
		// and you can also implement this depends on model like `showAbilityRangeUI`

		level: 7, // default ship level for all models in this template, default `GAME_OPTIONS.ability.ship_levels`

		next: ["Scorpion", "Advanced-Fighter"], // let ship upgrades to different ships (defaults to no upgrades)
		// Please note that these upgrade to the default model of the template names
		// for handling stuff for ships after upgrading, please implement `initialize(ship, upgradeFrom)` function in each template
		
		nexts: {
			// specify ship upgrades for specific models in your template
			default: ["Rock-Tower", "Barracuda"],
			ability: ["Shadow X-3", "Bastion"]
			// other modules that aren't specified here (if exists) will receive the default `next` value defined above
		},

		levels: {
			// specify ship level for specific models in your template
			ability: 10,
			default: 6.9
			// other modules that aren't specified here (if exists) will receive the default level value defined above
		},

		immovable: true, // if the ship is immune to pull/push abilities
		immovableInAbility: true, // if the ship is immune to pull/push abilities while it's on its own ability

		endOnDeath: true, // ability will end when ship dies
		canStartOnAbility: true, // allow ability to start even when on ability (to enable stacking, etc.), default false

		crystals: 500, // crystals when first set, default `GAME_OPTIONS.ability.crystals`,

		generatorInit: 69, // generator value on first set, default maximum default model's energy capacity

		useRequirementsTextWhenReady: false, // if set to `true`, ability.requirementsText will be called even when the ability is ready 

		usageLimit: 69, // Maximum number of players on one team that are allowed to use this ship
		// default `AbilityManager.usageLimit`

		abilityBlocker: {
			// block a certain ship from starting abilities
			// only include this object if needed
			checker: function (ship) { return false }, // whether the ship will be blocked or not
			clear: function (ship) { }, // clear the blocker on the ship
			reason: "Ship is being affected by this ability", // Reason
			abilityDisabledText: "DISABLED" // text shown on the ability cooldown
		},

		shipChangeBlocker: {
			// block a certain ship from changing to other ships
			// only include this object if needed
			checker: function (ship) { return false }, // whether the ship will be blocked or not
			clear: function (ship) { }, // clear the blocker on the ship
			reason: "Ship is being affected by this ability" // Reason
		},

		// additionally, declearing `actionBlocker` object will let the compiler know that
		// both `shipChangeBlocker` and `abilityBlocker` will use the `actionBlocker` object
		// Note that `actionBlocker` will override the 2 others, so please handle with care.

		// Displaying text for ability when it can't be activated (e.g "2/3 kills")
		// optional, returns cooldown time left (in seconds)
		requirementsText: function (ship) {
			return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.cooldown);
		},

		// Displaying ability name
		// optional, just the ability name
		abilityName: function (ship) {
			return this.name;
		},

		// stuff to do when init ships
		// optional, do nothing
		// upgradesFrom: the template which this ship upgrades from, `null` if none
		initialize: function (ship, upgradesFrom) {

		},

		// check if ability can start
		// optional, returns if the cooldown is over
		canStart: function (ship) {
			return !ship.custom.inAbility && HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.cooldown);
		},

		// start the ability
		// optional, set ship to ability ship (models.ability --> codes.ability)
		start: function (ship, lastAbilityStatus) {
			HelperFunctions.setInvulnerable(ship, 100);
			ship.set({type: this.codes.ability, stats: AbilityManager.maxStats, generator: 0});
		},

		// end the ability
		// optional, set ship to default ship (models.default --> codes.default)
		// Forced:
		// - [FALSE] if the ending is triggered normally (duration ends, user interaction, etc.)
		// - [TRUE] if the ending is triggered abnormally (code changes, force assignments, etc.)
		end: function (ship, forced) {
			if (ship.custom.ability === this) {
				HelperFunctions.setInvulnerable(ship, 100);
				ship.set({type: this.codes.default, stats: AbilityManager.maxStats, generator: this.generatorInit});
			}
		},

		// check if ability can end
		// optional, returns if the duration is over
		canEnd: function (ship) {
			return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.duration);
		},

		// tick function if you want to do special stuff while on duration
		// optional, do nothing
		// duration: Current duration of the ability
		tick: function (ship, duration) {

		},

		// event function if you want to do special stuff while there's an event on duration
		// optional, do nothing
		event: function (event, ship) {

		},

		// event to be executed globally (and indepently on ships)
		// optional, do nothing
		globalEvent: function (event) {

		},

		// tick function executed on (this.tick), independent with ships
		// optional, do nothing
		// Please note that this function will run before individual tick functions for ships
		globalTick: function (game) {

		},

		// functions executed before compiling this template
		// optional, do nothing
		compile: function (_this) { // _this: the `this` used in `this.options` or `this.tick`

		},

		// function used for skipping cooldown
		// optional, erase cooldown time
		reload: function (ship) {
			ship.custom.lastTriggered = game.step - this.cooldown;
		},

		// function used for restarting cooldown on ships
		// optional, recount cooldown time
		unload: function (ship) {
			ship.custom.lastTriggered = game.step;
		},

		// function used when the code changes (this should only happen on Mod Editor)
		// optional, do nothing
		// newTemplate: that new ship template after code changes, `null` if the template is removed on new code
		// Note: this function runs after initial compilation (ships and templates compilation)
		onCodeChange: function (newTemplate) {

		},

		// function used to get the current default ship code of the given ship using this template
		// this is used for ships with 2 or more independent states like Vulcan and Viking, as neither of those states is called "ability state"
		// optional, return the default model's code
		getDefaultShipCode: function (ship) {
			return this.codes.default
		}
	},
	"Fly": {
		models: {
			default: '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}',
			ability: '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[400,600],"reload":[100,150]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[400,600],"reload":[100,150]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}'
		},

		level: 1,
		
		next: ["Trident"],
		nexts: {
			ability: ["Delta-Fighter"]
		},

		name: "Up?",
		duration: 5 * 60,
		cooldown: 5 * 60
	},
	"Trident": {
		models: {
			default: '{"name":"Trident","level":2,"model":2,"size":1.2,"specs":{"shield":{"capacity":[125,175],"reload":[3,5]},"generator":{"capacity":[50,80],"reload":[15,20]},"ship":{"mass":100,"speed":[110,135],"rotation":[70,85],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-100,-50,0,30,70,100,90],"z":[0,0,0,0,0,0,0]},"width":[1,25,15,30,30,20,10],"height":[1,20,20,30,30,10,0],"texture":[1,1,10,2,3],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,30,40],"z":[0,0,0,0,0]},"width":[0,10,10,10,0],"height":[0,10,15,12,0],"texture":[9],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":50,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"laser":{"damage":[4,8],"rate":2.5,"type":1,"speed":[100,120],"number":1,"angle":0,"error":0},"propeller":false,"texture":[4,4,10,4,63,4]}},"wings":{"main":{"offset":{"x":0,"y":60,"z":0},"length":[80,30],"width":[70,50,60],"texture":[4,63],"angle":[0,0],"position":[10,-20,-50],"bump":{"position":-10,"size":15}},"winglets":{"length":[30,20],"width":[10,30,0],"angle":[50,20],"position":[90,80,50],"texture":[63],"bump":{"position":10,"size":30},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Trident","level":2,"model":2,"code":202,"specs":{"shield":{"capacity":[125,175],"reload":[3,5]},"generator":{"capacity":[50,80],"reload":[15,20]},"ship":{"mass":100,"speed":[110,135],"rotation":[70,85],"acceleration":[90,110]}},"shape":[2.4,2.164,1.784,1.529,1.366,0.981,0.736,0.601,0.516,0.457,0.415,2.683,2.66,2.66,2.724,2.804,2.763,2.605,2.502,2.401,2.596,2.589,2.426,2.448,2.443,2.52,2.443,2.448,2.426,2.589,2.596,2.401,2.502,2.605,2.763,2.804,2.724,2.66,2.66,2.683,0.415,0.457,0.516,0.601,0.736,0.981,1.366,1.529,1.784,2.164],"lasers":[{"x":1.2,"y":-0.24,"z":0,"angle":0,"damage":[4,8],"rate":2.5,"type":1,"speed":[100,120],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.2,"y":-0.24,"z":0,"angle":0,"damage":[4,8],"rate":2.5,"type":1,"speed":[100,120],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.804}}',
			ability: '{"name":"Trident","level":2,"model":2,"size":1.2,"specs":{"shield":{"capacity":[125,175],"reload":[3,5]},"generator":{"capacity":[500,800],"reload":[150,200]},"ship":{"mass":100,"speed":[110,135],"rotation":[70,85],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-100,-50,0,30,70,100,90],"z":[0,0,0,0,0,0,0]},"width":[1,25,15,30,30,20,10],"height":[1,20,20,30,30,10,0],"texture":[1,1,10,2,3],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,30,40],"z":[0,0,0,0,0]},"width":[0,10,10,10,0],"height":[0,10,15,12,0],"texture":[9],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":50,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"laser":{"damage":[4,8],"rate":2.5,"type":1,"speed":[100,120],"number":1,"angle":0,"error":0},"propeller":false,"texture":[4,4,10,4,63,4]}},"wings":{"main":{"offset":{"x":0,"y":60,"z":0},"length":[80,30],"width":[70,50,60],"texture":[4,63],"angle":[0,0],"position":[10,-20,-50],"bump":{"position":-10,"size":15}},"winglets":{"length":[30,20],"width":[10,30,0],"angle":[50,20],"position":[90,80,50],"texture":[63],"bump":{"position":10,"size":30},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Trident","level":2,"model":2,"code":202,"specs":{"shield":{"capacity":[125,175],"reload":[3,5]},"generator":{"capacity":[500,800],"reload":[150,200]},"ship":{"mass":100,"speed":[110,135],"rotation":[70,85],"acceleration":[90,110]}},"shape":[2.4,2.164,1.784,1.529,1.366,0.981,0.736,0.601,0.516,0.457,0.415,2.683,2.66,2.66,2.724,2.804,2.763,2.605,2.502,2.401,2.596,2.589,2.426,2.448,2.443,2.52,2.443,2.448,2.426,2.589,2.596,2.401,2.502,2.605,2.763,2.804,2.724,2.66,2.66,2.683,0.415,0.457,0.516,0.601,0.736,0.981,1.366,1.529,1.784,2.164],"lasers":[{"x":1.2,"y":-0.24,"z":0,"angle":0,"damage":[4,8],"rate":2.5,"type":1,"speed":[100,120],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.2,"y":-0.24,"z":0,"angle":0,"damage":[4,8],"rate":2.5,"type":1,"speed":[100,120],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.804}}'
		},

		level: 2,
		
		name: "Trial",
		duration: 5 * 60,
		cooldown: 5 * 60
	},
	"Delta-Fighter": {
		models: {
			default: '{"name":"Delta-Fighter","level":2,"model":1,"size":1.3,"specs":{"shield":{"capacity":[100,150],"reload":[3,4]},"generator":{"capacity":[50,80],"reload":[15,25]},"ship":{"mass":80,"speed":[110,135],"rotation":[80,100],"acceleration":[110,120]}},"bodies":{"cockpit":{"angle":0,"section_segments":8,"offset":{"x":0,"y":-20,"z":12},"position":{"x":[0,0,0,0,0],"y":[-20,-10,0,10,20],"z":[-7,-3,0,5,3]},"width":[3,12,18,16,3],"height":[3,6,8,6,3],"texture":[9]},"cockpit2":{"angle":0,"section_segments":8,"offset":{"x":0,"y":-10,"z":12},"position":{"x":[0,0,0,0],"y":[-10,0,10,40],"z":[0,0,5,3]},"width":[5,18,16,3],"height":[5,12,10,5],"texture":[9,2,11]},"propulsor":{"section_segments":8,"offset":{"x":0,"y":35,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[0,10,20,30,40,30],"z":[0,0,0,0,0]},"width":[5,15,10,10,10,0],"height":[15,15,15,15,10,0],"texture":[63,63,4,5,12],"propeller":true},"bumps":{"section_segments":8,"offset":{"x":40,"y":40,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-40,-10,0,10,40,45],"z":[0,0,0,0,0,0]},"width":[0,5,8,12,5,0],"height":[0,25,28,22,15,0],"texture":[63]},"gunsupport":{"section_segments":8,"offset":{"x":30,"y":-40,"z":5},"position":{"x":[-30,-20,-10,0,0,0],"y":[-20,-15,-5,10,40,55],"z":[-20,-20,-10,0,0,0]},"width":[3,5,8,4,5,0],"height":[3,5,8,12,15,0],"texture":63},"gun":{"section_segments":8,"offset":{"x":0,"y":-60,"z":-15},"position":{"x":[0,0,0,0],"y":[-20,-10,5,10],"z":[0,0,0,0]},"width":[3,7,8,3],"height":[3,7,8,3],"texture":[6,4,5],"laser":{"damage":[3,5],"rate":3,"type":1,"speed":[100,120],"number":3,"angle":15,"error":0}}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":-25,"z":5},"length":[100],"width":[120,30,40],"angle":[0,20],"position":[30,90,85],"texture":11,"bump":{"position":30,"size":20}}},"typespec":{"name":"Delta-Fighter","level":2,"model":1,"code":201,"specs":{"shield":{"capacity":[100,150],"reload":[3,4]},"generator":{"capacity":[50,80],"reload":[15,25]},"ship":{"mass":80,"speed":[110,135],"rotation":[80,100],"acceleration":[110,120]}},"shape":[2.081,1.969,1.501,1.455,1.403,1.368,1.263,1.192,1.095,1.063,1.128,1.209,1.352,1.545,1.85,2.348,2.965,3.211,3.33,2.93,2.496,2.442,2.441,1.866,1.967,1.954,1.967,1.866,2.441,2.442,2.496,2.93,3.33,3.211,2.965,2.348,1.85,1.545,1.352,1.209,1.128,1.063,1.095,1.192,1.263,1.368,1.403,1.455,1.501,1.969],"lasers":[{"x":0,"y":-2.08,"z":-0.39,"angle":0,"damage":[3,5],"rate":3,"type":1,"speed":[100,120],"number":3,"spread":15,"error":0,"recoil":0}],"radius":3.33}}',
			ability: '{"name":"Delta-Fighter","level":2,"model":1,"size":1.3,"specs":{"shield":{"capacity":[100,150],"reload":[3,4]},"generator":{"capacity":[500,800],"reload":[150,250]},"ship":{"mass":80,"speed":[110,135],"rotation":[80,100],"acceleration":[110,120]}},"bodies":{"cockpit":{"angle":0,"section_segments":8,"offset":{"x":0,"y":-20,"z":12},"position":{"x":[0,0,0,0,0],"y":[-20,-10,0,10,20],"z":[-7,-3,0,5,3]},"width":[3,12,18,16,3],"height":[3,6,8,6,3],"texture":[9]},"cockpit2":{"angle":0,"section_segments":8,"offset":{"x":0,"y":-10,"z":12},"position":{"x":[0,0,0,0],"y":[-10,0,10,40],"z":[0,0,5,3]},"width":[5,18,16,3],"height":[5,12,10,5],"texture":[9,2,11]},"propulsor":{"section_segments":8,"offset":{"x":0,"y":35,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[0,10,20,30,40,30],"z":[0,0,0,0,0]},"width":[5,15,10,10,10,0],"height":[15,15,15,15,10,0],"texture":[63,63,4,5,12],"propeller":true},"bumps":{"section_segments":8,"offset":{"x":40,"y":40,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-40,-10,0,10,40,45],"z":[0,0,0,0,0,0]},"width":[0,5,8,12,5,0],"height":[0,25,28,22,15,0],"texture":[63]},"gunsupport":{"section_segments":8,"offset":{"x":30,"y":-40,"z":5},"position":{"x":[-30,-20,-10,0,0,0],"y":[-20,-15,-5,10,40,55],"z":[-20,-20,-10,0,0,0]},"width":[3,5,8,4,5,0],"height":[3,5,8,12,15,0],"texture":63},"gun":{"section_segments":8,"offset":{"x":0,"y":-60,"z":-15},"position":{"x":[0,0,0,0],"y":[-20,-10,5,10],"z":[0,0,0,0]},"width":[3,7,8,3],"height":[3,7,8,3],"texture":[6,4,5],"laser":{"damage":[3,5],"rate":3,"type":1,"speed":[100,120],"number":3,"angle":15,"error":0}}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":-25,"z":5},"length":[100],"width":[120,30,40],"angle":[0,20],"position":[30,90,85],"texture":11,"bump":{"position":30,"size":20}}},"typespec":{"name":"Delta-Fighter","level":2,"model":1,"code":201,"specs":{"shield":{"capacity":[100,150],"reload":[3,4]},"generator":{"capacity":[500,800],"reload":[150,250]},"ship":{"mass":80,"speed":[110,135],"rotation":[80,100],"acceleration":[110,120]}},"shape":[2.081,1.969,1.501,1.455,1.403,1.368,1.263,1.192,1.095,1.063,1.128,1.209,1.352,1.545,1.85,2.348,2.965,3.211,3.33,2.93,2.496,2.442,2.441,1.866,1.967,1.954,1.967,1.866,2.441,2.442,2.496,2.93,3.33,3.211,2.965,2.348,1.85,1.545,1.352,1.209,1.128,1.063,1.095,1.192,1.263,1.368,1.403,1.455,1.501,1.969],"lasers":[{"x":0,"y":-2.08,"z":-0.39,"angle":0,"damage":[3,5],"rate":3,"type":1,"speed":[100,120],"number":3,"spread":15,"error":0,"recoil":0}],"radius":3.33}}'
		},

		level: 2,
		
		name: "Delta",
		duration: 5 * 60,
		cooldown: 5 * 60
	},
};