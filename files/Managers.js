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
		if (team == null) return this.ghostTeam;
		team = +team || team;
		return this.getAll()[team] || this.ghostTeam;
	},
	getDataFromShip: function (ship) {
		let ID;
		if (ship.custom == null) ID = ship.team;
		else if (!ship.custom.teamAssigned) ID = null;
		else ID = ship.custom.team == null ? ship.team : ship.custom.team;
		return this.getDataFromID(ID);
	},
	setGhostTeam: function (ship, changeTeam = false, TpBackToBase = false) {
		this.set(ship, 69, changeTeam, TpBackToBase)
	},
	set: function (ship, team = ship.team, changeTeam = false, TpBackToBase = false) {
		let teamData = this.getDataFromID(team);
		ship.set({hue: teamData.hue});
		if (changeTeam) {
			let oldTeamOBJ = ship.custom.teamAssigned ? this.getDataFromShip(ship) : null;
			ship.set({team: teamData.id});
			ship.custom.teamAssigned = true;
			ship.custom.team = teamData.id;
			if (oldTeamOBJ !== teamData && "function" == typeof this.onShipTeamChange) try {
				this.onShipTeamChange(ship, teamData, oldTeamOBJ);
			} catch (e) {}
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
		if (game.custom.last_map != null) this.map = this.maps.find(m => m.name === game.custom.last_map.name && m.author === game.custom.last_map.author);
		if (this.map == null || forceReset) {
			this.map = this.search(GAME_OPTIONS.map_preset_name);
			if (this.map == null) this.map = HelperFunctions.randomItem(this.maps).value;
		}
		if (this.map == null) {
			HelperFunctions.terminal.log(`Can't find any maps for ${GAME_OPTIONS.teams_count} team(s)? Are you sure?`);
			this.map = {
				name: "Null",
				author: "None",
				spawnpoints: [],
				pairings: [],
				map: null
			}
		}
		if (set) {
			try { game.setCustomMap(this.map.map); } catch (e) {}
			this.assignSpawnpoints(forceReset);
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
	assignSpawnpoints: function (forced = false) {
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
			// ignore teams with already-assigned spawnpoints unless forced to
			if (!forced && team.spawnpoint != null) {
				let index = spawnpoints.findIndex(sp => sp.x === team.spawnpoint.x && sp.y === team.spawnpoint.y);
				if (index > -1) {
					for (let pair of [...pairs, curPair]) {
						let pairIndex = pair.indexOf(index);
						if (pairIndex > -1) pair.splice(pairIndex, 1);
					}
					--dist;
					continue;
				}
			}

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
		let { spawnpoint, spawning_radius } = TeamManager.getDataFromShip(ship);
		if (spawnpoint != null) {
			let distance = Math.random() * (Math.max(spawning_radius, 0) || 0), angle = Math.random() * 2 * Math.PI;
			ship.set({
				x: spawnpoint.x + distance * Math.cos(angle) ,
				y: spawnpoint.y + distance * Math.sin(angle)
			});
		}
	},
	set: function (nameOrIndex, set = false, resetSpawnpoints = false) {
		this.map = this.search(nameOrIndex);
		return this.get(set, resetSpawnpoints);
	}
}

const AbilityManager = {
	includeRingOnModel: GAME_OPTIONS.ability.include_rings_on_model,
	showAbilityNotice: GAME_OPTIONS.ability.notice.show,
	abilityNoticeTimeout: GAME_OPTIONS.ability.notice.timeout,
	abilityNoticeMessage: GAME_OPTIONS.ability.notice.message,
	abilityShortcut: GAME_OPTIONS.ability.shortcut[0],
	abilityShortcutText: GAME_OPTIONS.ability.shortcut[1],
	abilitySwitchModeShortcut: GAME_OPTIONS.ability.switchShortcut[0],
	abilitySwitchModeShortcutText: GAME_OPTIONS.ability.switchShortcut[1],
	shipLevels: GAME_OPTIONS.ability.ship_levels,
	model_conversion_ratio: 50, // don't change
	maxStats: GAME_OPTIONS.ability.max_stats,
	crystals: GAME_OPTIONS.ability.crystals,
	usageLimit: GAME_OPTIONS.ability.usage_limit,
	updateDelay: 5, // technical spec, don't touch if you don't know what it does
	UIActionsDelay: 0.2 * 60,
	_this: this,
	echo: DEBUG ? game.modding.terminal.echo : function () {},
	activation_indicator: "__ability__initialized__",
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
		let timePassed = game.step - ship.custom.lastTriggered;
		if (timePassed % ability.tickInterval === 0) ability.tick(ship, timePassed);
		if (ability.customEndcondition && (ship.custom.forceEnd || ability.canEnd(ship))) this.end(ship, false);
	},
	end: function (ship, forced = true) {
		let ability = ship.custom.ability;
		if (ability == null) return;
		ship.custom.inAbility = false;
		ship.custom.forceEnd = false;
		ship.custom.immovable = !!ability.immovable;
		HelperFunctions.TimeManager.clearTimeout(ability.ships.get(ship.id));
		ability.ships.delete(ship.id);
		if (ability.cooldownRestartOnEnd) ability.unload(ship);
		ability.end(ship, forced);
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
		ship.custom.immovable = !!(ability.immovable || ability.immovableInAbility);
		ability.start(ship, lastStatus);
		if (ability.duration != null) {
			let oldTimeout = ability.ships.get(ship.id);
			if (oldTimeout != null) HelperFunctions.TimeManager.clearTimeout(oldTimeout);
			ability.ships.set(ship.id, HelperFunctions.TimeManager.setTimeout(function () {
				this.end(ship, false);
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
	updateIndicator: function (ship) {
		ship.custom.__switch_mode_initialized__ = true;
		let hasAbility = (ship.custom || {}).ability != null;
		HelperFunctions.sendUI(ship, {
			id: this.UI.id + "_toggleUIClickableText",
			position: [21, 0, 10, 2.5],
			visible: hasAbility,
			components: [
				{ type: "text", position: [0, 0, 100, 100], value: `Ability UI: ${(ship.custom || {}).abilityUIUnclickable ? "Unclickable" : "Clickable"} [${this.abilitySwitchModeShortcutText}]`, color: "#FFFFFF", align: "left" }
			]
		});
		HelperFunctions.sendUI(ship, {
			id: this.UI.id + "_toggleUIClickable",
			position: [0, 0, 0, 0],
			clickable: hasAbility,
			visible: false,
			shortcut: this.abilitySwitchModeShortcut,
			components: []
		});
	},
	updateUI: function (ship, forced) {
		let lastUI = ship.custom.lastUI || {}, ability = ship.custom.ability;
		let abilityName = ability.abilityName(ship), { ready, text } = this.requirementsInfo(ship);
		if (forced || lastUI.ready !== ready || lastUI.text !== text || lastUI.abilityName !== abilityName) {
			let color = this.UI.colors[ready ? "ready" : "notReady"];
			let unclickable = (ship.custom || {}).abilityUIUnclickable;
			HelperFunctions.sendUI(ship, {
				id: this.UI.id,
				position: this.UI.position,
				clickable: ready && !unclickable,
				visible: true,
				shortcut: this.abilityShortcut,
				components: [
					{ type: "text",position:[0,0,100,50],value: HelperFunctions.fill(abilityName + ` [${this.abilityShortcutText}]`, 15), color: "#FFFFFF"},
					{ type: "box",position:[0,50,100,50],fill: color.fill, stroke: color.stroke,width:4},
					{ type: "text",position:[2.5,57.5,95,35],value: text ,color: color.text},
				]
			});
			if (forced || lastUI.ready != ready) HelperFunctions.sendUI(ship, {
				id: this.UI.id + "_hidden",
				position: [0, 0, 0, 0],
				visible: false,
				clickable: ready && unclickable,
				shortcut: this.abilityShortcut,
				components: []
			});
			lastUI = ship.custom.lastUI = { ready, text, abilityName };
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
		notInitialized: {
			code: "NOT_INITIALIZED",
			reason: "Ship is not yet initialized Ability System"
		},
		success: {
			code: "SUCCESS"
		},
		sixtyNine: {
			code: "69",
			reason: "Nice"
		}
	},
	initVariables: function (ship) {
		ship.custom.useAbilitySystem = true;
		ship.custom[this.activation_indicator] = true;
	},
	assign: function (ship, abilityShip, dontAssign = false, bypass = {
		// object used to bypass checks (set to `true` to take effect)
		notInitialized: false, // set this to `true` will force any normal ship to use the Ability System
		ability: false, // bypass ability checks
		blocker: false, // bypass action blocker checks
		limit: false // bypass ship limit checks
		// additionally, you can set `bypass` to `true` to basically bypass everything
		// (basically a forced set)
	}, ignoreReset = {
		// ignore reset options
		blocker: false, // ignore clearing blockers when set, this might be the only option available
		restore: false // ignore reset crystals + generator + health
	}) {
		bypass = bypass || {};
		let forced = bypass === true;
		if (!forced) {
			if (!bypass.notInitialized && !this.isAbilityInitialized(ship)) return { success: false, ...this.assignStatus.notInitialized };
			if (!bypass.ability && ship.custom.inAbility) return { success: false, ...this.assignStatus.inAbility };
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
		if (!this.isAbilityInitialized(ship)) this.initVariables(ship);
		if (shipAbil == null) return this.random(ship, forced);
		if (ship.custom.inAbility) this.end(ship);
		ignoreReset = ignoreReset || {};
		let ignoreAll = ignoreReset === true;
		if (!ignoreAll && !ignoreReset.blocker) {
			this.clearAllActionBlockers(ship);
			HelperFunctions.setCollider(ship, true);
			ship.set({
				healing: false,
				idle: false
			});
		}
		ship.custom.shipName = abilityShip;
		let oldAbilName = ship.type;
		if (ship.custom.shipModelChanged && ship.custom != null && ship.custom.ability != null && ship.custom.ability.shipName != null && ship.custom.ability.shipName in this.abilities) {
			oldAbilName = ship.custom.ability.shipName;
		}
		ship.custom.ability = shipAbil;
		ship.custom.inAbility = false;
		ship.custom.forceEnd = false;
		ship.custom.immovable = !!shipAbil.immovable;
		ship.custom.abilityCustom = {};
		ship.custom.lastUI = {};
		ship.set({
			type: shipAbil.codes.default,
			generator: shipAbil.generatorInit,
			stats: AbilityManager.maxStats
		});
		ship.custom.shipModelChanged = false;
		shipAbil.initialize(ship, oldAbilName);
		shipAbil.unload(ship);
		this.updateIndicator(ship);
		this.updateShipsList(TeamManager.getDataFromShip(ship));
		if (!ignoreAll && !ignoreReset.restore) this.restore(ship);
		return { success: true };
	},
	restore: function (ship) {
		if (!this.isAbilityInitialized(ship)) return;
		let abil = ship.custom.ability || {};
		if (ship != null) ship.set({
			shield: 1e4,
			crystals: abil.crystals || 0
		});
	},
	isCompilationError: function () {
		return DEBUG && game.step == 0 && HelperFunctions.terminal.errors > 0;
	},
	globalTick: function (game) {
		if (this.isCompilationError()) {
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
		handleOptions: function (ship, id) {
			if (!id.startsWith(this.optionUI.prefix)) return;
			let oldPresetIndex = ship.custom.preferredRatioPreset;
			let option = id.replace(this.optionUI.prefix, "");
			ship.custom.preferredRatioPreset = option == "next" ? ++ship.custom.preferredRatioPreset : +option;
			this.getPreset(ship);
			if (ship.custom.preferredRatioPreset === oldPresetIndex) return;
			this.set(ship, true);
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
		set: function (ship, forced = false) {
			if ((ship || {}).id == null) return;

			let zoomLevel = AbilityManager.zoomLevel[ship.custom.__last_ability_ship_type__ || ship.type];

			if (zoomLevel == null || zoomLevel.range <= 0) {
				if (!ship.custom.__hide_aspect_ratio_info__) {
					for (let id of [
						this.id,
						this.optionUI.infoID,
						this.optionUI.prefix + "next",
						...Array(10).fill(0).map((v, i) => (this.optionUI.prefix + i))
					]) HelperFunctions.sendUI(ship, { id, visible: false });
					ship.custom.__hide_aspect_ratio_info__ = true;
				}
				return;
			}

			let preset = this.getPreset(ship);

			// render abilityRange UI here
			let height = this.threeJSClientSpecs.getVisibleHeightFraction(zoomLevel.range, zoomLevel.radius || 1, zoomLevel.zoom || 1, this.vertical_scale);
			let width = height * preset.h / preset.w;

			HelperFunctions.sendUI(ship, {
				id: this.id,
				position: [(100 - width) / 2, (100 - height) / 2, width, height],
				components: [
					{ type: "round", position: [0, 0, 100, 100], stroke: this.color, width: this.width }
				]
			});

			if (forced || ship.custom.__hide_aspect_ratio_info__) {
				let UI = {
					id: this.optionUI.infoID,
					...this.optionUI.data
				};

				UI.components[0].value = `Aspect Ratio ${preset.w}:${preset.h} [${(ship.custom.preferredRatioPreset + 1) % 10}]`;

				HelperFunctions.sendUI(ship, UI);

				HelperFunctions.sendUI(ship, {
					id: this.optionUI.prefix + "next",
					clickable: !ship.custom.abilityUIUnclickable,
					visible: !ship.custom.abilityUIUnclickable,
					position: [75, 5, 5, 2.5],
					components: [
						{ type: "box", position: [0, 0, 100, 100], stroke: "#cde", width: 2},
						{ type: "text", position: [0, 0, 100, 100], value: "Change", color: "#cde"}
					]
				});
	
				for (let i = 0; i < 10; ++i) { // yes this part is hardcoded
					HelperFunctions.sendUI(ship, {
						id: this.optionUI.prefix + i,
						visible: false,
						clickable: true,
						shortcut: ((i + 1) % 10).toString() // 1 2 3 4 5 6 7 8 9 0
					});
				}
			}

			ship.custom.__hide_aspect_ratio_info__ = false;
		}
	},
	setDefaultShip: function (template_name) {
		this.default_template = template_name;
	},
	isAbilityInitialized: function (ship) {
		return ship.custom != null && !!ship.custom[this.activation_indicator];
	},
	globalTick2: function (game) {
		game.custom.abilityCustom.entitiesUpdateRequested = false;
		HelperFunctions.TimeManager.tick();
		for (let ability of Object.values(this.abilities)) {
			if ("function" == typeof ability.globalTick) try {
				ability.globalTick(game);
			} catch (e) { HelperFunctions.terminal.error(`${e.name}: ${e.message}`, 1) }
		}
		let oldList = game.custom.__ability_manager_players_list__;
		if (!Array.isArray(oldList)) oldList = [];
		let newList = [];

		for (let ship of game.ships) {
			if (!HelperFunctions.isValidShip(ship)) continue;
			if (ship.custom.sharedAbilityCustom == null) ship.custom.sharedAbilityCustom = {};
			if (ship.custom.useAbilitySystem) {
				if (!this.isAbilityInitialized(ship) && ship.alive) {
					this.initVariables(ship);
					// check if first join is any ship existing in ability system
					let template = Object.values(this.abilities).find(v => v && v.codes && Object.values(v.codes).includes(ship.type));

					if (template == null) {
						let def = this.default_template, defData = def == null ? null : this.abilities[def];
						if (defData != null && defData.codes != null && !isNaN(defData.codes.default)) this.assign(ship, def, false, true);
						else this.random(ship, true);
					}
					else this.assign(ship, template.shipName, false, true);
				}
			}
			else {
				if (this.isAbilityInitialized(ship) && ship.alive) this.disableAbilitySystem(ship);
			}
			let isAbilityActivated = this.isAbilityInitialized(ship);
			if (isAbilityActivated && ship.alive && this.showAbilityNotice && ship.custom.allowInstructor) {
				if (this.abilityNoticeMessage) {
					ship.instructorSays(String(this.abilityNoticeMessage.call(GAME_OPTIONS, ship)), TeamManager.getDataFromShip(ship).instructor);
					if (this.abilityNoticeTimeout > 0) HelperFunctions.TimeManager.setTimeout(function () {
						ship.hideInstructor();
					}, this.abilityNoticeTimeout);
				}
				ship.custom.allowInstructor = false;
			}
			if (!ship.custom.__switch_mode_initialized__) this.updateIndicator(ship);
			if (isAbilityActivated) {
				if (ship.type != ship.custom.__last_ability_ship_type__) {
					let oldType = ship.custom.__last_ability_ship_type__;
					ship.custom.__last_ability_ship_type__ = ship.type;

					// change ability range UI
					this.abilityRangeUI.set(ship);

					// check if this is an upgrade
					let ability = ship.custom.ability;
					if (oldType != null) {
						if (ability != null) {
							if (!Object.values(ability.codes).includes(ship.type)) {
								let modelName = Object.keys(ability.codes).find(k => ability.codes[k] === oldType);
								if (modelName != null) {
									let index = Object.values(ability.nextCodes[modelName]).indexOf(ship.type);
									if (index != -1) {
										let template_name = ability.nextNames[modelName][index];
										if (template_name != null) {
											ship.custom.shipModelChanged = true;
											this.assign(ship, template_name, false, true);
										}
										else {
											ship.set({ type: ability.nextCodes[modelName][index] });
											ship.custom.ability = null;
											HelperFunctions.sendUI(ship, { id: this.UI.id, visible: false });
										}
									}
								}
							}
						}
						else {
							let mapping = this.mapping[oldType];
							if (mapping != null) {
								let index = mapping.nextCodes.indexOf(ship.type);
								if (index != -1) {
									let template_name = mapping.nextNames[index];
									if (template_name != null) {
										ship.custom.shipModelChanged = true;
										this.assign(ship, template_name, false, true);
									}
								}
							}
						}
					}
				}
				if (game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled) {
					newList.push({ id: ship.id, team: TeamManager.getDataFromShip(ship) });
					let oldIndex = oldList.findIndex(s => s.id === ship.id);
					if (oldIndex >= 0) oldList.splice(oldIndex, 1);
				}
				if (ship.custom.ability != null) this.tick(ship);
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
		let ship = event.ship, valid = HelperFunctions.isValidShip(ship);
		if (valid && this.isAbilityInitialized(ship) && ship.custom.ability != null) {
			switch (event.name) {
				case "ui_component_clicked":
					let component = event.id;
					switch (component) {
						case this.UI.id:
							if (ship.custom.abilityUIUnclickable) break;
						case this.UI.id + "_hidden":
							this.start(ship);
							break;
						case this.UI.id + "_toggleUIClickable":
							ship.custom.abilityUIUnclickable = !ship.custom.abilityUIUnclickable;
							this.updateUI(ship, true);
							this.updateIndicator(ship);
							this.abilityRangeUI.set(ship, true);
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
				case "ship_destroyed":
					if (ship.custom.inAbility && ship.custom.ability.endOnDeath) this.end(ship, false);
					break;
			}
		}
		if (valid) AbilityManager.event(event, ship);
		if (HelperFunctions.isValidShip(event.killer)) AbilityManager.event(event, event.killer);
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
				ability.onCodeChange(newAbility);
			}

			// reset abilities on ships
			for (let ship of game.ships) {
				if (!HelperFunctions.isValidShip(ship) || !this.isAbilityInitialized(ship)) continue;
				if (ship.custom.abilityCustom == null) ship.custom.abilityCustom = {};
				if (ship.custom.inAbility) oldAbilityManager.end(ship);
				AbilityManager.assign(ship, ship.custom.shipName, false, true, true);
			}

			if ("function" == typeof this.onCodeChange) this.onCodeChange();
		}

		game.custom.AbilityManager = AbilityManager;

		if (game.custom.abilityCustom == null) game.custom.abilityCustom = {};

		game.custom.abilitySystemCommands = MAKE_COMMANDS();

		if (DEBUG) {
			let gb = globalThis;

			gb.AbilityManager = AbilityManager;
			gb.TeamManager = TeamManager;
			gb.MapManager = MapManager;

			let systemInfo = __ABILITY_SYSTEM_INFO__;

			let resourceLink = `https://github.com/Bhpsngum/Arena-mod-remake/blob/main/releases/${systemInfo.name}_v${systemInfo.version}_${systemInfo.branch}.js`;

			try {
				fetch(resourceLink + '?raw=true').then(data => data.text().then(text => {
					let latestBuildID = (text.match(/buildID:\s*"([a-f0-9]+)"/) || [])[1];
					if (latestBuildID != systemInfo.buildID) $("#terminal").terminal().echo(`\n\nNOTICE: Newer build ([[;#AAFF00;]${latestBuildID}]) detected!\nYou can get it through `, {
						finalize: function (div) {
							div.children().last().append(`<a href="${resourceLink}" target="_blank">this link.</a><br><br>`)
						}
					})
				})).catch(e => {
					HelperFunctions.terminal.log("Skipping version info checks due to an error while fetching sources.");
				});
			}
			catch (e) { HelperFunctions.terminal.log("Skipping version info checks due to an error while fetching sources."); }
		}
	},
	disableAbilitySystem: function (ship) {
		ship.custom.useAbilitySystem = false;
		ship.custom[this.activation_indicator] = false;
		delete ship.custom.ability;
		HelperFunctions.sendUI(ship, { id: this.UI.id, visible: false });
	},
	checkLevel: function (value, defaultValue = 6) {
		value = +value;
		if (isNaN(value) || value <= 0) value = defaultValue;
		return value;
	},
	getUpgrades: function (next) {
		let codes = [];
		if (!Array.isArray(next)) next = [];
		else {
			let nexts = [], count = 0;
			for (let i of next) {
				if ("number" == typeof i) {
					if (!isNaN(i)) {
						nexts.push(null);
						codes.push(i);
					}
				}
				else {
					let nextAbil = this.abilities[i];
					if (nextAbil != null && nextAbil.codes != null && !isNaN(nextAbil.codes.default)) {
						nexts.push(i);
						codes.push(nextAbil.codes.default);
						++count;
					}
				}

				if (count >= 2) break;
			}

			next = nexts;

			if (next.length == 1) {
				next.push(next[0]);
				codes.push(codes[0]);
			}
		}

		return { next, codes }
	},
	compileAbilities: function () {
		// Compile ships and abilities
		
		this.ship_codes = [];
		this.shipActionBlockers = [];
		this.zoomLevel = {};

		let globalUsage = 0;

		this.usageLimit = +this.usageLimit || Infinity;

		let model = 799, templates = HelperFunctions.templates;

		this.shipLevels = this.checkLevel(this.shipLevels);

		let templatesCount = 0;

		for (let shipName in this.abilities) {
			let ability = this.abilities[shipName];
			let error = false;
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

			ability.usageLimit = +ability.usageLimit || this.usageLimit;

			globalUsage += ability.usageLimit;

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

			if ("function" != typeof ability.onCodeChange) ability.onCodeChange = templates.onCodeChange;

			if ("function" != typeof ability.getDefaultShipCode) ability.getDefaultShipCode = templates.getDefaultShipCode;

			// pre-compile
			if ("function" == typeof ability.compile) try {
				ability.compile(this._this);
			}
			catch (e) {
				error = true;
				HelperFunctions.terminal.error(`Pre-compiler function for ${shipName} failed to execute.\nCaught Error: ${e.message}`, true);
			}

			// process ship codes
			ability.codes = {};
			ability.parsedModels = {};
			ability.energy_capacities = {};

			let levels = ability.levels, useDynamicShipLevel = levels != null && "object" == typeof levels;
			ability.levels = {};

			ability.level = this.checkLevel(ability.level, this.shipLevels);

			for (let shipAbilityName in ability.models) try {
				let jsonData = JSON.parse(ability.models[shipAbilityName]);
				if (jsonData == null || jsonData.typespec == null) throw "No ship data or typespec";

				let level = ability.levels[shipAbilityName] = useDynamicShipLevel ? this.checkLevel(levels[shipAbilityName], ability.level) : ability.level;

				jsonData.level = jsonData.typespec.level = level;
				jsonData.model = model - level * 100;

				ability.codes[shipAbilityName] = jsonData.typespec.code = model--;

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

				ability.parsedModels[shipAbilityName] = jsonData;
				
				let showAbilityRangeUI;

				if (ability.showAbilityRangeUI == null || "object" != typeof ability.showAbilityRangeUI) showAbilityRangeUI = !!ability.showAbilityRangeUI;
				else showAbilityRangeUI = !!ability.showAbilityRangeUI[shipAbilityName];

				if (showAbilityRangeUI && ability.range != null && !isNaN(ability.range)) this.zoomLevel[jsonData.typespec.code] = {
					zoom: jsonData.zoom || 1,
					radius: jsonData.typespec.radius || 1,
					range: +ability.range || 0
				};
			}
			catch (e) {
				error = true;
				HelperFunctions.terminal.error(`Failed to compile ship code for model '${shipAbilityName}' of '${shipName}'.\nCaught Error: ${e.message}`, true);
			}

			ability.generatorInit = Math.min(1e5, Math.max(0, ability.generatorInit));

			if (isNaN(ability.generatorInit)) ability.generatorInit = ability.energy_capacities.default;
			
			if (!ability.codes.default) {
				error = true;
				HelperFunctions.terminal.error(`Missing 'default' model for '${shipName}'.`, true);
			}
			if (needAbilityShip && !ability.codes.ability) {
				error = true;
				HelperFunctions.terminal.error(`'${shipName}' uses default ability behaviour but model 'ability' is missing.`, true);
			}

			if (error) {
				HelperFunctions.terminal.error(`Deleting '${shipName}' due to error(s) in compilation`, true);
				delete this.abilities[shipName];
			}
			else ++templatesCount;
		}

		// now we assign upgrades if there are no errors
		let customCount = 0;
		if (!this.isCompilationError()) {
			// ablity ones first
			for (let shipName in this.abilities) {
				let ability = this.abilities[shipName];

				// get default upgrades (if any)
				let defaultNexts = this.getUpgrades(ability.next);
				
				// now let's check upgrades for every specific ships

				let specificNexts = ability.nexts || {}, parsedModels = ability.parsedModels;
				ability.nextCodes = {};
				ability.nextNames = {};
				for (let model in ability.parsedModels) {
					let nextData = specificNexts[model] == null ? defaultNexts : this.getUpgrades(specificNexts[model]);
					
					ability.nextCodes[model] = parsedModels[model].next = parsedModels[model].typespec.next = [...nextData.codes];
					ability.nextNames[model] = [...nextData.next];

					this.ship_codes.push(JSON.stringify(parsedModels[model]));
				}

				// remove the parsed model object
				delete ability.parsedModels;
			}

			// then custom ships
			let index = 0, lastAbilityModel = model, replacements = {};
			this.mapping = {};
			for (let shipData of this.customShips) {
				try {
					let data = shipData.code = JSON.parse(shipData.code);
					let upgrades = this.getUpgrades(shipData.next);
					shipData.nextCodes = upgrades.codes;
					shipData.nextNames = upgrades.next;

					let type = data.typespec.code, newType = type;
					if (!isNaN(replacements[type])) newType = replacements[type];
					else if (isNaN(type) || +type > lastAbilityModel) {
						while (this.mapping[lastAbilityModel] != null) --lastAbilityModel;
						newType = lastAbilityModel--;
					}

					if (type != newType) {
						HelperFunctions.terminal.log(`${data.name} has overlapped ship code (${type}). Changed to ${newType}.`);
						this.replacements[type] = data.typespec.code = newType;
						data.model = newType - data.level * 100;
					}

					this.mapping[newType] = shipData;

					++customCount;
				}
				catch (e) {HelperFunctions.terminal.error(`Failed to process custom ship code at index ${index}`) }
				++index;
			}

			for (let type in this.mapping) {
				let data = this.mapping[type];
				data.code.next = data.code.typespec.next = data.nextCodes = data.nextCodes.map(e => isNaN(replacements[e]) ? e : replacements[e]);

				data.code = JSON.stringify(data.code);
				this.ship_codes.push(data.code);
			}
		}

		HelperFunctions.terminal.log(`Compiled ${799 - model} ability model(s) from ${templatesCount} templates(s) and ${customCount} static model(s).`);

		globalUsage *= GAME_OPTIONS.teams_count || 1;

		if (Number.isFinite(globalUsage) && globalUsage <= GAME_OPTIONS.max_players) HelperFunctions.terminal.error(
			`Total usage limit (${globalUsage}) does not exceed max players (${GAME_OPTIONS.max_players}).\n` +
			`Consider tuning these specs to satisfy the condition above:\n` + 
			[
				"Number of maximum players",
				"Number of teams",
				"Default usage limit",
				"Individual ship templates' usage limit"
			].map(e => "\t- " + e).join("\n")
		);

		this.ships_list = Object.keys(this.abilities).sort();

		this.lastModelUsage = model;
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
	},
	getShipCodes: function () {
		if (!Array.isArray(this.ship_codes)) this.initialize();
		return [...this.ship_codes];
	},
	random: function (ship, forced = false) {
		// select random ship
		return this.assign(ship, HelperFunctions.randomItem(this.getAssignableShipsList(ship)).value, false, forced);
	},
	abilities: ShipAbilities,
	customShips: [],
	addCustomShip: function (shipData) {
		this.customShips.push(shipData);
	}
}

this.__ABILITY_MANAGER_OPTIONS__ = {
	friendly_colors: GAME_OPTIONS.teams_count,
	hues: TeamManager.getAll().map(e => e ? e.hue : 0),
	custom_map: MapManager.get(true).map,
	max_players: GAME_OPTIONS.max_players
}

this.__options__ = JSON.parse(JSON.stringify(this.__ABILITY_MANAGER_OPTIONS__));

Object.defineProperty(this, 'options', {
	get () { return this.__options__ },
	set (value) {
		this.__options__ = Object.assign(JSON.parse(JSON.stringify(this.__ABILITY_MANAGER_OPTIONS__)), value);
		return this.__options__
	}
});