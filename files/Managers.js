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
    maps: (function() {
        let spawnpoints_count = TeamManager.getAll().filter(t => t.need_spawnpoint).length + !!TeamManager.ghostTeam.need_spawnpoint;
        return Maps.filter(e => e.spawnpoints.length >= spawnpoints_count)
    })(),
    search: function (nameOrIndex) {
        if (nameOrIndex == null) return null;
        return this.maps[nameOrIndex] || this.maps.find(m => m.name.toLowerCase() == String(nameOrIndex).toLowerCase());
    },
    get: function (set = false, forceReset = false) {
        if (this.map == null || forceReset) {
            this.map = this.search(GAME_OPTIONS.map_preset_name);
            if (this.map == null) this.map = HelperFunctions.randomItem(this.maps).value;
        }
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
        let teams = [...TeamManager.getAll(), TeamManager.ghostTeam], { spawnpoints, pairings } = this.get();

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
    },
    set: function (nameOrIndex, set = false) {
        this.map = this.search(nameOrIndex);
        return this.get(set);
    }
}

const AbilityManager = {
    includeRingOnModel: GAME_OPTIONS.ability.include_rings_on_model,
    showAbilityNotice: GAME_OPTIONS.ability.notice.show,
    abilityNoticeTimeout: GAME_OPTIONS.ability.notice.timeout,
    abilityNoticeMessage: GAME_OPTIONS.ability.notice.message,
    abilityShortcut: GAME_OPTIONS.ability.shortcut,
    shipLevels: GAME_OPTIONS.ability.ship_levels,
    model_conversion_ratio: 50, // don't change
    maxStats: GAME_OPTIONS.ability.max_stats,
    crystals: GAME_OPTIONS.ability.crystals,
    usageLimit: GAME_OPTIONS.ability.usage_limit,
    updateDelay: 5, // technical spec, don't touch if you don't know what it does
    UIActionsDelay: 0.2 * 60,
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
    requestEntitiesInfoUpdate: function () {
        // request entities info updates so they could be available on the next ticks
        if (!game.custom.abilityCustom.entitiesUpdateRequested) {
            let entities = [...game.ships, ...game.aliens, ...game.asteroids];
            for (let entity of entities) {
                if (entity != null && entity.id != null && entity.id != -1) entity.set({});
            }
            game.custom.abilityCustom.entitiesUpdateRequested = true;
        }
    },
    tick: function (ship) {
        this.updateUI(ship);
        let ability = ship.custom.ability;
        if (!ship.custom.inAbility || ability == null) return;
        let timePassed = game.step - ship.custom.lastTriggered
        if (timePassed % ability.tickInterval === 0) ability.tick(ship, timePassed);
        if (ability.customEndcondition && (ship.custom.forceEnd || ability.canEnd(ship))) this.end(ship);
    },
    end: function (ship) {
        let ability = ship.custom.ability;
        if (ability == null) return;
        ship.custom.inAbility = false;
        ship.custom.forceEnd = false;
        HelperFunctions.TimeManager.clearTimeout(ability.ships.get(ship.id));
        ability.ships.delete(ship.id);
        if (ability.cooldownRestartOnEnd) ability.unload(ship);
        ability.end(ship);
        if ("function" == typeof this.onAbilityEnd) this.onAbilityEnd(ship);
    },
    canStart: function (ship) {
        return game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled && ship.alive && !this.isAbilityBlocked(ship).blocked && ship.custom.ability.canStart(ship);
    },
    start: function (ship) {
        let ability = ship.custom.ability;
        if (ability == null || !ability.canStart(ship) || (!ability.canStartOnAbility && ship.custom.inAbility) || !ship.alive) return;

        ship.custom.lastTriggered = game.step;
        ship.custom.forceEnd = false;
        let lastStatus = ship.custom.inAbility;
        ship.custom.inAbility = true;
        ability.start(ship, lastStatus);
        if (ability.duration != null) {
            let oldTimeout = ability.ships.get(ship.id);
            if (oldTimeout != null) HelperFunctions.TimeManager.clearTimeout(oldTimeout);
            ability.ships.set(ship.id, HelperFunctions.TimeManager.setTimeout(function () {
                this.end(ship);
            }.bind(this), ability.duration));
        }

        if ("function" == typeof this.onAbilityStart) this.onAbilityStart(ship, lastStatus);
    },
    requirementsInfo: function (ship) {
        if (!game.custom.abilitySystemEnabled || ship == null || ship.custom.abilitySystemDisabled || !ship.alive) return { ready: false, text: "Disabled" }
        let ability = ship.custom.ability;
        let isActionBlocked = this.isAbilityBlocked(ship);
        if (isActionBlocked.blocked) return { ready: false, text: isActionBlocked.blocker.abilityDisabledText || "Disabled" };
        if (ability == null) return { ready: false, text: "Disabled" };
        let ready = this.canStart(ship);
        if (ready) return {
            ready: true,
            text: ability.useRequirementsTextWhenReady ? ability.requirementsText(ship) : "Ready"
        };
        return {
            ready: false,
            text: ship.custom.inAbility && ability.cooldownRestartOnEnd && !ability.customInAbilityText ? "In Ability" : ability.requirementsText(ship)
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
                    { type: "box",position:[0,50,100,50],fill: color.fill, stroke: color.stroke,width:4},
                    { type: "text",position:[2.5,57.5,95,35],value: text ,color: color.text},
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
            let { ability, shipChange } = actionBlocker;
            if ("function" == typeof ability.checker && ability.checker(ship))  return {
                blocked: true,
                blocker: ability
            }

            if ("function" == typeof shipChange.checker && shipChange.checker(ship))  return {
                blocked: true,
                blocker: shipChange
            }
        }

        return { blocked: false }
    },
    isAbilityBlocked: function (ship) {
        // check if there are any ship effects blocking this ship from starting abilities
        for (let actionBlocker of this.shipActionBlockers) {
            let { ability } = actionBlocker;
            if ("function" == typeof ability.checker && ability.checker(ship))  return {
                blocked: true,
                blocker: ability
            }
        }

        return { blocked: false }
    },
    clearAllActionBlockers: function (ship) {
        for (let actionBlocker of this.shipActionBlockers) {
            let { ability, shipChange } = actionBlocker;
            if ("function" == typeof ability.clear) ability.clear(ship);
            if ("function" == typeof shipChange.clear) shipChange.clear(ship);
        }
    },
    limitExceeded: function (shipName, ship) {
        return this.abilities[shipName] != null && shipName != ship.custom.shipName && !this.getAssignableShipsList(ship).includes(shipName);
    },
    assignStatus: {
        limitExceeded: {
            code: "SHIP_LIMIT_EXCEEDED",
            message: "Ship limit exceeded"
        },
        actionBlocked: {
            code: "SHIP_ACTION_BLOCKED"
        },
        inAbility: {
            code: "IN_ABILITY",
            reason: "Ship is still in ability"
        },
        success: {
            code: "SUCCESS"
        },
        sixtyNine: {
            code: "69",
            reason: "Nice"
        }
    },
    assign: function (ship, abilityShip, dontAssign = false, bypass = {
        // object used to bypass checks (set to `true` to take effect)
        ability: false, // bypass ability checks
        blocker: false, // bypass action blocker checks
        limit: false // bypass ship limit checks
        // additionally, you can set `bypass` to `true` to basically bypass everything
        // (basically a forced set)
    }, ignoreReset = {
        // ignore reset options
        blocker: false // ignore clearing blockers when set, this might be the only option available
    }) {
        bypass = bypass || {};
        let forced = bypass === true;
        if (!forced) {
            if (!bypass.ability && ship.custom.inAbility) return { success: false, ...this.assignStatus.inAbility }
            let isActionBlocked = bypass.blocker ? { blocked: false } : this.isActionBlocked(ship);
            if (isActionBlocked.blocked) return {
                success: false,
                ...this.assignStatus.actionBlocked,
                reason: isActionBlocked.blocker.reason || "No reason was provided"
            }
        }
        let shipAbil = this.abilities[abilityShip];
        if (shipAbil == null) {
            let requestedName = String(abilityShip).toLowerCase().replace(/[^a-z0-9]/gi, "");
            let foundName = this.ships_list.find(name => name.toLowerCase().replace(/[^a-z0-9]/gi, "") == requestedName);
            if (foundName != null) shipAbil = this.abilities[abilityShip = foundName];
        }
        if (!forced && !bypass.limit && this.limitExceeded(abilityShip, ship)) return { success: false, ...this.assignStatus.limitExceeded }
        if (dontAssign) return { success: true, ...this.assignStatus.success }
        if (shipAbil == null) return this.random(ship, forced);
        if (ship.custom.inAbility) this.end(ship);
        ignoreReset = ignoreReset || {};
        let ignoreAll = ignoreReset === true;
        if (!ignoreAll && !ignoreReset.blocker) {
            this.clearAllActionBlockers(ship);
            ship.set({
                healing: false,
                collider: true,
                idle: false
            });
        }
        ship.custom.shipName = abilityShip;
        ship.custom.ability = shipAbil;
        ship.custom.inAbility = false;
        ship.custom.forceEnd = false;
        ship.custom.abilityCustom = {};
        ship.custom.lastUI = {};
        ship.set({
            type: shipAbil.codes.default,
            generator: shipAbil.generatorInit,
            stats: AbilityManager.maxStats
        });
        shipAbil.initialize(ship);
        shipAbil.unload(ship);
        this.updateShipsList(TeamManager.getDataFromShip(ship));
        return { success: true };
    },
    restore: function (ship) {
        let abil = ship.custom.ability || {};
        if (ship != null) ship.set({
            shield: 1e4,
            crystals: abil.crystals || 0
        });
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
    abilityRangeUI: {
        width: 2,
        id: "abilityRange",
        optionUI: {
            prefix: "preset_change_",
            infoID: "preset_info",
            data: {
                position: [65, 0, 15, 5],
                components: [
                    { type: "text", position: [0, 0, 100, 50], value: "RATIO GO HERE", color: "#cde", align: "right"},
                    { type: "text", position: [0, 50, 100, 50], value: "[0] - [9] to change", color: "#cde", align: "right"}
                ]
            }
        },
        renderInfo: function (ship) {
            let UI = {
                id: this.optionUI.presetInfo,
                ...this.optionUI.data
            }, preset = this.getPreset(ship);

            UI.components[0].value = `Aspect Ratio ${preset.w}:${preset.h} [${(ship.custom.preferredRatioPreset + 1) % 10}]`;

            HelperFunctions.sendUI(ship, UI);
        },
        handleOptions: function (ship, id) {
            if (!id.startsWith(this.optionUI.prefix)) return;
            let oldPresetIndex = ship.custom.preferredRatioPreset;
            let option = id.replace(this.optionUI.prefix, "");
            ship.custom.preferredRatioPreset = option == "next" ? ++ship.custom.preferredRatioPreset : +option;
            this.getPreset(ship);
            if (ship.custom.preferredRatioPreset === oldPresetIndex) return;
            this.renderInfo(ship);
            this.set(ship);
        },
        showOptions: function (ship) {
            if ((ship || {}).id == null) return;
            for (let i = 0; i < 10; ++i) { // yes this part is hardcoded
                HelperFunctions.sendUI(ship, {
                    id: this.optionUI.prefix + i,
                    visible: false,
                    clickable: true,
                    shortcut: ((i + 1) % 10).toString() // 1 2 3 4 5 6 7 8 9 0
                });
            }

            HelperFunctions.sendUI(ship, {
                id: this.optionUI.prefix + "next",
                clickable: true,
                position: [75, 5, 5, 2.5],
                components: [
                    { type: "box", position: [0, 0, 100, 100], stroke: "#cde", width: 2},
                    { type: "text", position: [0, 0, 100, 100], value: "Change", color: "#cde"}
                ]
            })
        },
        color: "#cde",
        vertical_scale: 1.425, // we will scale using vertical ratio as base
        presets: [
            // most popular ratio
            {w: 16, h: 9},
            // pc/laptop ratios
            {w: 16, h: 10}, // hello mac users :)
            {w: 4, h: 3},
            // phone ratios
            {w: 18, h: 9},
            {w: 19.5, h: 9},
            {w: 21, h: 9},
            // others
            {w: 1, h: 1} // S Q U A R E
        ],
        getPreset: function (ship) {
            let x = ship.custom.preferredRatioPreset;
            let preset = this.presets[x] || this.presets[x = 0];
            ship.custom.preferredRatioPreset = x;
            return preset;
        },
        threeJSClientSpecs: {
            // most of this are from Starblast client anyway
            // might subject to change in the future if the client updates
            cameraZ: 70, // 140 in welcome screen, but it's useless because who plays arena mod on welcome screen...?
            defaultAngle: Math.PI / 4,
            getZoom: function (zoom, radius) { return Math.pow(radius / 3, 0.3) / zoom },
            angle: function (zoom, radius) { return this.getZoom(zoom, radius) * this.defaultAngle },
            calculatePlaneScale: function (zoom, radius) {
                // https://stackoverflow.com/a/15331885
                return 2 * Math.tan(this.angle(zoom, radius) / 2);
            },
            getVisibleHeightFraction: function (range, shipRadius, zoom, scale) {
                return scale * (range * 2) / this.calculatePlaneScale(zoom, shipRadius);
            }
        },
        set: function (ship) {
            if ((ship || {}).id == null) return;
            
            let shipAbil = ship.custom.ability;

            if (!(shipAbil || {}).showAbilityRangeUI || shipAbil.range == null) return HelperFunctions.sendUI(ship, { id: this.id, visible: false});

            let preset = this.getPreset(ship);

            let zoomLevel = AbilityManager.zoomLevel[ship.custom.__last_ability_ship_type__ || ship.type] || {};

            // render abilityRange UI here
            let height = this.threeJSClientSpecs.getVisibleHeightFraction(shipAbil.range, zoomLevel.radius || 1, zoomLevel.zoom || 1, this.vertical_scale);
            let width = height * preset.h / preset.w;

            HelperFunctions.sendUI(ship, {
                id: this.id,
                position: [(100 - width) / 2, (100 - height) / 2, width, height],
                components: [
                    { type: "round", position: [0, 0, 100, 100], stroke: this.color, width: this.width }
                ]
            });
        }
    },
    globalTick2: function (game) {
        game.custom.abilityCustom.entitiesUpdateRequested = false;
        HelperFunctions.TimeManager.tick();
        for (let ability of Object.values(this.abilities)) {
            if ("function" == typeof ability.globalTick) ability.globalTick(game);
        }
        let oldList = game.custom.__ability_manager_players_list__;
        if (!Array.isArray(oldList)) oldList = [];
        let newList = [];

        for (let ship of game.ships) {
            if (ship.id == null) continue;
            if (!ship.custom.__ability__initialized__ && ship.alive) {
                this.random(ship, true);
                this.abilityRangeUI.showOptions(ship);
                this.abilityRangeUI.renderInfo(ship);
                ship.custom.__ability__initialized__ = true;
            }
            if (this.showAbilityNotice && ship.custom.allowInstructor) {
                if (this.abilityNoticeMessage) {
                    ship.instructorSays(String(this.abilityNoticeMessage.call(GAME_OPTIONS, ship)), TeamManager.getDataFromShip(ship).instructor);
                    if (this.abilityNoticeTimeout > 0) HelperFunctions.TimeManager.setTimeout(function () {
                        ship.hideInstructor();
                    }, this.abilityNoticeTimeout);
                }
                ship.custom.allowInstructor = false;
            }
            if (ship.custom.__ability__initialized__) {
                if (ship.type != ship.custom.__last_ability_ship_type__) {
                    ship.custom.__last_ability_ship_type__ = ship.type;
                    this.abilityRangeUI.set(ship);
                }
                if (game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled) {
                    newList.push({ id: ship.id, team: TeamManager.getDataFromShip(ship) });
                    let oldIndex = oldList.findIndex(s => s.id === ship.id);
                    if (oldIndex >= 0) oldList.splice(oldIndex, 1);
                }
                this.tick(ship);
            }
            let lastStatus = !!ship.custom.lastActionBlockerStatus;
            let currentStatus = AbilityManager.isActionBlocked(ship).blocked;
            if ("function" == typeof this.onActionBlockStateChange && lastStatus != currentStatus) this.onActionBlockStateChange(ship);
            ship.custom.lastActionBlockerStatus = currentStatus;
        }

        if (oldList.length > 0) {
            let teams = [...new Set(oldList.map(e => e.team))];
            for (let team of teams) this.updateShipsList(team);
        }

        game.custom.__ability_manager_players_list__ = newList;
    },
    globalEvent: function (event, game) {
        let ship = event.ship;
        if (ship == null || ship.id == null || !ship.custom.__ability__initialized__ || ship.custom.ability == null) return;
        switch (event.name) {
            case "ui_component_clicked":
                let component = event.id;
                switch (component) {
                    case this.UI.id:
                        this.start(ship);
                        break;
                    default:
                        if (ship.custom.__abilitySystem_last_ui_action__ != null && game.step - ship.custom.__abilitySystem_last_ui_action__ <= this.UIActionsDelay) break;
                        ship.custom.__abilitySystem_last_ui_action__ = game.step;
                        this.abilityRangeUI.handleOptions(ship, component);
                }
                break;
            case "ship_spawned":
                ship.set({crystals: ship.custom.ability.crystals});
                if (!ship.custom.inAbility || ship.custom.ability.endOnDeath) ship.custom.ability.unload(ship);
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
        let oldAbilityManager = game.custom.AbilityManager;
        if (oldAbilityManager != null) {
            // preserve ability templates so it won't break
            for (let abil in oldAbilityManager.abilities) {
                let ability = oldAbilityManager.abilities[abil], newAbility = AbilityManager.abilities[abil];
                if (newAbility != null) newAbility.ships = ability.ships;
                ability.onCodeChanged(newAbility);
            }

            // reset abilities on ships
            for (let ship of game.ships) {
                if (ship.custom.abilityCustom == null) ship.custom.abilityCustom = {};
                oldAbilityManager.end(ship);
                let ability = AbilityManager.abilities[ship.custom.shipName];
                if (ability != null) ship.custom.ability = ability;
                else AbilityManager.random(ship, true);
            }
        }

        game.custom.AbilityManager = AbilityManager;

        if (game.custom.abilityCustom == null) game.custom.abilityCustom = {};

        if (DEBUG) {
            let gb = window || global;

            gb.AbilityManager = AbilityManager;
            gb.TeamManager = TeamManager;
            gb.MapManager = MapManager;

            game.custom.abilitySystemCommands = MAKE_COMMANDS();

            let systemInfo = __ABILITY_SYSTEM_INFO__;

            let resourceLink = `https://github.com/Bhpsngum/Arena-mod-remake/blob/main/releases/${systemInfo.name}_v${systemInfo.version}_${systemInfo.branch}.js`;

            fetch(resourceLink + '?raw=true').then(data => data.text().then(text => {
                let latestBuildID = (text.match(/buildID:\s*"([a-f0-9]+)"/) || [])[1];
                if (latestBuildID != systemInfo.buildID) $("#terminal").terminal().echo(`\n\nNOTICE: Newer build ([[;#AAFF00;]${latestBuildID}]) detected!\nYou can get it through `, {
                    finalize: function (div) {
                        div.children().last().append(`<a href="${resourceLink}" target="_blank">this link.</a><br><br>`)
                    }
                })
            })).catch(e => {
                game.modding.terminal.error("Failed to fetch source version info");
            });
        }
    },
    compileAbilities: function () {
        // Compile ships and abilities
        
        this.ship_codes = [];
        this.shipActionBlockers = [];
        this.zoomLevel = {};

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

            ability.shipName = shipName;

            let actionBlocker = {};
            if (ability.actionBlocker != null) actionBlocker.shipChange = actionBlocker.ability = ability.actionBlocker;
            else {
                actionBlocker.shipChange = ability.shipChangeBlocker;
                actionBlocker.ability = ability.abilityBlocker;
            }

            if (actionBlocker.shipChange != null || actionBlocker.ability != null) {
                actionBlocker.shipChange = actionBlocker.shipChange || {};
                actionBlocker.ability = actionBlocker.ability || {};
                this.shipActionBlockers.push(actionBlocker);
            }

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

            // don't ask why

            if ("function" != typeof ability.end) ability.end = templates.end;

            if ("function" != typeof ability.tick) ability.tick = templates.tick;

            if ("function" != typeof ability.event) ability.event = templates.event;

            if ("function" != typeof ability.requirementsText) ability.requirementsText = templates.requirementsText;

            if ("function" != typeof ability.reload) ability.reload = templates.reload;

            if ("function" != typeof ability.unload) ability.unload = templates.unload;

            if ("function" != typeof ability.abilityName) ability.abilityName = templates.abilityName;

            if ("function" != typeof ability.initialize) ability.initialize = templates.initialize;

            if ("function" != typeof ability.onCodeChanged) ability.onCodeChanged = templates.onCodeChanged;

            if ("function" != typeof ability.getDefaultShipCode) ability.getDefaultShipCode = templates.getDefaultShipCode;

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

                jsonData.typespec.__ABILITY_SYSTEM_INFO__ = __ABILITY_SYSTEM_INFO__;

                this.ship_codes.push(JSON.stringify(jsonData));
                this.zoomLevel[jsonData.typespec.code] = {
                    zoom: jsonData.zoom || 1,
                    radius: jsonData.typespec.radius || 1
                };
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

        this.ships_list = Object.keys(this.abilities).sort();
    },
    getAssignableShipsList: function (ship, forceUpdate = false) {
        let teamData = TeamManager.getDataFromShip(ship);
        if (forceUpdate || !Array.isArray(teamData.ships_list)) this.updateShipsList(teamData);
        return teamData.ships_list
    },
    updateShipsList: function (team) {
        let oldList = Array.isArray(team.ships_list) ? [...team.ships_list] : [];
        team.ships_list = [];
        let newList = [];
        let data = {};
        for (let ship of game.ships) {
            if (ship == null || ship.id == null || ship.custom.abilitySystemDisabled) continue;
            let t = TeamManager.getDataFromShip(ship);
            if (team.ghost ? !t.ghost : team.id !== t.id) continue;
            data[ship.custom.shipName] = (+data[ship.custom.shipName] || 0) + 1;
        }

        for (let abil of this.ships_list) {
            if ((+data[abil] || 0) < AbilityManager.abilities[abil].usageLimit) {
                team.ships_list.push(abil);
                let oldIndex = oldList.indexOf(abil);
                if (oldIndex < 0) newList.push(abil);
                else oldList.splice(oldIndex, 1);
            }
        }

        if ((oldList.length > 0 || newList.length > 0) && "function" == typeof this.onShipsListUpdate) this.onShipsListUpdate(team, newList, oldList);
        // update func:
        // team: team needs to be updated
        // newList: new allowed ships
        // oldList: new disabled ships
    },
    getShipCodes: function () {
        if (!Array.isArray(this.ship_codes)) this.initialize();
        return this.ship_codes;
    },
    random: function (ship, forced = false) {
        // select random ship
        return this.assign(ship, HelperFunctions.randomItem(this.getAssignableShipsList(ship)).value, false, forced);
    },
    abilities: ShipAbilities
}

this.__ABILITY_MANAGER_OPTIONS__ = {
    friendly_colors: GAME_OPTIONS.teams_count,
    hues: TeamManager.getAll().map(e => e ? e.hue : 0),
    custom_map: MapManager.get(true).map,
    max_players: GAME_OPTIONS.max_players
}

Object.defineProperty(this, 'options', {
    get () { return this.__ABILITY_MANAGER_OPTIONS__ },
    set (value) { return Object.assign(this.__ABILITY_MANAGER_OPTIONS__, value) }
});