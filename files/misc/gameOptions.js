const vocabulary = [
    { text: "Heal", icon:"\u0038", key:"H" }, // heal my pods?
    { text: "Me", icon:"\u004f", key:"E" },
    { text: "Point", icon:"\u002a", key:"B" },
    { text: "Regroup", icon:"\u0031", key:"T" },
    { text: "Wait", icon:"\u0048", key:"W" },
    { text: "Yes", icon:"\u004c", key:"Y" },
    { text: "No", icon:"\u004d", key:"N" },
    { text: "Sorry", icon:"\u00a1", key:"S" },
    { text: "Attack", icon:"\u0049", key:"A" },
    { text: "Follow Me", icon:"\u0050", key:"F" },
    { text: "Good Game", icon:"\u00a3", key:"G" },
    { text: "Bruh", icon:"\u{1F480}", key:"I" },
    { text: "Ability", icon:"\u0028", key:"J" },
    { text: "Hmm???", icon:"\u004b", key:"Q" },
    //{ text: "No Problem", icon:"\u0047", key:"P" },
    { text: "Defend", icon:"\u0025", key:"D" },
    { text: " ", icon:"\u{1F913}", key:"L" }
];

this.options = {
    reset_tree: true,
    map_name,
    max_level: 1,
    starting_ship: 800,
    vocabulary,
    speed_mod: 1.2,
    radar_zoom: GAME_OPTIONS.radar_zoom,
    weapons_store: false,
    crystal_value: 0,
    crystal_drop: GAME_OPTIONS.crystal_drop,
    asteroids_strength: 2,
    soundtrack: "crystals.mp3", //civilisation.mp3 | procedurality.mp3 | argon.mp3 | crystals.mp3
    healing_ratio: GAME_OPTIONS.healing_ratio, // better to set the ability ship's damage rather than setting this option
    mines_self_destroy: true,
    mines_destroy_delay: 5000,
    map_size: GAME_OPTIONS.map_size,
    release_crystal: true,
    ships: [
        HelperFunctions.randInt(GAME_OPTIONS.x) ? '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}' : '{"name":"__Arena_Mod_Icon__","designer":"Supernova","level":1,"model":1,"size":1,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":90,"speed":[100,120],"rotation":[50,70],"acceleration":[100,130]}},"bodies":{"ring":{"section_segments":100,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[80,100,100,100,100,100,100,80],"height":[80,100,100,100,100,100,100,80],"texture":63,"propeller":false,"vertical":true},"spike1":{"section_segments":4,"offset":{"x":-73,"y":-65,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,0,20,50],"z":[0,0,0]},"width":[0,20,20,0],"height":[0,10,10,0],"texture":[1],"angle":46,"propeller":false},"spike2":{"section_segments":4,"offset":{"x":-57,"y":53,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,0,20,50],"z":[0,0,0]},"width":[0,20,20,0],"height":[0,10,10,0],"texture":[1],"angle":-46,"propeller":false},"x_1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":0},"position":{"x":[-18,-18,18,18],"y":[-20,-20,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[1]},"x_2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":0,"z":0},"position":{"x":[18,18,-18,-18],"y":[-20,-20,20,20],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[1]}},"typespec":{"name":"__Arena_Mod_Icon__","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":90,"speed":[100,120],"rotation":[50,70],"acceleration":[100,130]}},"shape":[2,2,2,2,2,2.093,2.481,2.555,2.227,2,2,2,2,2,2,2,2,2.164,2.545,2.557,2.162,2,2,2,2,2,2,2,2,2,2.162,2.557,2.545,2.164,2,2,2,2,2,2,2,2,2.227,2.555,2.481,2.093,2,2,2,2],"lasers":[],"radius":2.557}}',
        ...AbilityManager.getShipCodes()
    ]
}

let ship101 = JSON.parse(this.options.ships[0]);

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

this.options.ships[0] = JSON.stringify(ship101);