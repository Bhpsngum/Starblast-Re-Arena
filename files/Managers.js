const TeamManager = {
    ghostTeam: GhostTeam,
    staticList: StaticTeams.map(v => {
        let x = Teams[v];
        Teams[v] = null;
        return x;
    }),
    teams_list: Teams.filter(t => t),
    initialize: function () {
        this.teams = game.custom.teams;
        if (this.teams == null) {
            this.teams = game.custom.teams = new Array(GAME_OPTIONS.teams_count);
            let teams = [...Array(GAME_OPTIONS.teams_count)].map((v, i)=> i);
            while (teams.length > 0) {
                let i = HelperFunctions.randomItem(teams, true).value;
                let chosenTeam;
                if (this.staticList.length > 0) chosenTeam = HelperFunctions.randomItem(this.staticList, true).value;
                else chosenTeam = HelperFunctions.randomItem(this.teams_list, true).value;
                let { index } = HelperFunctions.randomItem(chosenTeam.names);
                this.teams[i] = {
                    ...chosenTeam,
                    name: chosenTeam.names[index],
                    hue: chosenTeam.hues[index],
                    id: i
                };
            }
        };
    },
    getAll: function () {
        if (!Array.isArray(this.teams)) this.initialize();
        return this.teams;
    },
    getDataFromID: function (team) {
        return this.getAll()[team] || this.ghostTeam;
    },
    getDataFromShip: function (ship) {
        return this.getDataFromID((ship.custom == null || ship.custom.team == null) ? ship.team : ship.custom.team);
    },
    setGhostTeam: function (ship, changeTeam = false, TpBackToBase = false) {
        this.set(ship, 69, changeTeam, TpBackToBase)
    },
    set: function (ship, team = ship.team, changeTeam = false, TpBackToBase = false) {
        let teamData = this.getDataFromID(team);
        ship.set({hue: teamData.hue});
        if (changeTeam) {
            ship.set({team: teamData.id});
            ship.custom.team = teamData.id;
            AbilityManager.updateShipsList(teamData);
        }
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
            try { game.setCustomMap(this.map.map); } catch (e) {}
            this.assignSpawnpoints();
        }
        return this.map;
    },
    sortPairings: function (pairs, dist) {
        return pairs.sort((p1, p2) => {
            if (p1.length == p2.length) return HelperFunctions.randInt(2) || -1;
            let absoluteDistance = Math.abs(dist - p1.length) - Math.abs(dist - p2.length);

            if (absoluteDistance == 0) return p2.length - p1.length;

            return absoluteDistance;
        }); // no invalid pairs
    },
    assignSpawnpoints: function () {
        let teams = TeamManager.getAll(), { spawnpoints, pairings } = this.get();

        if (!Array.isArray(spawnpoints) || spawnpoints.length < 1) return;

        let pairs = pairings;

        if (Array.isArray(pairs)) pairs = this.sortPairings(HelperFunctions.clone(pairs).filter(e => Array.isArray(e) && e.length > 0), GAME_OPTIONS.teams_count);
        else pairs = [];

        if (pairs.length < 1) pairs = [ // placeholder
            new Array(spawnpoints.length).fill(0).map((e, i) => i)
        ];

        let curPair = pairs.shift(), dist = GAME_OPTIONS.teams_count;

        for (let team of teams) if (team && team.need_spawnpoint) {
            if (curPair.length < 1) { // current candidate has no spawnpoints
                if (pairs.length < 1) break; // no more pairs
                curPair = this.sortPairings(pairs, dist).shift();
            }

            --dist;

            let val = HelperFunctions.randomItem(curPair, true).value;

            let i = 0;

            while (i < pairs.length) { // delete all pairs with duplicate index
                if (pairs[i].indexOf(val) < 0) ++i;
                else pairs.splice(i, 1);
            }
            
            team.spawnpoint = spawnpoints[val];
        }
    },
    spawn: function (ship) {
        let { spawnpoint } = TeamManager.getDataFromShip(ship);
        if (spawnpoint != null) {
            let distance = Math.random() * BASES.size, angle = Math.random() * 2 * Math.PI;
            ship.set({
                x: spawnpoint.x + distance * Math.cos(angle) ,
                y: spawnpoint.y + distance * Math.sin(angle)
            });
        }
        if (game.custom.abilitySystemEnabled) UIData.shipUIs.toggle(ship, false, true);
    },
    set: function (nameOrIndex, set = false) {
        this.map = this.maps[nameOrIndex] || this.maps.find(m => m.name.toLowerCase() == String(nameOrIndex).toLowerCase());
        return this.get(set);
    }
}

const AbilityManager = {
    includeRingOnModel: false, // the individual ship's ring model inclusion are only checked if this one is `true`
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
    usageLimit: 3, // default value for `abilityShip.usageLimit`
    // minimum value depends on number of max players, number of teams, and number of ship templates on this system.
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
        return game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled && ship.alive && !this.isActionBlocked(ship).blocked && ship.custom.ability.canStart(ship);
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
        if (!game.custom.abilitySystemEnabled || ship == null || ship.custom.abilitySystemDisabled || !ship.alive) return { ready: false, text: "Disabled" }
        let ability = ship.custom.ability;
        let isActionBlocked = this.isActionBlocked(ship);
        if (isActionBlocked.blocked) return { ready: false, text: isActionBlocked.blocker.abilityDisabledText || "Disabled" };
        if (ability == null) return { ready: false, text: "Disabled" };
        let ready = this.canStart(ship);
        if (ready) return {
            ready: true,
            text: ability.useRequirementsTextWhenReady ? ability.requirementsText(ship) : "Ready"
        };
        return {
            ready: false,
            text: ship.custom.inAbility && ability.cooldownRestartOnEnd && !ability.customDisabledText ? "In Ability" : ability.requirementsText(ship)
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
    isActionBlocked: function (ship) {
        // check if there are any ship effects blocking this ship from taking actions
        for (let actionBlocker of this.shipActionBlockers) {
            if ("function" == typeof actionBlocker.checker && actionBlocker.checker(ship)) return {
                blocked: true,
                blocker: actionBlocker
            }
        }

        return { blocked: false }
    },
    limitExceeded: function (shipName, ship) {
        return this.abilities[shipName] != null && shipName != ship.custom.shipName && !this.getAssignableShipsList(ship).includes(shipName);
    },
    assign: function (ship, abilityShip, dontAssign = false) {
        if (ship.custom.inAbility) return { success: false, reason: "Ship is still in ability" }
        let isActionBlocked = this.isActionBlocked(ship);
        if (isActionBlocked.blocked) return {
            success: false,
            reason: isActionBlocked.blocker.reason || "No reason was provided"
        }
        let shipAbil = this.abilities[abilityShip];
        if (shipAbil == null) {
            let requestedName = String(abilityShip).toLowerCase().replace(/[^a-z0-9]/gi, "");
            let foundName = this.ships_list.find(name => name.toLowerCase().replace(/[^a-z0-9]/gi, "") == requestedName);
            if (foundName != null) shipAbil = this.abilities[abilityShip = foundName];
        }
        if (this.limitExceeded(abilityShip, ship)) return { success: false, reason: "Ship limit exceeded" }
        if (dontAssign) return { success: true }
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
        this.updateShipsList(TeamManager.getDataFromShip(ship));
        return { success: true };
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
                ship.custom.__ability__initialized__ = true;
            }
            if (this.showAbilityNotice && ship.custom.allowInstructor) {
                if (this.abilityNoticeMessage) {
                    ship.instructorSays(String(this.abilityNoticeMessage(ship)), TeamManager.getDataFromShip(ship).instructor);
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
        if (ship == null || !ship.custom.__ability__initialized__) return;
        switch (event.name) {
            case "ui_component_clicked":
                let component = event.id;
                switch (component) {
                    case AbilityManager.UI.id:
                        AbilityManager.start(ship);
                        break;
                }
                break;
            case "ship_spawned":
                ship.set({crystals: ship.custom.ability.crystals});
                if (ship.custom.ability && ship.custom.ability.endOnDeath) ship.custom.lastTriggered = game.step;
                break;
        }
        AbilityManager.event(event, ship);
        if (event.killer != null) AbilityManager.event(event, event.killer);
        for (let ability of Object.values(AbilityManager.abilities)) {
            if ("function" == typeof ability.globalEvent) ability.globalEvent(event);
        }
    },
    initialize: function () {
        this.compileAbilities();
        
        // for debug issues
        if (game.custom.AbilityManager) {
            for (let ship of game.ships) {
                let ability = AbilityManager.abilities[ship.custom.shipName];
                if (ability != null) ship.custom.ability = ability;
                else AbilityManager.random(ship);
            }
        }

        game.custom.AbilityManager = AbilityManager;

        if (DEBUG) {
            let gb = window || global;

            gb.AbilityManager = AbilityManager;
            gb.TeamManager = TeamManager;
            gb.MapManager = MapManager;

            MAKE_COMMANDS();
        }
    },
    compileAbilities: function () {
        // Compile ships and abilities
        
        this.ship_codes = [];
        this.shipActionBlockers = [];

        let smallestLimit = Math.ceil(GAME_OPTIONS.max_players / GAME_OPTIONS.teams_count / Object.values(this.abilities).filter(e => !e.hidden).length);

        this.usageLimit = Math.max(this.usageLimit, smallestLimit) || Infinity;

        let model = 100, templates = HelperFunctions.templates;

        for (let shipName in this.abilities) {
            let ability = this.abilities[shipName];
            // delete hidden ones
            if (ability.hidden != null && ability.hidden) {
                delete this.abilities[shipName];
                HelperFunctions.terminal.log(`Ignoring '${shipName}' because it's hidden`);
                continue;
            }
            // functions and properties polyfill

            if (ability.actionBlocker != null) this.shipActionBlockers.push(ability.actionBlocker);

            ability.ships = new Map();

            ability.tickInterval = Math.floor(Math.max(ability.tickInterval, 1)) || 1;

            ability.crystals = Math.max(0, ability.crystals);

            if (isNaN(ability.crystals)) ability.crystals = this.crystals;

            ability.usageLimit = Math.max(ability.usageLimit, smallestLimit) || this.usageLimit;

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
            ability.energy_capacities = {};
            for (let shipAbilityName in ability.models) try {
                let jsonData = JSON.parse(ability.models[shipAbilityName]);
                if (jsonData == null || jsonData.typespec == null) throw "No ship data or typespec";
                jsonData.level = jsonData.typespec.level = this.shipLevels;
                jsonData.model = --model;

                ability.codes[shipAbilityName] = jsonData.typespec.code = this.shipLevels * 100 + model;
                ability.energy_capacities[shipAbilityName] = Math.max(...jsonData.specs.generator.capacity);

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

            ability.generatorInit = Math.min(1e5, Math.max(0, ability.generatorInit));

            if (isNaN(ability.generatorInit)) ability.generatorInit = ability.energy_capacities.default;
            
            if (!ability.codes.default) HelperFunctions.terminal.error(`Missing 'default' model for '${shipName}'.`);
            if (needAbilityShip && !ability.codes.ability) HelperFunctions.terminal.error(`'${shipName}' uses default ability behaviour but model 'ability' is missing.`);
        }

        if (this.ship_codes.length < 1) HelperFunctions.terminal.error(`No ships found. What the f*ck?`);

        this.ships_list = Object.keys(this.abilities);
    },
    getAssignableShipsList: function (ship, forceUpdate = false) {
        let teamData = TeamManager.getDataFromShip(ship);
        if (forceUpdate || !Array.isArray(teamData.ships_list)) this.updateShipsList(teamData);
        return teamData.ships_list
    },
    updateShipsList: function (team) {
        team.ships_list = [];
        let data = {};
        for (let ship of game.ships) {
            if (ship == null || ship.id == null || ship.custom.abilitySystemDisabled) continue;
            let t = TeamManager.getDataFromShip(ship);
            if (team.ghost ? !t.ghost : team.id !== t.id) continue;
            data[ship.custom.shipName] = (+data[ship.custom.shipName] || 0) + 1;
        }

        for (let abil of this.ships_list) {
            if ((+data[abil] || 0) < AbilityManager.abilities[abil].usageLimit) team.ships_list.push(abil);
        }
    },
    getShipCodes: function () {
        if (!Array.isArray(this.ship_codes)) this.initialize();
        return this.ship_codes;
    },
    random: function (ship) {
        // select random ship
        return this.assign(ship, HelperFunctions.randomItem(this.getAssignableShipsList(ship)).value);
    },
    abilities: ShipAbilities
}