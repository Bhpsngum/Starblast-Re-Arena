/* import Notes.js notimestamp */

/* import Config_ShipTesting.js */

/* import Teams.js */

/* import Maps.js */

/* import Abilities.js */

/* import Commands.js */

/* import Resources.js */

/* import HelperFunctions.js */

/* import Managers.js */

const updateUI = function (ship) {
    HelperFunctions.sendUI(ship, {
        id: "debug_test",
        position: [25,0,50,10],
        clickable: false,
        visible: true,
        components: [
            {type: "text", position: [0,0,100,50], value: "[D]: Random ship, [F]: Skip cooldown, [G]: Previous ship, [H]: Next ship", color: "#FFF"},
            {type: "text", position: [0,50,100,50], value: `Current ship: ${ship.custom.shipName}`, color: "#FFF"}
        ]
    });
}

game.custom.abilitySystemEnabled = true;

this.tick = function (game) {
    AbilityManager.globalTick(game);
    for (let ship of game.ships) {
        if (ship.id == null) continue;
        if (!ship.custom.joined) {
            updateUI(ship);
            for (let keys of [
                ["random", "D"],
                ["reload", "F"],
                ["prev", "G"],
                ["next", "H"]
            ]) HelperFunctions.sendUI(ship, {
                id: keys[0],
                position: [0,0,0,0],
                clickable: true,
                visible: true,
                shortcut: keys[1]
            });
            ship.custom.joined = true;
        }
    }
}

this.event = function (event, game) {
    AbilityManager.globalEvent(event, game);
    let ship = event.ship;
    if (ship == null || ship.id == null) return;
    switch (event.name) {
        case "ui_component_clicked":
            let component = event.id;
            switch (component) {
                case "random":
                    AbilityManager.random(ship);
                    break;
                case "next": {
                    let pos = AbilityManager.ships_list.indexOf(ship.custom.shipName) + 1;
                    AbilityManager.assign(ship, AbilityManager.ships_list[pos] || AbilityManager.ships_list[0]);
                    break;
                }
                case "prev": {
                    let pos = AbilityManager.ships_list.lastIndexOf(ship.custom.shipName) - 1;
                    AbilityManager.assign(ship, AbilityManager.ships_list.at(pos));
                    break;
                }
                case "reload":
                    AbilityManager.reload(ship);
                    break;
            }
            updateUI(ship);
            break;
    }
}

this.options = {
    reset_tree: true,
    max_level: 1,
    weapons_store: false,
    starting_ship: 800,
    ships: [
        '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}',
        ...AbilityManager.getShipCodes()
    ]
}