/* import Notes.js notimestamp */

/* import Config_Team.js */

/* import Teams.js */

/* import Maps_ShipTesting.js */

/* import Abilities_Team.js */

/* import Commands.js */

/* import Resources.js */

/* import HelperFunctions.js */

/* import Managers.js */

const x = 10; // x

game.custom.abilitySystemEnabled = true;

AbilityManager.setDefaultShip("Fly");

this.tick = function (game) {
	AbilityManager.globalTick(game);
	for (let ship of game.ships) {
		if (ship.id == null) continue;
		if (!ship.custom.joined) {
			if (ship.type == 101 || ship.type > AbilityManager.lastModelUsage) ship.custom.useAbilitySystem = true;
			ship.custom.joined = true;
		}
	}
}

this.event = function (event, game) {
	AbilityManager.globalEvent(event, game);
}

AbilityManager.addCustomShip({
	code: '{"name":"Pulse-Fighter","level":3,"model":1,"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":120,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-50,0,50,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,15,25,30,35,20,0],"height":[0,10,15,25,25,20,0],"propeller":true,"texture":[63,1,1,10,2,12]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"cannon":{"section_segments":6,"offset":{"x":0,"y":-40,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":3},"deco":{"section_segments":8,"offset":{"x":50,"y":50,"z":-10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":4}},"wings":{"main":{"length":[80,20],"width":[120,50,40],"angle":[-10,20],"position":[30,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":0,"y":0,"z":0}},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-40,-60,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}},"stab":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Pulse-Fighter","level":3,"model":1,"code":301,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":120,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.343,2.204,1.998,1.955,2.088,1.91,1.085,0.974,0.895,0.842,0.829,0.95,1.429,2.556,2.618,2.726,2.851,2.837,2.825,2.828,2.667,2.742,2.553,2.766,2.779,2.735,2.779,2.766,2.553,2.742,2.667,2.828,2.825,2.837,2.851,2.726,2.618,2.556,1.43,0.95,0.829,0.842,0.895,0.974,1.085,1.91,2.088,1.955,1.998,2.204],"lasers":[{"x":0,"y":-2.34,"z":-0.26,"angle":0,"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.851}}',
	next: [401, "X-Warrior"]
});

let shipCodes = AbilityManager.getShipCodes();

if (AbilityManager.lastModelUsage >= 101) {
	let ship101 = JSON.parse(HelperFunctions.randInt(x) ? '{"name":"I\'m Ready!","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"I\'m Ready!","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}' : '{"name":"I\'m Ready!","designer":"Supernova","level":1,"model":1,"size":1,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":90,"speed":[100,120],"rotation":[50,70],"acceleration":[100,130]}},"bodies":{"ring":{"section_segments":100,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[80,100,100,100,100,100,100,80],"height":[80,100,100,100,100,100,100,80],"texture":63,"propeller":false,"vertical":true},"spike1":{"section_segments":4,"offset":{"x":-73,"y":-65,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,0,20,50],"z":[0,0,0]},"width":[0,20,20,0],"height":[0,10,10,0],"texture":[1],"angle":46,"propeller":false},"spike2":{"section_segments":4,"offset":{"x":-57,"y":53,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,0,20,50],"z":[0,0,0]},"width":[0,20,20,0],"height":[0,10,10,0],"texture":[1],"angle":-46,"propeller":false},"x_1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":0},"position":{"x":[-18,-18,18,18],"y":[-20,-20,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[1]},"x_2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":0},"position":{"x":[18,18,-18,-18],"y":[-20,-20,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[1]}},"typespec":{"name":"I\'m Ready!","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":90,"speed":[100,120],"rotation":[50,70],"acceleration":[100,130]}},"shape":[2,2,2,2,2,2.093,2.481,2.555,2.227,2,2,2,2,2,2,2,2,2.164,2.545,2.557,2.162,2,2,2,2,2,2,2,2,2,2.162,2.557,2.545,2.164,2,2,2,2,2,2,2,2,2.227,2.555,2.481,2.093,2,2,2,2],"lasers":[],"radius":2.557}}');

	for (let val of [ship101, ship101.typespec]) {
		val.specs.generator = {
			capacity: [1e-300, 1e-300],
			reload: [1e-300, 1e-300]
		}
		val.specs.ship = {
			mass: 1,
			acceleration: [1e-300, 1e-300],
			speed: [1e-300, 1e-300],
			rotation: [1e-300, 1e-300]
		}
	}

	ship101.typespec.lasers = [];

	shipCodes.push(JSON.stringify(ship101));
}

this.options = {
	reset_tree: false,
	root_mode: "team",
	ships: shipCodes
}