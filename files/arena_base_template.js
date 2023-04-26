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

GAME_OPTIONS.required_players = Math.max(GAME_OPTIONS.required_players, 2) || 2; // restriction
GAME_OPTIONS.teams_count = Math.min(Math.max(GAME_OPTIONS.teams_count, 0), 5) || 0; // restriction
CONTROL_POINT.control_bar.dominating_percentage = Math.min(Math.max(CONTROL_POINT.control_bar.controlling_percentage, CONTROL_POINT.control_bar.dominating_percentage), 100) || 100;

/* import Abilities.js */

const RESOURCES = {
    planeOBJ: "https://starblast.data.neuronality.com/mods/objects/plane.obj"
}

const HelperFunctions = {
    toHSLA: function (hue = 0, alpha = 1, saturation = 100, lightness = 50) {
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
    },
    getObjectID: function (id) {
        // return ability manager-specific id name (to prevent id duplication from other special IDs)
        return "__ABILITY_MANAGER_" + String(id) + "__"
    },
    setObject: function (specs) {
        specs = { ...specs };
        specs.id = this.getObjectID(specs.id);
        if (specs.type != null) specs.type.id = this.getObjectID(specs.type.id);
        game.setObject(specs);
    },
    removeObject: function (id) {
        // remove objects without leaving traces (client issues)
        this.setObject({
            id,
            position: { x:0, y: 0, z: Number.MAX_VALUE },
            rotation: { x:0, y: 0, z: 0 },
            scale: { x:0, y:0, z:0 },
            type: {
                id,
            }
        });
        game.removeObject(this.getObjectID(id));
    },
    setPlaneOBJ: function (options) {
        options = options || {};
        this.setObject({
            ...options,
            type: {
                ...(options.type || {}),
                obj: RESOURCES.planeOBJ
            }
        })
    },
    fromMapUnitToShipModelUnit: function (value, size) {
        // convert map unit to ship model unit
        return value * AbilityManager.model_conversion_ratio / size;
    },
    clone: function (obj) {
        // clone JSON-parseable object
        return JSON.parse(JSON.stringify(obj));
    },
    timeExceeded: function (timestamp, duration) {
        return game.step > (duration + timestamp);
    },
    timeLeft: function (timestamp) {
        return Math.max(Math.ceil((timestamp - game.step) / 60), 0);
    },
    randInt: function (num) {
        return Math.floor(Math.random() * num);
    },
    randIntInRange: function (start, end) {
        // random x with start <= x < end
        return this.randInt(end - start) + start;  
    },
    spawnCollectibles: function (ship, codes) {
        // spawn collectilble under ship
        for (let i of codes) game.addCollectible({
            x: ship.x,
            y: ship.y,
            code: i
        })
    },
    randomItem: function (list, removeItemAfterRandom = false) {
        if (list.length < 1) return { index: -1, value: null };
        let index = this.randInt(list.length);
        return {
            index,
            value: removeItemAfterRandom ? list.splice(index, 1)[0] : list[index]
        }
    },
    isTeam: function (ship1, ship2) {
        // check if ship2 is on the same team with ship1
        return !TeamManager.getData(ship1.team).ghost && ship2.team == ship1.team;
    },
    simpleDistance: function (ship = {x: 0, y: 0}, target = {x: 0, y: 0}) {
        // @description simple distance function, just regular math
        return Math.sqrt((target.x - ship.x) ** 2 + (target.y - ship.y) ** 2);
    },
    distance: function(ship = {x: 0, y: 0}, target = {x: 0, y: 0}) {
        const mapsize_xy = game.options.map_size * 10;
        
        const x_diff = ship.x - target.x;
        const y_diff = ship.y - target.y;

        /* jshint ignore:start */
        const x_plus_mapsize = x_diff + mapsize_xy;
        const x_minus_mapsize = x_diff - mapsize_xy;

        const y_plus_mapsize = y_diff + mapsize_xy;
        const y_minus_mapsize = y_diff - mapsize_xy;
        /* jshint ignore:end */

        const d = [
            [x_diff, y_diff],
            [x_diff, y_plus_mapsize],
            [x_diff, y_minus_mapsize],
            [x_plus_mapsize, y_diff],
            [x_minus_mapsize, y_diff],
            [x_plus_mapsize, y_plus_mapsize],
            [x_plus_mapsize, y_minus_mapsize],
            [x_minus_mapsize, y_plus_mapsize],
            [x_minus_mapsize, y_minus_mapsize]
        ];

        let shortestPath, shortestAngle;
        for (let point of d) {
            let path = Math.sqrt(point[0] ** 2 + point[1] ** 2);
            let angle = Math.atan2(point[1], point[0]);

            if (shortestPath == null || shortestPath > path) {
                shortestPath = path;
                shortestAngle = angle;
            }
        }

        return {
            distance: shortestPath,
            angle: shortestAngle
        }
    },
    accelerate: function (ship, speed, angle = null) {
        // accelerate ship with speed and angle (or ship angle)
        if (angle == null) angle = ship.r;
        ship.set({
            vx: speed * Math.cos(angle),
            vy: speed * Math.sin(angle)
        });
    },
    accelerateToTarget: function (ship, target, strength, push = false) {
        // accelerate ship from/to target with strength
        // push: `true` is push, otherwise pull
        let accelAngle = this.distance(target, ship).angle;
        if (push) accelAngle += Math.PI;
        this.accelerate(ship, strength, accelAngle);
    },
    satisfies: function (ship1, ship2, teammate, enemy) {
        // check if ship statisfies condition
        if (teammate && enemy) return true;
        if (teammate && this.isTeam(ship1, ship2)) return true;
        if (enemy && !this.isTeam(ship1, ship2)) return true;
        return false;
    },
    findEntitiesInRange: function (ship, range, teammate = false, enemy = false, alien = false, asteroid = false, dontSort = false) {
        // find all entities in range, set `donSort` to `true` if you want it to ignore the sorting
        let data = [];
        if (alien) data.push(...game.aliens.filter(al => this.distance(ship, al).distance <= range));
        if (asteroid) data.push(...game.asteroids.filter(al => this.distance(ship, al).distance <= range));
        if (teammate || enemy) data.push(...game.ships.filter(e => e !== ship && e.alive && !e.custom.spectator && this.satisfies(ship, e, teammate, enemy) && this.distance(ship, e).distance <= range));
        if (dontSort) return data;
        return data.sort((a, b) => this.dist(ship, a) - this.dist(ship, b));
    },
    damage: function (ship,num) {
        // damage ship by `num` HP
        if (ship.shield < num){
          let val = ship.crystals + ship.shield;
          if (val < num) ship.set({kill:true});
          else ship.set({crystals: val - num, shield: 0});
        }
        else ship.set({shield:ship.shield-num});
    },
    parseUI: function (UI) {
        try { UI = new Object(JSON.parse(JSON.stringify(UI))) } catch (e) { UI = {} }
      
        let id;
        try { id = String(UI.id) } catch (e) { id = '' }
      
        let parsedUI = {
          id: id,
          position: UI.position,
          visible: UI.visible,
          clickable: UI.clickable,
          shortcut: UI.shortcut,
          components: UI.components
        }
      
        if (parsedUI.visible || parsedUI.visible == null) {
          delete parsedUI.visible;
          let position = parsedUI.position, count = 0;
          for (let i = 0 ; i < 4 ; i++) {
            let pos = (position||{})[i];
            if (pos == null || pos == 100) count++
          }
          if (count == 4) delete parsedUI.position
        }
        else {
          parsedUI.position = [0,0,0,0];
          parsedUI.visible = false;
          delete parsedUI.components
        }
      
        if (!parsedUI.clickable) {
          delete parsedUI.clickable;
          delete parsedUI.shortcut
        }
      
        return parsedUI
    },
    sendUI: function (ship, UI) {
        if (ship != null && "function" == typeof ship.setUIComponent) ship.setUIComponent(this.parseUI(UI));
    },
    TimeManager: {
        id_pool: 0,
        setTimeout: function(f,time){
            let id = this.id_pool++;
            this.jobs.set(id, {f: f,time: game.step+time});
            return id;
        },
        clearTimeout: function (id) {
            this.jobs.delete(id);
        },
        jobs: new Map(),
        tick: function() {
          var t = game.step;
          for (let i of this.jobs){
            var job = i[1];
            if (t>=job.time){
              try {
                job.f();
              }
              catch (err){
                console.error(err);
              }
              this.jobs.delete(i[0]);
            }
          }
        }
    },
    fill: function (text, limit) {
        // fill text with whitespaces until limit
        let charLeft = limit - text.length;
        if (charLeft <= 0) return text;
        return " ".repeat(Math.floor(charLeft / 2)) + text + " ".repeat(Math.ceil(charLeft / 2));
    },
    templates: {
        canStart: function (ship) {
            return !ship.custom.inAbility && HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.cooldown);
        },

        canEnd: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.duration);
        },

        start: function (ship) {
            ship.set({invulnerable: 100, type: this.codes.ability, stats: AbilityManager.maxStats, generator: 0});
        },

        end: function (ship) {
            if (ship.custom.ability === this) ship.set({invulnerable: 100, type: this.codes.default, stats: AbilityManager.maxStats, generator: this.generatorInit});
        },

        tick: function () {},

        initialize: function () {},

        event: function (event, ship) {
            if (event.name == "ship_destroyed" && event.ship == ship && this.endOnDeath) AbilityManager.end(ship);
        },

        requirementsText: function (ship) {
            return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.cooldown);
        },

        abilityName: function (ship) {
            return this.name;
        },

        reload: function (ship) {
            ship.custom.lastTriggered = game.step - this.cooldown;
        }
    },
    terminal: {
        errors: 0,
        log: function (text) {
            AbilityManager.echo(`[[bg;azure;][AbilityCompiler\\] ${text}]\n`);
        },
        error: function (text) {
            ++this.errors;
            AbilityManager.echo(`[[bg;#FF7733;][AbilityCompiler\\] ${text}]\n`);
        }
    },
    // properties after this line are functions needed by the game
    // remove them if you only need the ability manager
    sendWaitingText: function (ship) {
        this.sendUI(ship, {
            id: "waiting_text",
            position: [40, 20, 20, 10],
            components: [
                { type: "text", position: [0, 0, 100, 50], value: "Waiting for more players...", color: "#cde"},
                { type: "text", position: [0, 50, 100, 50], value: String(game.custom.waiting_text).toString(), color: "#cde"}
            ]
        });
    },
    setControlPointOBJ: function (neutral = false, team, forced = false) {
        let scale = CONTROL_POINT.texture.scale * CONTROL_POINT.size;
        let lastState = game.custom.winner == null ? "neutral" : game.custom.winner;
        let curState = neutral ? "neutral" : team;
        if (!forced && lastState == curState) return;
        if (lastState != curState) this.removeObject("control_point_" + lastState);
        game.custom.winner = curState;
        let color = neutral ? CONTROL_POINT.neutral_color : this.toHSLA(TeamManager.getData(team).hue);
        this.setPlaneOBJ({
            id: "control_point_" + curState,
            position: {
                ...CONTROL_POINT.position,
                z: 0
            },
            scale: {
                x: scale,
                y: scale,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            type: {
                id: "control_point_" + curState,
                emissive: CONTROL_POINT.texture.url,
                emissiveColor: color
            }
        });

        this.updateRadar();
    },
    updateRadar: function () {
        let color = (game.custom.winner == null || game.custom.winner == "neutral") ? CONTROL_POINT.neutral_color : this.toHSLA(TeamManager.getData(game.custom.winner).hue);
        let radar_components = [
            ...TeamManager.getAll().filter(t => t && t.spawnpoint != null).map(t => ({
                ...t.spawnpoint,
                size: BASES.size,
                color: HelperFunctions.toHSLA(t.hue)
            })),
            {
                ...CONTROL_POINT.position,
                size: CONTROL_POINT.size,
                character: "×",
                color
            }
        ];

        UIData.radar = {
            id: "radar_background",
            components: radar_components.map(info => {
                let radarSize = info.size * HelperFunctions.transform.zoom * 2;
                let textNodeSize = radarSize * HelperFunctions.transform.scale;
                let comps = [
                    { type: "round", position: [
                        HelperFunctions.transform.X(info.x, info.size, false),
                        HelperFunctions.transform.Y(info.y, info.size, false),
                        radarSize,
                        radarSize
                    ], width: 2, stroke: info.color}
                ];
                if (info.character != null) comps.push(
                    { type: "text", position: [
                        HelperFunctions.transform.X(info.x, info.size, true),
                        HelperFunctions.transform.Y(info.y, info.size, true),
                        textNodeSize,
                        textNodeSize
                    ], value: info.character, color: info.color}
                );
                return comps
            }).flat(Infinity)
        }

        this.sendUI(game, UIData.radar);
    },
    resetIntrusionWarningMSG: function (ship) {
        ship.custom.intrudedEnemyBaseStart = null;
        HelperFunctions.sendUI(ship, {
            id: "intrusion_warning",
            visible: false
        });
    },
    transform: {
        zoom: 10 / GAME_OPTIONS.map_size,
        scale: 1.5,
        X: function(x, size, textNode = false) {
            return this.positize((x + GAME_OPTIONS.map_size * 5 - size * (textNode ? this.scale : 1)) * this.zoom);
        },
        Y: function(y, size, textNode = false) {
            return this.positize((-y + GAME_OPTIONS.map_size * 5 - size * (textNode ? this.scale : 1)) * this.zoom);
        },
        positize: function (x) { return Math.max(x, 0) || 0 }
    },
    toTimer: function () {
        let seconds = this.timeLeft(game.custom.startedStep + GAME_OPTIONS.duration * 60);
        let minutes = Math.trunc(seconds / 60);
        seconds -= minutes * 60;
        if (minutes < 60) return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        let hours = Math.trunc(minutes / 60);
        minutes -= hours * 60;
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    canUseButtons: function (ship) {
        return !ship.custom.EMP && !ship.custom.shipUIsHidden && ship.custom.pucked == null && !ship.custom.inAbility;
    }
}

const TeamManager = {
    teams_list: Teams,
    ghostTeam: GhostTeam,
    initialize: function () {
        this.teams = game.custom.teams;
        if (this.teams == null) game.custom.teams = this.teams = [...Array(GAME_OPTIONS.teams_count)].map((e, i) => {
            let index = HelperFunctions.randInt(this.teams_list);
            let team = this.teams_list.splice(index, 1)[0];
            team.id = i;
            return team;
        });
    },
    getAll: function () {
        if (!Array.isArray(this.teams)) this.initialize();
        return this.teams;
    },
    getData: function (team) {
        return this.getAll()[team] || this.ghostTeam;
    },
    setGhostTeam: function (ship, changeTeam = false, TpBackToBase = false) {
        this.set(ship, 69, changeTeam, TpBackToBase)
    },
    set: function (ship, team = ship.team, changeTeam = false, TpBackToBase = false) {
        let teamData = this.getData(team);
        ship.set({hue: teamData.hue});
        if (changeTeam) ship.set({team: teamData.id});
        if (TpBackToBase) MapManager.spawn(ship);
    }
}

const MapManager = {
    maps: Maps.filter(e => e.spawnpoints.length >= GAME_OPTIONS.teams_count),
    get: function (set = false, forceReset = false) {
        if (this.map == null || forceReset) this.map = HelperFunctions.randomItem(this.maps).value;
        if (this.map == null) {
            HelperFunctions.terminal.error(`Can't find any maps for ${GAME_OPTIONS.teams_count} team(s)? Are you sure?`);
            this.map = { name: "Unknown", author: "Unknown", map: "", spawnpoints: []}
        }
        if (set) {
            if (game.custom.initialized) {
                game.setCustomMap(this.map.map);
                this.setSpawnpointsOBJ()
                HelperFunctions.updateRadar();
            }
            this.assignSpawnpoints();
        }
        return this.map;
    },
    assignSpawnpoints: function () {
        let teams = TeamManager.getAll(), { spawnpoints } = this.get();
        for (let team of teams) if (team && team.need_spawnpoint) team.spawnpoint = HelperFunctions.randomItem(spawnpoints, true).value;
    },
    spawn: function (ship) {
        let { spawnpoint } = TeamManager.getData(ship.team);
        if (spawnpoint != null) {
            let distance = Math.random() * BASES.size, angle = Math.random() * 2 * Math.PI;
            ship.set({
                x: spawnpoint.x + distance * Math.cos(angle) ,
                y: spawnpoint.y + distance * Math.sin(angle)
            });
        }
        if (game.custom.started) UIData.shipUIs.toggle(ship, false, true);
    },
    set: function (nameOrIndex, set = false) {
        this.map = this.maps[nameOrIndex] || this.maps.find(m => m.name.toLowerCase() == String(nameOrIndex).toLowerCase());
        return this.get(set);
    },
    setSpawnpointsOBJ: function () {
        let teams = TeamManager.getAll(), mapName = this.get().name;

        let samples = [...BASES.textures];
        let i = 0;
        for (let team of teams) {
            if (team == null) continue;
            let spawnpoint = team.spawnpoint;

            if (spawnpoint == null) continue;

            if (samples.length < 1) samples = [...BASES.textures];

            let texture = HelperFunctions.randomItem(samples, true);

            let hue = team.hue;

            let scale = BASES.size * texture.value.scale;

            HelperFunctions.setPlaneOBJ({
                id: "team_base_" + i,
                position: {
                    ...spawnpoint,
                    z: 0
                },
                scale: {
                    x: scale,
                    y: scale,
                    z: 0
                },
                rotation: {
                    x: Math.PI,
                    y: 0,
                    z: -Math.atan2(CONTROL_POINT.position.y - spawnpoint.y, CONTROL_POINT.position.x - spawnpoint.x)
                },
                type: {
                    id: "team_base_" + mapName + "_" + (i++) + "_" + texture.index,
                    emissive: texture.value.url,
                    emissiveColor: HelperFunctions.toHSLA(hue)
                }
            })
        }
    }
}

const AbilityManager = {
    includeRingOnModel: false, // the ring model assignments are only executed if this one is `true`
    showAbilityNotice: true,
    abilityNoticeTimeout: 5 * 60, // in ticks
    abilityNoticeMessage: function (ship) {
        return `Greetings, Commander.
Your ship is equipped with a special ability module.
Press [${this.abilityShortcut}] to activate it.`
// Capture the point in the middle to win! Stand inside the point to capture it.`
    },
    abilityShortcut: 'X',
    shipLevels: 6, // all ship levels
    model_conversion_ratio: 50, // don't change
    maxStats: 1e8 - 1,
    crystals: 720,
    _this: this,
    echo: DEBUG ? (window || global).echo || game.modding.terminal.echo : function () {},
    ring_model: {
        section_segments: 64,
        offset: {x: 0, y: 0, z: 0},
        position: {
            x: [0,0,0,0,0,0,0,0],
            y: [0,0],
            z: [0,0,0,0,0,0,0,0,0]
        },
        texture: [ 17 ],
        vertical: true
    },
    UI: {
        id: "ability",
        position: [46.4, 86, 7.2, 8],
        colors: {
            ready: {
                stroke: "#00FF00",
                fill: "#002200",
                text: "#88FF88"
            },
            notReady: {
                stroke: "#FF0000",
                fill: "#220000",
                text: "#FFAAAA"
            }
        }
    },
    tick: function (ship) {
        this.updateUI(ship);
        let ability = ship.custom.ability;
        if (!ship.custom.inAbility || ability == null) return;
        if ((game.step - ship.custom.lastTriggered) % ability.tickInterval === 0) ability.tick(ship);
        if (ability.customEndcondition && (ship.custom.forceEnd || ability.canEnd(ship))) this.end(ship);
    },
    end: function (ship) {
        let ability = ship.custom.ability;
        if (ability == null) return;
        ship.custom.inAbility = false;
        ship.custom.forceEnd = false;
        HelperFunctions.TimeManager.clearTimeout(ability.ships.get(ship.id));
        ability.ships.delete(ship.id);
        if (ability.cooldownRestartOnEnd) ship.custom.lastTriggered = game.step;
        ability.end(ship);
    },
    canStart: function (ship) {
        return game.custom.started && !ship.custom.EMP && ship.alive && ship.custom.pucked == null && ship.custom.ability.canStart(ship);
    },
    start: function (ship) {
        let ability = ship.custom.ability;
        if (ability == null || !ability.canStart(ship) || (!ability.canStartOnAbility && ship.custom.inAbility) || !ship.alive) return;

        ship.custom.lastTriggered = game.step;
        ship.custom.forceEnd = false;
        ability.start(ship);
        ship.custom.inAbility = true;
        if (ability.duration != null) {
            let oldTimeout = ability.ships.get(ship.id);
            if (oldTimeout != null) HelperFunctions.TimeManager.clearTimeout(oldTimeout);
            ability.ships.set(ship.id, HelperFunctions.TimeManager.setTimeout(function () {
                this.end(ship);
            }.bind(this), ability.duration));
        }
    },
    requirementsInfo: function (ship) {
        let ability = ship.custom.ability;
        if (ship.custom.pucked != null) return { ready: false, text: "Pucked" };
        if (ability == null) return { ready: false, text: "Disabled" };
        let ready = this.canStart(ship);
        if (ready && !ability.useRequirementsTextWhenReady) return { ready: true, text: "Ready" };
        return {
            ready,
            text: ability.requirementsText(ship)
        }
    },
    updateUI: function (ship) {
        let lastUI = ship.custom.lastUI || {}, ability = ship.custom.ability;
        let abilityName = ability.abilityName(ship), { ready, text } = this.requirementsInfo(ship);
        if (lastUI.ready !== ready || lastUI.text !== text || lastUI.abilityName !== abilityName) {
            lastUI = ship.custom.lastUI = { ready, text, abilityName };
            let color = this.UI.colors[ready ? "ready" : "notReady"];
            HelperFunctions.sendUI(ship, {
                id: this.UI.id,
                position: this.UI.position,
                clickable: lastUI.ready,
                visible: true,
                shortcut: this.abilityShortcut,
                components: [
                    { type: "text",position:[0,0,100,50],value: HelperFunctions.fill(abilityName + ` [${this.abilityShortcut}]`, 15), color: "#FFFFFF"},
                    { type:"box",position:[0,50,100,50],fill: color.fill, stroke: color.stroke,width:4},
                    { type: "text",position:[0,55,100,40],value: text ,color: color.text},
                ]
            })
        }
    },
    event: function (event, ship) {
        return ship.custom.ability && ship.custom.ability.event(event, ship);
    },
    reload: function (ship) {
        return ship.custom.ability && ship.custom.ability.reload(ship);
    },
    assign: function (ship, abilityShip) {
        let shipAbil = this.abilities[abilityShip];
        if (shipAbil == null) {
            let requestedName = String(abilityShip).toLowerCase().replace(/[^a-z0-9]/gi, "");
            let foundName = this.ships_list.find(name => name.toLowerCase().replace(/[^a-z0-9]/gi, "") == requestedName);
            if (foundName != null) shipAbil = this.abilities[abilityShip = foundName];
        }
        if (shipAbil == null) return this.random(ship);
        ship.custom.shipName = abilityShip;
        ship.custom.ability = shipAbil;
        ship.custom.inAbility = false;
        ship.custom.forceEnd = false;
        ship.custom.lastTriggered = game.step;
        ship.custom.abilityCustom = {};
        ship.custom.lastUI = {};
        ship.set({
            healing: false,
            collider: true,
            type: shipAbil.codes.default,
            shield: 1e4,
            generator: shipAbil.generatorInit,
            stats: AbilityManager.maxStats,
            crystals: shipAbil.crystals
        });
        shipAbil.initialize(ship);
        // HelperFunctions.sendUI(ship, {
        //     id: "debug_test",
        //     position: [25,0,50,10],
        //     clickable: false,
        //     visible: true,
        //     components: [
        //         {type: "text", position: [0,0,100,50], value: "[D]: Random ship, [F]: Skip cooldown, [G]: Previous ship, [H]: Next ship", color: "#FFF"},
        //         {type: "text", position: [0,50,100,50], value: `Current ship: ${abilityShip}`, color: "#FFF"}
        //     ]
        // });
    },
    globalTick: function (game) {
        if (DEBUG && game.step == 0 && HelperFunctions.terminal.errors > 0) {
            HelperFunctions.terminal.error(`Stopping mod due to ${HelperFunctions.terminal.errors} error(s).`);
            game.modding.commands.stop();
            this.globalTick = function () {};
        }
        else this.globalTick = this.globalTick2;
        this.globalTick(game);
    },
    globalTick2: function (game) {
        HelperFunctions.TimeManager.tick();
        for (let ability of Object.values(this.abilities)) {
            if ("function" == typeof ability.globalTick) ability.globalTick(game);
        }
        for (let ship of game.ships) {
            if (ship.id == null) continue;
            if (!ship.custom.__ability__initialized__ && ship.alive) {
                this.random(ship);
                // for (let keys of [
                //     ["random", "D"],
                //     ["reload", "F"],
                //     ["prev", "G"],
                //     ["next", "H"]
                // ]) HelperFunctions.sendUI(ship, {
                //     id: keys[0],
                //     position: [0,0,0,0],
                //     clickable: true,
                //     visible: true,
                //     shortcut: keys[1]
                // });
                ship.custom.__ability__initialized__ = true;
            }
            if (this.showAbilityNotice && ship.custom.allowInstructor) {
                if (this.abilityNoticeMessage) {
                    ship.instructorSays(String(this.abilityNoticeMessage(ship)), TeamManager.getData(ship.team).instructor);
                    if (this.abilityNoticeTimeout > 0) HelperFunctions.TimeManager.setTimeout(function () {
                        ship.hideInstructor();
                    }, this.abilityNoticeTimeout);
                }
                ship.custom.allowInstructor = false;
            }
            if (ship.custom.__ability__initialized__) this.tick(ship);
        }
    },
    globalEvent: function (event, game) {
        let ship = event.ship;
        if (ship == null || ship.custom.kicked || !ship.custom.__ability__initialized__) return;
        switch (event.name) {
            case "ui_component_clicked":
                let component = event.id;
                switch (component) {
                    case AbilityManager.UI.id:
                        AbilityManager.start(ship);
                        break;
                    // case "random":
                    //     if (ship.custom.pucked == null && !ship.custom.inAbility && (!ship.custom.lastClicked || game.step - ship.custom.lastClicked > 30)) {
                    //         AbilityManager.random(ship);
                    //         ship.custom.lastClicked = game.step;
                    //     }
                    //     break;
                    // case "reload":
                    //     AbilityManager.reload(ship);
                    //     break;
                }
                break;
            case "ship_spawned":
                ship.set({crystals: ship.custom.ability.crystals});
                ship.custom.lastTriggered = game.step;
                break;
        }
        AbilityManager.event(event, ship);
        if (event.killer != null) AbilityManager.event(event, event.killer);
        for (let ability of Object.values(AbilityManager.abilities)) {
            if ("function" == typeof ability.globalEvent) ability.globalEvent(event);
        }
    },
    initialize: function () {
        // for debug issues
        if (game.custom.AbilityManager) {
            for (let ship of game.ships) {
                let ability = AbilityManager.abilities[ship.custom.shipName];
                if (ability != null) ship.custom.ability = ability;
                else AbilityManager.random(ship);
            }
        }

        game.custom.AbilityManager = AbilityManager;

        let echo = this.echo, gb = window || global;

        if (DEBUG) {
            gb.AbilityManager = AbilityManager;
            gb.TeamManager = TeamManager;
            gb.MapManager = MapManager;

            let gameCommands = game.modding.commands;

            const locateShip = function(req, handler) {
                let args=req.replace(/^\s+/,"").replace(/\s+/," ").split(" "),id=Number(args[1]||"NaN");
                if (isNaN(id)) game.modding.terminal.error("Please specify a ship id to take action");
                else {
                    let ship=game.findShip(id);
                    if (!ship) game.modding.terminal.error("Requested ship not found!");
                    else {
                        try{typeof handler == "function" && handler(ship, id, args)}
                        catch(e){game.modding.terminal.error("An error occured while taking action with the requested ship!")}
                    }
                }
            }, infoName = function (ship) {
                return `${ship?.name || "ANONYMOUS"} (ID ${ship?.id || "Unknown"})`
            }

            let commands = [], addCommand = function (commandName, resolver, docs = {}) {
                commands.push(commandName);
                resolver.docs = { ...docs };
                gameCommands[commandName] = resolver;
            }, addShipCommand = function (commandName, resolver, doneText = '', docs = {}) {
                // doneText variables
                // %s ship info (name (ID id))
                // %r return value from resolver
                // dontText won't be shown if it's empty
                docs = { ...docs };
                if (!Array.isArray(docs.arguments)) docs.arguments = [];
                docs.arguments.unshift({ name: "id", required: true });
                addCommand(commandName, function (req) {
                    locateShip(req, function (ship, id, args) {
                        let data = resolver(ship, id, args);
                        let info = infoName(ship);
                        let text = doneText;
                        if (text) text = text.replace(/%r/g, data).replace(/%s/g, info);
                        if (text) echo(text);
                    });
                }, docs);
            }, showCommandUsage = function (commandName, newline = false) {
                if (!commands.includes(commandName)) return echo(`Not found: '${commandName}'`);
                let command = gameCommands[commandName];
                if (command.docs == null) return echo(`${commandName}: No descriptions found.`);
                let docs = command.docs;
                let args = Array.isArray(docs.arguments) ? docs.arguments : [];
                echo(`${commandName} ${args.map(e => "<" + (e.required ? "" : "?") + e.name + ">").join(' ').trim()}${newline ? "\n": "\t"}[[;#0f60ff;]${docs.description || "No detailed description."}]`);
            }, showShipInfo = function (ship, newline = false) {
                echo([
                    `ID: ${ship.id}`,
                    `Name: ${ship.name}`,
                    showTeamInfo(ship),
                    `X: ${ship.x}`,
                    `Y: ${ship.y}`,
                    `Ship: ${ship.custom.shipName}`,
                    ship.custom.inAbility ? "In ability" : "",
                    ship.custom.pucked != null || ship.custom.EMP ? "Ability disabled" : ""
                ].filter(e => e).join(`.${newline ? "\n" : " "}`))
            }, showTeamInfo = function (ship) {
                let teamInfo = TeamManager.getData(ship.team);
                return `Team: ${teamInfo.name.toUpperCase()}, Hue: ${teamInfo.hue}, ${teamInfo.ghost ? "Ghost team, " : ""}${teamInfo.spawnpoint ? ("Spawnpoint: X: " + teamInfo.spawnpoint.x + " Y: " + teamInfo.spawnpoint.y) : "No spawnpoint"}`;
            }

            addCommand('commands', function () {
                for (let command of commands) showCommandUsage(command);
            }, {
                description: "Show all commands used by the mod"
            });

            addCommand('usage', function (req) {
                showCommandUsage(req.split(" ").slice(1).join(' '), true);
            }, {
                arguments: [ { name: "command_name", required: true }],
                description: "Show usage of a command"
            });

            addCommand('info', function (req) {
                let id = +req.split(" ").slice(1).join(" ").trim();
                let ship = game.findShip(id);
                if (ship == null || ship.id == null) {
                    echo("List of ships and their specs:");
                    for (let tship of game.ships) showShipInfo(tship);
                }
                else showShipInfo(ship, true);
            }, {
                arguments: [
                    { name: "id", required: false }
                ],
                description: "Show all ship infos (specify id to only check that ship's info)"
            });

            addCommand('sunall', function () {
                echo('All players has been teleoprted to the sun!');
            }, { description: "Teleport all players to the sun" });

            addShipCommand('kick', function (ship, id, args) {
                ship.custom.kicked = true;
                ship.gameover({
                    "You've been kicked by the map host": " ",
                    "Reason": args.slice(2).join(" ") || "No reason has been provided"
                });
            }, '%s has been kicked', {
                arguments: [
                    { name: "reason", required: false }
                ],
                description: "Kick a ship"
            }); 

            addShipCommand('restore', function (ship, id, args) {
                let abil = ship.custom.ability;
                ship.set({
                    shield: 1e4,
                    crystals: (abil != null ? abil : AbilityManager).crystals,
                    stats: AbilityManager.maxStats
                });
            }, '%s has been restored', {
                description: "Restore a ship's health and crystals"
            });

            addShipCommand('assign', function (ship, id, args) {
                AbilityManager.assign(ship, args.slice(2).join(' ').trim());
                return ship.custom.shipName;
            }, '%s has been set to %r', {
                arguments: [
                    { name: "ship_name", required: false }
                ],
                description: "Set a ship to a specific ability ship, leave ship name blank for random assignment"
            });

            addShipCommand('reload', function (ship, id, args) {
                AbilityManager.reload(ship);
            }, 'Skipped cooldown for %s', {
                description: "Skip cooldown for a ship"
            });

            addShipCommand('kill', function (ship, id, args) {
                ship.set({ kill: true });
            }, '%s has been killed', {
                description: "Kills a ship"
            });

            addShipCommand('team', function (ship, id, args) {
                let team = args.slice(2).join(' ').trim();
                let teamInfo = TeamManager.getData(ship.team);
                if (team) {
                    let newTeam = TeamManager.getData(team);
                    if (newTeam == teamInfo) return `%s is already on ${teamInfo.name.toUpperCase()}`;
                    teamInfo = newTeam;
                    TeamManager.set(ship, team, true, false);
                    HelperFunctions.TimeManager.setTimeout(function () {
                        UIData.updateScoreboard(game);
                    }, 60);
                }
                return team ? `Set %s to team ${teamInfo.name.toUpperCase()}`: showTeamInfo(ship);
            }, '%r', {
                arguments: [
                    { name: "team_id", required: false }
                ],
                description: "Get/Set ship's team info"
            });

            addShipCommand('tptoship', function (ship1, id1, args) {
                let id2 = +args.slice(2).join(' ');
                let ship2 = game.findShip(id2);
                if (ship2 == null || ship2.id == null) {
                    game.modding.terminal.error(`Failed: Ship with ID ${id2} doesn't exist`);
                    return '';
                }
                ship1.set({ x: ship2.x, y: ship2.y });
                return `Teleported %s to ${infoName(ship2)}!`;
            }, '%r', {
                arguments: [
                    { name: "id2", required: true }
                ],
                description: "Teleport from ship to ship2"
            });

            addShipCommand('tptoxy', function (ship, id, args) {
                let pos = {
                    x: args[2],
                    y: args[3]
                }
                if (pos.x == null || pos.x == "" || isNaN(pos.x)) delete pos.x; else pos.x = +pos.x;
                if (pos.y == null || pos.y == "" || isNaN(pos.y)) delete pos.y; else pos.y = +pos.y;
                if ('x' in pos || 'y' in pos) {
                    ship.set(pos);
                    return `Teleported %s to ${['x' in pos ? "X: " + pos.x : "", 'y' in pos ? "Y: " + pos.y : ""].join(' ').trim()}`;
                }
                return "Nothing to teleport to"
            }, `%r`, {
                arguments: [
                    { name: "x", required: false },
                    { name: "y", required: false }
                ],
                description: "Teleport ship to position x and/or y"
            });
        }

        this.compileAbilities();
    },
    compileAbilities: function () {
        // Compile ships and abilities
        
        this.ship_codes = [];

        let model = 100, templates = HelperFunctions.templates;

        for (let shipName in this.abilities) {
            let ability = this.abilities[shipName];
            // delete hidden ones
            if (ability.hidden != null && ability.hidden) {
                delete this.abilities[shipName];
                HelperFunctions.terminal.log(`Ignoring '${shipName}' because it's hidden`);
                continue;
            }
            // functions polyfill

            ability.ships = new Map();

            ability.tickInterval = Math.floor(Math.max(ability.tickInterval, 1)) || 1;

            ability.crystals = Math.max(0, ability.crystals);

            if (isNaN(ability.crystals)) ability.crystals = this.crystals;

            ability.generatorInit = Math.min(1e5, Math.max(0, ability.generatorInit));

            if (isNaN(ability.generatorInit)) ability.generatorInit = 1e5;

            if ("function" != typeof ability.canStart) ability.canStart = templates.canStart;

            if ("function" != typeof ability.canEnd) ability.canEnd = templates.canEnd;

            let needAbilityShip = false;
            if ("function" != typeof ability.start) {
                ability.start = templates.start;
                needAbilityShip = true;
            }

            if ("function" != typeof ability.end) ability.end = templates.end;

            if ("function" != typeof ability.tick) ability.tick = templates.tick;

            if ("function" != typeof ability.event) ability.event = templates.event;

            if ("function" != typeof ability.requirementsText) ability.requirementsText = templates.requirementsText;

            if ("function" != typeof ability.reload) ability.reload = templates.reload;

            if ("function" != typeof ability.abilityName) ability.abilityName = templates.abilityName;

            if ("function" != typeof ability.initialize) ability.initialize = templates.initialize;

            // pre-compile
            if ("function" == typeof ability.compile) try {
                ability.compile(this._this);
            }
            catch (e) {
                HelperFunctions.terminal.error(`Pre-compiler function for ${shipName} failed to execute.\nCaught Error: ${e.message}`);
            }

            // process ship codes
            ability.codes = {};
            for (let shipAbilityName in ability.models) try {
                let jsonData = JSON.parse(ability.models[shipAbilityName]);
                if (jsonData == null || jsonData.typespec == null) throw "No ship data or typespec";
                jsonData.level = jsonData.typespec.level = this.shipLevels;
                jsonData.model = --model;
                ability.codes[shipAbilityName] = jsonData.typespec.code = this.shipLevels * 100 + model;

                let allowRingOnModel;

                if (this.includeRingOnModel) {
                    if (ability.includeRingOnModel == null || "object" != typeof ability.includeRingOnModel) allowRingOnModel = !!ability.includeRingOnModel;
                    else allowRingOnModel = !!ability.includeRingOnModel[shipAbilityName];
                }
                else allowRingOnModel = false;

                if (allowRingOnModel) {
                    let ringModel = JSON.parse(JSON.stringify(this.ring_model));
                    let radius = this.model_conversion_ratio * ability.range / (+jsonData.size || 1);
                    ringModel.width = ringModel.height = [radius, radius - 10];
                    if (jsonData.bodies == null) jsonData.bodies = {};
                    jsonData.bodies.__ArenaModAbilityRangeRing__ = ringModel;
                }

                this.ship_codes.push(JSON.stringify(jsonData));
            }
            catch (e) {
                HelperFunctions.terminal.error(`Failed to compile ship code for model '${shipAbilityName}' of '${shipName}'.\nCaught Error: ${e.message}`);
            }
            
            if (!ability.codes.default) HelperFunctions.terminal.error(`Missing 'default' model for '${shipName}'.`);
            if (needAbilityShip && !ability.codes.ability) HelperFunctions.terminal.error(`'${shipName}' uses default ability behaviour but model 'ability' is missing.`);
        }

        if (this.ship_codes.length < 1) HelperFunctions.terminal.error(`No ships found. What the f*ck?`);

        this.ships_list = Object.keys(this.abilities);
    },
    getShipCodes: function () {
        if (!Array.isArray(this.ship_codes)) this.initialize();
        return this.ship_codes;
    },
    random: function (ship) {
        // select random ship
        return this.assign(ship, HelperFunctions.randomItem(this.ships_list).value);
    },
    abilities: ShipAbilities
}

const UIData = {
    colorTextLightness: 65,
    control_bar: {
        id: "POINT_BAR",
        visible: false
    },
    radar: {
        id: "radar_background",
        visible: false
    },
    scores: {
        id: "team_points",
        visible: false
    },
    scoreboard: {
        id: "scoreboard",
        visible: true,
        components: [
            {type: "text",position:[15,0,70,10],value:"Waiting for more players...",color:"#cde"}
        ]
    },
    blockers: {
        list: [
            {
                id: "buy_lives_blocker",
                visible: true,
                clickable: true,
                shortcut: String.fromCharCode(187),
                position: [65,0,10,10],
                components: []
            },
            {
                id: "score_block",
                position: [4,3,12,6],
                components:[
                    {type:'box',position:[0,0,100,100],fill:"#cde"},
                    {type: "text", position: [0,0,100,100], value: "We don't use points here.", color: "black"}
                ]
            },
            {
                id: "steam_exit_block",
                position:[0,95,20,5],
                clickable: true
            }
        ],
        set: function (ship) {
            if (ship != null) for (let ui of this.list) HelperFunctions.sendUI(ship, ui)
        },
        has: function (id) {
            return !!this.list.find(ui => ui.id === id)
        }
    },
    shipUIs: {
        shortcut: "V",
        toggleID: "toggle_choose_ship",
        shipSelectPrefix: "choose_ship_",
        shipSelectSize: {
            textLength: 40, // to keep the text looks pretty and aligned
            itemsPerLine: 4,
            xStart: 21,
            yStart: 19,
            xEnd: 79,
            yEnd: 85,
            margin_scale_x: 1/8, // comparing to button width
            margin_scale_y: 1/6, // comparing to button height
        },
        openUI: function (ship, show) {
            HelperFunctions.sendUI(ship, {
                id: this.toggleID,
                visible: show,
                clickable: show,
                position: [3,30,15,10],
                shortcut: this.shortcut,
                components: [
                    { type:"box",position:[0,0,100,100],fill:"rgba(68, 85, 102, 0.5)",stroke:"#FFFFFF",width:2},
                    { type: "text",position:[5,20,90,60],value: `${ship.custom.shipUIsHidden ? "Open" : "Close"} ship selection [${this.shortcut}]`, color:"#FFFFFF"},
                ]
            });
        },
        toggle: function (ship, perma = false, firstOpen = false) {
            // perma means also hides the choose ship button
            // first open to assign starting tick
            if (!firstOpen && ship.custom.shipUIsPermaHidden) return;
            let isHidden = perma || firstOpen || !ship.custom.shipUIsHidden;
            if (perma) {
                ship.custom.shipUIsPermaHidden = true;
            }
            if (firstOpen) {
                ship.custom.shipUIsPermaHidden = false;
                ship.custom.lastSpawnedStep = game.step;
            }
            ship.custom.shipUIsHidden = isHidden;
            this.openUI(ship, !perma);
            this.toggleSelectMenu(ship)
        },
        toggleSelectMenu: function (ship) {
            let visible = !ship.custom.shipUIsHidden;
            let abilities = AbilityManager.ships_list;

            if (!visible) {
                for (let abil of abilities) HelperFunctions.sendUI(ship, { id: this.shipSelectPrefix + abil, visible: false });
                HelperFunctions.sendUI(ship, {id: "next_ship", visible: false});
                HelperFunctions.sendUI(ship, {id: "prev_ship", visible: false});
                return;
            }

            let UISpec = this.shipSelectSize;
            let itemsPerLine = UISpec.itemsPerLine;
            let itemsPerColumn = Math.ceil(abilities.length / itemsPerLine);

            let width = (UISpec.xEnd - UISpec.xStart) / (itemsPerLine + (itemsPerLine - 1) * UISpec.margin_scale_x);
            let height = (UISpec.yEnd - UISpec.yStart) / (itemsPerColumn + (itemsPerColumn - 1) * UISpec.margin_scale_y);

            let lastLineXOffset = (abilities.length % itemsPerLine) * width * (1 + UISpec.margin_scale_x) / 2;

            let i = 0;
            for (let abil of abilities) {
                let row = Math.trunc(i / itemsPerLine), column = i % itemsPerLine;
                let color = ship.custom.shipName == abil ? "#AAFF00" : "#FFFFFF";
                let strokeWidth = ship.custom.shipName == abil ? 8 : 2;
                let offsetX = row == itemsPerColumn - 1 ? lastLineXOffset : 0;
                let bg = ship.custom.shipName == abil ? "rgba(170, 225, 0, 0.25)" : "rgba(68, 85, 102, 0.25)"
                HelperFunctions.sendUI(ship, {
                    id: this.shipSelectPrefix + abil,
                    visible: true,
                    clickable: true,
                    position: [
                        offsetX + UISpec.xStart + column * width * (UISpec.margin_scale_x + 1),
                        UISpec.yStart + row * height * (UISpec.margin_scale_y + 1),
                        width,
                        height
                    ],
                    components: [
                        { type: "box", position: [0, 0, 100, 100], fill: bg,stroke: color,width: strokeWidth},
                        { type: "text", position: [0, 0, 100, 100], value: HelperFunctions.fill(abil, UISpec.textLength), color}
                    ]     
                });
                ++i;
            }

            HelperFunctions.sendUI(ship, {
                id: "prev_ship",
                visible: true,
                clickable: true,
                shortcut: "U",
                position: [
                    UISpec.xStart,
                    UISpec.yEnd + height * UISpec.margin_scale_y * 2,
                    width,
                    95 - (UISpec.yEnd + height * UISpec.margin_scale_y * 2)
                ],
                components: [
                    { type: "box", position: [0, 0, 100, 100], fill:"rgba(68, 85, 102, 0.5)",stroke: "#fff",width:2},
                    { type: "text", position: [0, 0, 100, 100], value: HelperFunctions.fill(`Previous ship [U]`, UISpec.textLength), color: "#fff"}
                ]
            });

            HelperFunctions.sendUI(ship, {
                id: "next_ship",
                visible: true,
                clickable: true,
                shortcut: "K",
                position: [
                    UISpec.xEnd - width,
                    UISpec.yEnd + height * UISpec.margin_scale_y * 2,
                    width,
                    95 - (UISpec.yEnd + height * UISpec.margin_scale_y * 2)
                ],
                components: [
                    { type: "box", position: [0, 0, 100, 100], fill:"rgba(68, 85, 102, 0.5)",stroke: "#fff",width:2},
                    { type: "text", position: [0, 0, 100, 100], value: HelperFunctions.fill(`Next ship [K]`, UISpec.textLength), color: "#fff"}
                ]
            });
        }
    },
    updateScoreboard: function (game) {
        if (game.custom.started) {
            let players = game.ships.filter(e => e && e.id != null).sort((a, b) => {
                let aKills = a.custom.kills = a.custom.kills || 0;
                let aDeaths = a.custom.deaths = a.custom.deaths || 0;
                let bKills = b.custom.kills = b.custom.kills || 0;
                let bDeaths = b.custom.deaths = b.custom.deaths || 0;

                return (bKills - bDeaths / 3) - (aKills - aDeaths / 3);
            }).slice(0, 10);
            let columnHeight = 100 / 11;
            let textHeight = columnHeight / 1.2;
            let offsetY = (columnHeight - textHeight) / 2;
            this.scoreboard.components = [
                {type: "box", position:[0,0,100,columnHeight], fill: "hsla(210, 20%, 33%, 1)"},
                {type: "text", position: [0,offsetY,100,textHeight], color: "#cde", value: " Players", align: "left"},
                {type: "text", position: [0, offsetY, 100, textHeight], color: "#cde", value: "K/D ", align: "right"},
                {type: "text", position: [0,offsetY,100,textHeight], color: "#cde", value: " "}, // player component scale
                ...players.map((player, index) => {
                    let pos = [0, offsetY + columnHeight * (index + 1), 100, textHeight];
                    let color = HelperFunctions.toHSLA(TeamManager.getData(player.team).hue)
                    return [
                        { type: "player", index, id: player.id, position: pos, color, align: "left"},
                        { type: "text", value: `${player.custom.kills}/${player.custom.deaths} `, position: pos, color, align: "right"},
                    ]
                }).flat()
            ]
        }

        for (let ship of game.ships) {
            if (ship && ship.id != null) this.renderScoreboard(ship);
        }
    },
    renderScoreboard: function (ship) {
        if (ship == null || ship.id == null) return;
        let scoreboardData = { ...this.scoreboard };
        if (game.custom.started) {
            // highlight players
            let compos = HelperFunctions.clone(scoreboardData.components);
            let foundIndex = compos.findIndex(c => c.type == "player" && c.id === ship.id);
            if (foundIndex < 0) {
                let color = HelperFunctions.toHSLA(TeamManager.getData(ship.team).hue);
                foundIndex = compos.findLastIndex(c => c.type == "player");
                compos[foundIndex].id = ship.id;
                compos[foundIndex].color = color;
                compos[foundIndex + 1].value = `${ship.custom.kills}/${ship.custom.deaths} `;
                compos[foundIndex + 1].color = color;
            }
            compos.splice(foundIndex, 0, { type: "box", position: [0, (compos[foundIndex].index + 1) * 100 / 11, 100, 100 / 11], fill: "hsla(210, 24%, 29%, 0.5)" });
            scoreboardData.components = compos;
        }
        HelperFunctions.sendUI(ship, scoreboardData);
    },
    renderTeamScores: function (ship, forceUpdate = false) {
        if (forceUpdate && game.custom.started) {
            UIData.scores = {
                id: "team_points",
                position: [35,11.5,30,5],
                components: []
            };
            let UI_counts = GAME_OPTIONS.teams_count * 2 - 1;
            let ghostTeamScore = Math.floor(control_point_data.ghostScore);
            let ghostTeamShow = ghostTeamScore > 0;
            if (ghostTeamShow) UI_counts += 2;
            let width = 100 / UI_counts;
            let dash = { type: "text", value: "-", color: "#fff"};
            let index = 0;
            UIData.scores.components = control_point_data.scores.map((score, id) => {
                let color = HelperFunctions.toHSLA(TeamManager.getData(id).hue, 1, 100, this.colorTextLightness);
                let data = [
                    { type: "text", position: [index * width, 0, width, 100], value: Math.floor(score), color}
                ];
                if (game.custom.scoreIncreased && id == game.custom.winner) data.push(
                    { type: "text", position: [(index + 3/4) * width, 0, width * 1 / 4, 50], value: "+" + CONTROL_POINT.score_increase, color}
                );

                data.push( { ...dash, position: [(index + 1) * width, 0, width, 100]});

                index += 2;

                return data;
            }).flat(Infinity);

            if (ghostTeamShow) {
                let color = HelperFunctions.toHSLA(TeamManager.ghostTeam.hue, 1, 100, this.colorTextLightness);
                let data = [
                    { type: "text", position: [index * width, 0, width, 100], value: ghostTeamScore, color}
                ];
                if (game.custom.scoreIncreased && "ghost" == game.custom.winner) data.push(
                    { type: "text", position: [(index + 3/4) * width, 0, width * 1 / 4, 25], value: "+" + CONTROL_POINT.score_increase, color}
                );
                data.push( { ...dash, position: [(index + 1) * width, 0, width, 100]});
                UIData.scores.components.push(...data);
            }

            UIData.scores.components.pop();
        };
        HelperFunctions.sendUI(ship, UIData.scores);
    }
 }

const renderData = function (ship, forceUpdate = false) {
    // here we render control distribution

    if (forceUpdate) {
        let BarUI = {
            id: "POINT_BAR",
            position: [35,2.5,30,5], // x y width height
            visible: true,
            components: [
                // control distribution will be inserted here
                { type:"box",position:[0,50,100,50],fill:"rgba(0, 0, 0, 0)",stroke:"#FFFFFF",width:2},
                { type: "text",position:[30,0,40,45],value:"Control Point Capture",color:"#FFFFFF"}
            ]
        }

        let compos = [];
        let offset = 0;
        control_point_data.teams.forEach((control, index) => {
            if (control <= 0) return; // skip 0% team
            compos.push([offset, control, HelperFunctions.toHSLA(TeamManager.getData(index).hue)]);
            offset += control;
        });

        if (control_point_data.ghost > 0) {
            compos.push([offset, control_point_data.ghost, HelperFunctions.toHSLA(TeamManager.ghostTeam.hue)]);
            offset += control_point_data.ghost;
        }

        if (control_point_data.neutral > 0) {
            compos.push([offset, control_point_data.neutral, CONTROL_POINT.neutral_fill]);
        }

        BarUI.components.splice(-2, 0, ...compos.map(info => ({
            type: "box",
            position: [info[0], 50, info[1], 50],
            fill: info[2]
        })));

        UIData.control_bar = BarUI;
    }

    HelperFunctions.sendUI(ship, UIData.control_bar);
}

let control_point_data = game.custom.control_point_data;
if (control_point_data == null) game.custom.control_point_data = control_point_data = {
    teams: new Array(GAME_OPTIONS.teams_count).fill(0),
    scores: new Array(GAME_OPTIONS.teams_count).fill(0),
    ghost: 0,
    ghostScore: 0,
    neutral: 100
}

control_point_data.renderData = renderData;

const alwaysTick = function (game) {
    AbilityManager.globalTick(game);
    let teams = TeamManager.getAll();
    let IDs = [];
    for (let ship of game.ships) {
        if (ship == null || ship.id == null) continue;
        if (!ship.custom.joined) {
            UIData.blockers.set(ship);
            TeamManager.set(ship, void 0, false, true);
            control_point_data.renderData(ship, false);
            UIData.renderTeamScores(ship);
            HelperFunctions.sendUI(ship, UIData.radar);
            if (game.custom.started) {
                ship.custom.allowInstructor = true;
            }
            else {
                HelperFunctions.sendWaitingText(ship);
                ship.set({ idle: true, collider: false });
            }
            ship.custom.kills = ship.custom.deaths = 0;
            ship.custom.joined = true;
        }

        let spawnpoint, stepDifference = game.step - ship.custom.lastSpawnedStep;
        if (!ship.custom.shipUIsPermaHidden &&
            (stepDifference > GAME_OPTIONS.ship_ui_timeout * 60 ||
                (stepDifference > 1 * 60 && 
                    (spawnpoint = TeamManager.getData(ship.team).spawnpoint) != null 
                    && HelperFunctions.distance(spawnpoint, ship).distance > BASES.size
                )
            )) {
            UIData.shipUIs.toggle(ship, true);
        }

        IDs.push(ship.id);

        if (BASES.intrusion_damage <= 0 || !ship.alive) continue;

        for (let i = 0; i < teams.length; ++i) {
            let { spawnpoint } = teams[i] || {};
            if (i == ship.team || spawnpoint == null) continue;
            if (HelperFunctions.distance(spawnpoint, ship).distance <= BASES.size) {
                if (ship.custom.intrudedEnemyBaseStart == null) {
                    ship.custom.intrudedEnemyBaseStart = game.step;
                    HelperFunctions.sendUI(ship, {
                        id: "intrusion_warning",
                        position: [20, 20, 60, 5],
                        components: [
                            { type: "text", position: [0, 0, 100, 100], value: "WARNING! ENEMY BASE INTRUSION WILL CAUSE DAMAGE TO YOUR OWN SHIP!", color: "#ffff00" }
                        ]
                    });
                }
                else if ((game.step - ship.custom.intrudedEnemyBaseStart) % 60 === 0) HelperFunctions.damage(ship, BASES.intrusion_damage);
                break;
            }
            else if (ship.custom.intrudedEnemyBaseStart != null) HelperFunctions.resetIntrusionWarningMSG(ship);
        }
    }

    let arIDs = [...IDs];
    if (Array.isArray(game.custom.ids)) {
        let i = 0;
        while (i < IDs.length) {
            let id = IDs[i];
            let oldIndex = game.custom.ids.indexOf(id);
            if (oldIndex >= 0) {
                IDs.splice(i, 1);
                game.custom.ids.splice(oldIndex, 1);
            }
            else ++i;
        }
    }
    else game.custom.ids = IDs;
    if (IDs.length > 0 || game.custom.ids.length > 0) UIData.updateScoreboard(game);
    
    game.custom.ids = arIDs;
}

const initialization = function (game) {
    var lost_sector_aries = {
        id: "lost_sector_aries",
        obj: "https://starblast.io/lost_sector/LostSector_Aries_HardEdges.obj",
        diffuse: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Diffuse.jpg",//"https://raw.githubusercontent.com/atherixibis/alittlebitof/main/gkou.png",//"https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Diffuse.jpg",
        bump: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Height.jpg",
        specular: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Specular.jpg",
        shininess: 0,
        emissiveColor: 0,
        specularColor: 0x3fcf00,
        transparent: false
    };

    HelperFunctions.setObject({
        id: "lost_sector_aries",
        type: lost_sector_aries,
        position: {x:0, y:0, z:-90},
        scale: {x:4, y:4, z:4},
        rotation: {x:0, y:0, z:0}
    });

    HelperFunctions.setControlPointOBJ(true, false, true);

    MapManager.setSpawnpointsOBJ();

    this.tick = waiting;
    game.custom.initialized = true;
    this.tick(game); 
}

const waiting = function (game) {
    alwaysTick(game);
    let players = game.ships.filter(ship => ship && ship.id != null);
    let text = "";
    if (players.length >= GAME_OPTIONS.required_players) {
        if (game.custom.waiting_time == null || isNaN(game.custom.waiting_time)) game.custom.waiting_time = game.step + GAME_OPTIONS.waiting_time * 60;
        if (game.step > game.custom.waiting_time) {
            // game started
            game.custom.started = true;
            UIData.renderTeamScores(game, true);
            UIData.updateScoreboard(game);
            HelperFunctions.sendUI(game, UIData.radar);
            players.forEach(ship => {
                HelperFunctions.sendUI(ship, {
                    id: "waiting_text",
                    visible: false
                });
                ship.custom.allowInstructor = true;
                AbilityManager.random(ship);
                UIData.shipUIs.toggle(ship, false, true);
                ship.set({ idle: false, collider: true });
            });
            if (game.custom.startedStep == null) game.custom.startedStep = game.step + 1;
            return this.tick = main_phase;
        }
        else {
            // not the time yet
            text = HelperFunctions.timeLeft(game.custom.waiting_time);
        }
    }
    else {
        // not enough players
        game.custom.waiting_time = null;
        text = `${players.length}/${GAME_OPTIONS.required_players} players required`;
    }

    if (text != game.custom.waiting_text) {
        game.custom.waiting_text = text;
        HelperFunctions.sendWaitingText(game);
    }
}

const main_phase = function (game) {
    alwaysTick(game);
    if ((game.step - game.custom.startedStep) % 60 === 0) {
        // game logic should be inside here
        // find all players inside the ring
        let players = HelperFunctions.findEntitiesInRange(CONTROL_POINT.position, CONTROL_POINT.size, true, true, false, false, true)
        .filter(ship => ship.id != null);

        let increment = CONTROL_POINT.control_bar.percentage_increase;

        // if there are no players in the ring, gain back control depends on number of controlling teams
        if (players.length < 1) {
            // yeah, why to gain back when it's already all neutral?
            if (control_point_data.neutral < 100) {
                for (let i = 0; i < GAME_OPTIONS.teams_count; ++i) {
                    let percentage = control_point_data.teams[i];
                    if (percentage <= 0) percentage = 0;
                    else {
                        // take back control by min(increment, current control on team)
                        if (percentage <= increment) {
                            control_point_data.neutral += percentage;
                            percentage = 0;
                        }
                        else {
                            control_point_data.neutral += increment;
                            percentage -= increment;
                        }
                    }
                    control_point_data.teams[i] = percentage;
                }
                
                let ghost_control = control_point_data.ghost;

                if (ghost_control <= 0) ghost_control = 0;
                else {
                    // same here, but ghost team
                    if (ghost_control <= increment) {
                        control_point_data.neutral += ghost_control;
                        ghost_control = 0;
                    }
                    else {
                        control_point_data.neutral += increment;
                        ghost_control -= increment;
                    }
                }

                control_point_data.ghost = ghost_control;
            }

            // control cap at 100%
            control_point_data.neutral = Math.min(control_point_data.neutral, 100);
        }
        else {
            // if there are players, calculate control

            if (control_point_data.neutral > 0) {
                // if the point still has its own control, steal it
                let total_control_lost = players.length * increment;
                if (total_control_lost > control_point_data.neutral) {
                    // steal from neutral too much?
                    increment = control_point_data.neutral / players.length;
                    control_point_data.neutral = 0;
                }
                else {
                    // nah, it's fine
                    control_point_data.neutral -= total_control_lost;
                }

                // benefit!
                for (let ship of players) {
                    if (Math.ceil(ship.team) === ship.team) control_point_data.teams[ship.team] += increment;
                    else control_point_data.ghost += increment;
                }
            }
            else {
                // just let teams steal control from each other

                // first, calculate number of ships and previous points on each team
                let teamControls = [
                    ...control_point_data.teams.map((control, index) => ({
                        index,
                        control,
                        steal_amount: increment, // % control loss per ship disadvantage
                        // later the value above would be lower if the "cake" is too small
                        ships: 0
                    })),
                    {
                        index: "ghost",
                        control: control_point_data.ghost,
                        steal_amount: increment,
                        ships: 0
                    }
                ];
                for (let ship of players) {
                    if (Math.ceil(ship.team) === ship.team) ++teamControls[ship.team].ships;
                    else ++teamControls.slice(-1)[0].ships
                }

                // sorting from smallest team to largest team (by ship count)
                // also filter out teams with 0% control and 0 ships
                teamControls = teamControls.filter(team => team.control > 0 || team.ships > 0).sort((a, b) => b.ships - a.ships);

                // stealing time
                // yes, this part's time complexity is O(n^2) where n is number of teams
                // but n is capped at 5, which should be 5^2 = 25
                // so it's fine unless your computer is a potato (definitely not a sarcasm)
                for (let teamControl of teamControls) {
                    // calculate ship disadvantage by count
                    let ships_disadvantage = 0; // later you'll know why
                    for (let team of teamControls) {
                        // skip its own team or teams with same count, of course
                        // or you can comment the line above, i won't judge
                        if (team.index == teamControl.index || team.ships == teamControl.ships) continue;
                        let ships_difference = team.ships - teamControl.ships;
                        
                        // if the difference is positive, it has disadvantages
                        // or else just bully the weaker team
                        if (ships_difference > 0) ships_disadvantage += ships_difference;
                        else teamControl.control += -ships_difference * team.steal_amount;
                    }
                    // if the disadvantage is 0 (aka no disadvantage), welp they're lucky
                    // or else, prepare for suffer
                    if (ships_disadvantage > 0) {
                        // how much will it lose?
                        let total_loss = ships_disadvantage * teamControl.steal_amount;
                        if (total_loss >= teamControl.control) {
                            // completely loss of control
                            teamControl.steal_amount = teamControl.control / ships_disadvantage;
                            teamControl.control = 0;
                        }
                        else teamControl.control -= total_loss; // welp, at least there's still something left
                    }

                    // update control result
                    let controlRes = Math.min(100, teamControl.control);
                    if (teamControl.index == "ghost") control_point_data.ghost = controlRes;
                    else control_point_data.teams[teamControl.index] = controlRes;
                }
            }
        }

        let maxControlTeam = [], maxControl = 0;

        // get the team(s) with highest control
        control_point_data.teams.forEach((control, index) => {
            if (control > maxControl) {
                maxControl = control;
                maxControlTeam = [index];
            }
            else if (maxControl == control) maxControlTeam.push(index);
        });

        if (control_point_data.ghost > maxControl) {
            maxControl = control_point_data.ghost;
            maxControlTeam = ["ghost"];
        }
        else if (maxControl == control_point_data.ghost) maxControlTeam.push("ghost");

        let scoreIncreased = false;

        // if there are team(s) with highest control meets the requirements
        // and ONLY one team has that control percentage
        // that team is winning
        if (maxControl >= CONTROL_POINT.control_bar.controlling_percentage && maxControlTeam.length == 1) {
            let winningTeam = maxControlTeam[0];
            if (maxControl >= CONTROL_POINT.control_bar.dominating_percentage) {
                scoreIncreased = true;
                if (winningTeam == "ghost") control_point_data.ghostScore += CONTROL_POINT.score_increase;
                else control_point_data.scores[winningTeam] += CONTROL_POINT.score_increase;
            }
            HelperFunctions.setControlPointOBJ(false, winningTeam);
        }
        else HelperFunctions.setControlPointOBJ(true); // or else it's still neutral

        // show results to players
        control_point_data.renderData(game, true);

        // show scores
        if (scoreIncreased || scoreIncreased != game.custom.scoreIncreased) {
            game.custom.scoreIncreased = scoreIncreased;
            UIData.renderTeamScores(game, true);
        }
        
        // timer
        HelperFunctions.sendUI(game, {
            id: "timer",
            position: [40,7.5,20,4],
            components: [
                { type: "text", position: [0, 0, 100, 100], value: HelperFunctions.toTimer(), color: "gray"}
            ]
        });

        // check if any endgame condition matches
        game.custom.timeout = HelperFunctions.timeExceeded(game.custom.startedStep, GAME_OPTIONS.duration * 60);
        let test = new Set(game.ships.filter(e => e && e.id != null).map(e => e.team));
        game.custom.oneTeamLeft = test.size < 2;
        if (game.custom.oneTeamLeft) game.custom.winner = [...test][0];
        if (game.custom.oneTeamLeft || game.custom.timeout || Math.max(...control_point_data.scores, control_point_data.ghostScore) >= GAME_OPTIONS.points) this.tick = endGame; 
    }
}

const endGame = function (game) {
    // declare the winner and set gameover timeout
    // game.custom.timeout --> timer ended
    // game.custom.winner --> winner id, either team id or "ghost"
    // game.custom.oneTeamLeft --> only one team left
    let message = "";
    switch (true) {
        case game.custom.timeout: message = "Time's Out!"; break;
        case game.custom.oneTeamLeft: message = "All players in other teams left!"; break;
        default: message = `One team reaches ${GAME_OPTIONS.points} points!`
    }
    if (!game.custom.oneTeamLeft) {
        let maxScore = Math.max(...control_point_data.scores, control_point_data.ghostScore);
        let index = control_point_data.scores.indexOf(maxScore);
        if (index < 0) index = "Ghost";
        game.custom.winner = index;
    }
    let winnerData = TeamManager.getData(game.custom.winner);
    HelperFunctions.sendUI(game, {
        id: "endgame_notification",
        position: [25, 20, 50, 10],
        components: [
            { type: "text", position: [0, 0, 100, 50], value: message, color: "#cde"},
            { type: "text", position: [0, 50, 50, 50], value: winnerData.name.toUpperCase(), color: HelperFunctions.toHSLA(winnerData.hue, 1, 100, UIData.colorTextLightness), align: "right"},
            { type: "text", position: [50, 50, 50, 50], value: " wins!", color: "#cde", align: "left"}
        ]
    });
    game.custom.endGameInfo = {
        "Status": message,
        "Results": `${winnerData.name.toUpperCase()} wins!`
    };
    HelperFunctions.sendUI(game, {
        id: "timer",
        position: [40,7.5,20,4],
        components: [
            { type: "text", position: [0, 0, 100, 100], value: "MATCH FINISHED!", color: "yellow"}
        ]
    });
    for (let ship of game.ships) {
        ship.custom.endGameTick = game.step;
    }
    this.tick = im_here_just_to_kick_every_players_out_of_the_game;
}

const im_here_just_to_kick_every_players_out_of_the_game = function (game) {
    alwaysTick(game);
    // yes kick everyone
    for (let ship of game.ships) {
        if (!ship.custom.kicked && (ship.custom.endGameTick == null || game.step - ship.custom.endGameTick > 5 * 60)) {
            ship.gameover(game.custom.endGameInfo);
            ship.custom.kicked = true;
        }
    }
}

if (DEBUG) {
    const debug = { ...this };
    debug.tick = initialization;
    this.tick = function (game) {
        try { debug.tick(game); } catch (e) { console.error(e) }
    }
}
else this.tick = initialization;

this.event = function (event, game) {
    AbilityManager.globalEvent(event, game);
    let ship = event.ship;
    if (ship == null || ship.id == null || ship.custom.kicked) return;
    switch (event.name) {
        case "ship_spawned":
            TeamManager.set(ship, void 0, false, true);
            HelperFunctions.resetIntrusionWarningMSG(ship);
            UIData.updateScoreboard(game);
            break;
        case "ship_destroyed":
            HelperFunctions.resetIntrusionWarningMSG(ship);
            ship.custom.deaths = (ship.custom.deaths + 1) || 1;
            let killer = event.killer;
            if (killer != null && killer.id != null && !killer.custom.kicked) {
                killer.custom.kills = (killer.custom.kills + 1) || 1;
            }
            UIData.updateScoreboard(game);
            break;
        case "ui_component_clicked":
            if (UIData.blockers.has(event.id)) break;
            if (ship.custom.lastClickedStep != null && game.step - ship.custom.lastClickedStep <= 0.2 * 60) break;
            ship.custom.lastClickedStep = game.step;
            let component = event.id;
            switch (component) {
                case UIData.shipUIs.toggleID:
                    UIData.shipUIs.toggle(ship);
                    break;
                case "next_ship": if (HelperFunctions.canUseButtons(ship)) {
                    let pos = AbilityManager.ships_list.indexOf(ship.custom.shipName) + 1;
                    AbilityManager.assign(ship, AbilityManager.ships_list[pos] || AbilityManager.ships_list[0]);
                    UIData.shipUIs.toggleSelectMenu(ship);
                    break;
                }
                case "prev_ship": if (HelperFunctions.canUseButtons(ship)) {
                    let pos = AbilityManager.ships_list.lastIndexOf(ship.custom.shipName) - 1;
                    AbilityManager.assign(ship, AbilityManager.ships_list.at(pos));
                    UIData.shipUIs.toggleSelectMenu(ship);
                    break;
                }
                default:
                    if (HelperFunctions.canUseButtons(ship) && component.startsWith(UIData.shipUIs.shipSelectPrefix)) {
                        AbilityManager.assign(ship, component.replace(UIData.shipUIs.shipSelectPrefix, ""));
                        UIData.shipUIs.toggleSelectMenu(ship);
                    }
            }
    }
}

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
    { text: "Hmm", icon:"\u004b", key:"Q" },
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
    custom_map: MapManager.get(true).map,
    speed_mod: 1.2,
    radar_zoom: 1,
    weapons_store: false,
    crystal_value: 0,
    crystal_drop: 0.6,
    asteroids_strength: 2,
    soundtrack: "crystals.mp3", //civilisation.mp3 | procedurality.mp3 | argon.mp3 | crystals.mp3
    healing_ratio: GAME_OPTIONS.healing_ratio, // better to set the ability ship's damage rather than setting this option
    mines_self_destroy: true,
    mines_destroy_delay: 5000,
    map_size: GAME_OPTIONS.map_size,
    friendly_colors: GAME_OPTIONS.teams_count,
    max_players: GAME_OPTIONS.max_players,
    ships: [
        '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}',
        ...AbilityManager.getShipCodes()
    ],
    hues: TeamManager.getAll().map(e => e ? e.hue : 0)
}

AbilityManager.echo("[[bg;crimson;]Arena Mod[[bg;DarkTurquoise;] Recontinuation][[;Cyan;]\nRandomized map picked:]][[b;Cyan;] " + MapManager.get().name + " by " + MapManager.get().author + "\n\nType `commands` to see all commands and `usage <commandName>` to show usage of a command\n\n]");