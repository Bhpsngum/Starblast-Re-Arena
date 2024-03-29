const GameHelperFunctions = {
	setSpawnpointsOBJ: function () {
		let teams = TeamManager.getAll(), mapName = MapManager.get().name;

		let samples = [...BASES.textures];
		let i = 0;
		for (let team of teams) {
			if (team == null || team.spawnpoint == null) continue;
			let spawnpoint = team.spawnpoint;

			if (samples.length < 1) samples = [...BASES.textures];

			let texture = team.texture;
			let index = texture != null ? BASES.textures.findIndex(txt => txt.url === texture.url) : -1;

			if (index < 0) {
				texture = HelperFunctions.randomItem(samples, true).value;
				index = BASES.textures.indexOf(texture);
			}
			else texture = BASES.textures[index];

			team.texture = texture;

			let hue = team.hue;

			let scale = BASES.size * texture.scale;

			HelperFunctions.setPlaneOBJ({
				id: "team_base_" + i,
				position: {
					...spawnpoint
				},
				scale: {
					x: scale,
					y: scale
				},
				rotation: {
					x: Math.PI,
					y: 0,
					z: -Math.atan2(CONTROL_POINT.position.y - spawnpoint.y, CONTROL_POINT.position.x - spawnpoint.x)
				},
				type: {
					id: "team_base_" + mapName + "_" + (i++) + "_" + index,
					emissive: texture.url,
					emissiveColor: HelperFunctions.toHSLA(hue)
				}
			})
		}
	},
	sendWaitingText: function (ship) {
		HelperFunctions.sendUI(ship, {
			id: "waiting_text",
			position: [40, 20, 20, 10],
			components: [
				{ type: "text", position: [0, 0, 100, 50], value: "Waiting for more players...", color: "#cde"},
				{ type: "text", position: [0, 50, 100, 50], value: String(game.custom.waiting_text).toString(), color: "#cde"}
			]
		});
	},
	setControlPointOBJ: function (neutral = false, team, forced = false) {
		let { control_point_data } = game.custom;
		let scale = control_point_data.texture.scale * CONTROL_POINT.size;
		let lastState = game.custom.winner == null ? "neutral" : game.custom.winner;
		let curState = neutral ? "neutral" : team;
		if (!forced && lastState == curState) return;
		if (lastState != curState) HelperFunctions.removeObject("control_point_" + lastState);
		game.custom.winner = curState;
		let color = neutral ? CONTROL_POINT.neutral_color : HelperFunctions.toHSLA(TeamManager.getDataFromID(team).hue);
		HelperFunctions.setPlaneOBJ({
			id: "control_point_" + curState,
			position: {
				...CONTROL_POINT.position
			},
			scale: {
				x: scale,
				y: scale
			},
			rotation: {
				x: 0,
				y: 0,
				z: 0
			},
			type: {
				id: "control_point_" + curState,
				emissive: control_point_data.texture.url,
				emissiveColor: color
			}
		});

		this.updateRadar();
	},
	updateRadar: function () {
		let color = (game.custom.winner == null || game.custom.winner == "neutral") ? CONTROL_POINT.neutral_color : HelperFunctions.toHSLA(TeamManager.getDataFromID(game.custom.winner).hue);
		let radar_components = [
			...TeamManager.getAll().filter(t => t && t.spawnpoint != null).map(t => ({
				...t.spawnpoint,
				size: BASES.size,
				color: HelperFunctions.toHSLA(t.hue)
			})),
			{
				...CONTROL_POINT.position,
				size: CONTROL_POINT.size,
				character: String.fromCharCode(215), // it's a "times" character, but using this conversion just in case file is saved in another format (not UTF-8)
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

		HelperFunctions.sendUI(game, UIData.radar);
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
	toTimer: function (seconds) {
		let minutes = Math.trunc(seconds / 60);
		seconds -= minutes * 60;
		if (minutes < 60) return `${minutes}:${seconds.toString().padStart(2, "0")}`;
		let hours = Math.trunc(minutes / 60);
		minutes -= hours * 60;
		return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	},
	canUseButtons: function (ship) {
		return !ship.custom.kicked && !ship.custom.shipUIsHidden;
	},
	intrudedOtherTeamBase: function (ship) {
		if (!game.custom.started || BASES.intrusion_damage <= 0 || !ship.alive) return false;

		let teams = TeamManager.getAll();
		let shipTeamID = TeamManager.getDataFromShip(ship).id;

		for (let team of teams) {
			if (team == null || team.id === shipTeamID) continue;
			let { spawnpoint } = team;
			if (spawnpoint == null) continue;
			if (HelperFunctions.distance(spawnpoint, ship).distance <= BASES.size) {
				return true;
			}
		}

		return false;
	},
	epsilon: 1e-4,
	isEqual: function (a, b) {
		// compare a == b by using epsilon error
		return Math.abs(a - b) < this.epsilon;
	},
	spawnShip: function (ship) {
		HelperFunctions.setCollider(ship, false);
		ship.custom.lastColliderIndex = HelperFunctions.getColliderLog(ship).length - 1;
		HelperFunctions.setInvisible(ship, true);
		ship.custom.lastInvisibleIndex = HelperFunctions.getInvisibleLog(ship).length - 1;
		ship.custom.noLongerInvisible = false;
		ship.custom.leaveBaseInvulTime = false;
		ship.custom.generator = null;
	},
	isOutOfBase: function (ship, spawningCheck = false, allowNoSpawnpoint = false) {
		let spawnpoint = TeamManager.getDataFromShip(ship).spawnpoint, justSpawned = !spawningCheck || (game.step - ship.custom.lastSpawnedStep > 1 * 60);
		if (spawnpoint == null) return !allowNoSpawnpoint;
		return justSpawned && HelperFunctions.distance(spawnpoint, ship).distance > BASES.size;
	}
}

Object.assign(HelperFunctions, GameHelperFunctions);

const WeightCalculator = {
	playerWeightByKD: function (ship) {
		let kills = ship.custom.kills = +ship.custom.kills || 0;
		let deaths = ship.custom.deaths = +ship.custom.deaths || 0;

		let muls = GAME_OPTIONS.player_weight_multipliers;

		if (kills == 0 && deaths == 0) return -Infinity;

		return kills * muls.kills + deaths * muls.deaths;
	},
	playerWeight: function (ship) {
		let kills = ship.custom.kills = +ship.custom.kills || 0;
		let deaths = ship.custom.deaths = +ship.custom.deaths || 0;
		let teamCaptureValue = +ship.custom.teamCaptureValue || 0;

		let muls = GAME_OPTIONS.player_weight_multipliers;

		if (kills == 0 && deaths == 0 && teamCaptureValue == 0) return -Infinity;

		return kills * muls.kills + deaths * muls.deaths + teamCaptureValue * muls.teamCaptureValue;
	},
	getTopPlayers: function (game, donSort = false, formula = "playerWeightByKD") {
		let players = game.ships.filter(e => (e || {}).id != null && !e.custom.kicked && e.custom.joined && !e.custom.spectator);
		if (donSort) return players;

		// get formula
		let weightFormula = this[formula];
		if ("function" != typeof weightFormula) weightFormula = this.playerWeightByKD;
		weightFormula = weightFormula.bind(this);

		return players.sort((a, b) => weightFormula(b) - weightFormula(a));
	},
	getTeamPlayersCount: function (id) {
		let teamData = TeamManager.getDataFromID(id);
		let res = 0;
		for (let ship of game.ships) {
			if ((ship || {}).id == null || !ship.custom.joined || ship.custom.kicked || !ship.custom.teamAssigned || ship.custom.spectator) continue;

			let shipTeam = TeamManager.getDataFromShip(ship);

			res += teamData.ghost ? shipTeam.ghost : (shipTeam.id === teamData.id);
		}
		
		return res;
	},
	teamWeight: function (id) {
		return this.getTeamPlayersCount(id);
	},
	getTeamsWeights: function () {
		return TeamManager.getAll().map(team => ({
			id: team.id, weight: this.teamWeight(team.id)
		})).sort((t1, t2) => {
			if (t1.weight == t2.weight) return HelperFunctions.randInt(2) || -1;
			return t1.weight - t2.weight;
		})
	},
	joinBalanceTeam: function (ship) {
		// disable team balance for team-based root mode because modding works weird for mods with root mode "team"
		if (game.options.root_mode == "team") TeamManager.set(ship, ship.team, false, false);
		else TeamManager.set(ship, this.getTeamsWeights()[0].id, true, true);
	}
}

const UIData = {
	colorTextLightness: 65,
	scoreIncreaseRouding: (String(CONTROL_POINT.score_increase).match(/\..*/) || ["a"])[0].length - 1,
	roundScore: function (val, toString = false) {
		val = val.toFixed(this.scoreIncreaseRouding);
		if (toString) return val;
		return +val;
	},
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
	player_count: {
		id: "player_count",
		visible: false
	},
	blockers: {
		rebuild: function () {
			// rebuild score block
			let buildID = __ABILITY_SYSTEM_INFO__.buildID;
			let buildHue = parseInt(buildID, 16) % 360, scoreBlock = {
				id: "score_block",
				position: [4,3,12,6],
				components:[
					{type:'box',position:[0,0,100,100],fill:"black", stroke: HelperFunctions.toHSLA(buildHue), width: 2},
					{type:'box',position:[0,0,100,100],fill: HelperFunctions.toHSLA(buildHue, 0.25)},
					{type: "text", position: [5,5,90,45], value: `Re:Arena (${__ABILITY_SYSTEM_INFO__.branch}) v${__ABILITY_SYSTEM_INFO__.version}`, color: HelperFunctions.toHSLA(buildHue)},
					{type: "text", position: [5,50,90,45], value: `Build ID: ${buildID.padStart(Math.max(0, 12 - buildID.length) * 2 + buildID.length, " ")}`, color: HelperFunctions.toHSLA(buildHue)}
				]
			};
			let index = this.list.findIndex(ui => ui.id == "score_block");
			if (index == -1) this.list.push(scoreBlock);
			else this.list[index] = scoreBlock;

			// rebuild map info
			let map = MapManager.get();
			let mapInfo = {
				id: "map_info",
				position: [1, 90, 10, 5],
				components: [
					{type: "text", position: [0,0,100,50], value: `Map: ${map.name}`, color: '#cde', align: "left"},
					{type: "text", position: [0,50,100,50], value: `Made by: ${map.author}`, color: '#cde', align: "left"}
				]
			};
			let mapIndex = this.list.findIndex(ui => ui.id == "map_info");
			if (mapIndex == -1) this.list.push(mapInfo);
			else this.list[mapIndex] = mapInfo;
		},
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
				id: "steam_exit_block",
				position:[0,95,20,5],
				clickable: true
			}
		],
		initialized: false,
		set: function (ship, forceRebuild) {
			if (forceRebuild || !this.initialized) {
				this.rebuild();
				this.initialized = true;
			}
			if (ship != null) for (let ui of this.list) HelperFunctions.sendUI(ship, ui)
		},
		has: function (id) {
			return !!this.list.find(ui => ui.id === id)
		}
	},
	shipUIs: {
		shortcut: "M",
		toggleID: "toggle_choose_ship",
		shipSelectPrefix: "choose_ship",
		shipSelectSize: {
			textLengthToWidthRatio: 3, // text_len = ratio * ui_width, to keep the text looks pretty and aligned
			// Please note that multiple pages are available, columns * rows is the number of items in one page
			columns: 3, // horizontal items count
			rows: 5, // vertical items count
			xStart: 26,
			yStart: 25,
			contentYStart: 30,
			xEnd: 74,
			yEnd: 65,
			margin_scale_x: 1/8, // comparing to button width
			margin_scale_y: 1/6, // comparing to button height
		},
		getTextLength: function (width) {
			return Math.round(width * this.shipSelectSize.textLengthToWidthRatio);
		},
		getTotalItemsCountPerPage: function () {
			return this.shipSelectSize.rows * this.shipSelectSize.columns; 
		},
		positionCache: {},
		styles: {
			selected: {
				clickable: false,
				borderColor: "#AAFF00",
				textColor: "#AAFF00",
				borderWidth: 8,
				bgColor: "hsla(75, 100%, 44.1%, 0.25)"
			},
			default: {
				clickable: true,
				borderColor: "#FFFFFF",
				textColor: "#FFFFFF",
				borderWidth: 2,
				bgColor: `hsla(210, 20%, 22.3%, 0.25)`
			},
			cyan: {
				clickable: true,
				borderColor: "#00FFFF",
				textColor: "#FFFFFF",
				borderWidth: 2,
				bgColor: `hsla(180, 100%, 50%, 0.15)`
			},
			disabled: {
				clickable: false,
				borderColor: "hsla(0, 100%, 50%, 1)",
				textColor: "#fff",
				borderWidth: 8,
				bgColor: "hsla(0, 100%, 50%, 0.25)"
			}
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
		toggle: function (ship, perma = false, firstOpen = false, option = null, forced = false) {
			// perma means also hides the choose ship button
			// first open to assign starting tick
			if (!game.custom.started || !game.custom.abilitySystemEnabled || !ship.custom.useAbilitySystem || ship.custom.abilitySystemDisabled) {
				firstOpen = false;
				perma = true;
			}
			if (!firstOpen && ship.custom.shipUIsPermaHidden) return;
			let isHidden = perma || firstOpen || (option == null ? !ship.custom.shipUIsHidden : !!option);
			if (perma) {
				ship.custom.shipUIsPermaHidden = true;
			}
			if (firstOpen) {
				ship.custom.shipUIsPermaHidden = false;
				ship.custom.lastSpawnedStep = game.step;
			}
			let oldHidden = ship.custom.shipUIsHidden;
			ship.custom.shipUIsHidden = isHidden;
			if (forced || oldHidden !== isHidden || perma || firstOpen) this.openUI(ship, !perma);
			if (forced || oldHidden !== isHidden) this.toggleSelectMenu(ship);
		},
		sendIndividual: function (ship, position, name, stylePreset, id = null, shortcut = null, customTextScale = null) {
			let { bgColor, borderColor, borderWidth, textColor, clickable } = this.styles[stylePreset];
			let visible = true;
			let page = this.getUserPageIndex(ship);
			let positionCache = this.positionCache[page];
			if (positionCache == null) positionCache = this.positionCache[page] = {};
			position = positionCache[id] = position == null ? positionCache[id] : position;
			if (position == null) visible = false;
			HelperFunctions.sendUI(ship, {
				id,
				position,
				visible,
				shortcut,
				clickable,
				components: [
					{ type: "box", position: [0, 0, 100, 100], fill: bgColor, stroke: borderColor,width: borderWidth},
					{ type: "text", position: [0, 0, 100, 100], value: HelperFunctions.fill(name, customTextScale == null ? this.getTextLength((position || [])[2] || 0) : customTextScale), color: textColor}
				]   
			});
		},
		getTotalPagesCount: function () {
			return Math.ceil(AbilityManager.ships_list.length / this.getTotalItemsCountPerPage());
		},
		getUserPageIndex: function (ship) {
			let page = Math.trunc(ship.custom.shipSelectPage) || 0;
			let totalPage = this.getTotalPagesCount() - 1;
			if (page < 0) page = totalPage;
			if (page > totalPage) page = 0;

			return ship.custom.shipSelectPage = page;
		},
		getUserShipsList: function (ship, onlyAssignable = false, includeSelf = true) {
			let totalItems = this.getTotalItemsCountPerPage();
			let currentPage = this.getUserPageIndex(ship) * totalItems;
			let pageList = AbilityManager.ships_list.slice(currentPage, currentPage + totalItems);
			if (!onlyAssignable) return pageList;
			let assignableShipsList = AbilityManager.getAssignableShipsList(ship);

			let data = [];
			for (let i of pageList) if (assignableShipsList.includes(i) || (includeSelf && i == ship.custom.shipName)) data.push(i);

			return data;
		},
		ItemID: {
			getString: function (obj = {
				row: 0,
				column: 0
			}) {
				// create this in case we need to change its format later
				return `${UIData.shipUIs.shipSelectPrefix}_${obj.row || 0}_${obj.column || 0}`;
			},
			getShipName: function (ship, obj = {
				row: 0,
				column: 0
			}) {
				let index = obj.row * UIData.shipUIs.shipSelectSize.columns + obj.column;
				return UIData.shipUIs.getUserShipsList(ship)[index];
			},
			getIndexFromID: function (id = "") {
				let pos = id.match(new RegExp(`^${UIData.shipUIs.shipSelectPrefix}_(\\d+)_(\\d+)$`));
				if (pos == null) return null;
				return {
					row: Math.max(Math.min(pos[1], UIData.shipUIs.shipSelectSize.rows), 0) || 0,
					column: Math.max(Math.min(pos[2], UIData.shipUIs.shipSelectSize.columns), 0) || 0
				}
			},
			getIndexFromName: function (name = "") {
				let index = AbilityManager.ships_list.indexOf(name);
				if (index < 0) return null;
				let { columns } = UIData.shipUIs.shipSelectSize;
				let itemsCount = UIData.shipUIs.getTotalItemsCountPerPage();
				let page = Math.trunc(index / itemsCount);
				let pageOffset = index % itemsCount;
				return {
					page,
					row: Math.trunc(pageOffset / columns),
					column: pageOffset % columns
				}
			}
		},
		utilItems: [
			{ id: "prev_page", text: "%s Prev page", icon: "<", shortcut: String.fromCharCode(188), style: "cyan", clickable: (canUseButtons, canUseUI, totalPages) => canUseButtons && totalPages > 1 },
			{ id: "prev_ship", text: "%s Prev ship", icon: "[", shortcut: String.fromCharCode(219), style: "default", clickable: (canUseButtons, canUseUI, totalPages) => canUseUI },
			{ id: "random_ship", text: "Random [%s]", icon: "?", shortcut: String.fromCharCode(191), style: "cyan", clickable: (canUseButtons, canUseUI, totalPages) => canUseUI },
			{ id: "next_ship", text: "Next ship %s", icon: "]", shortcut: String.fromCharCode(221), style: "default", clickable: (canUseButtons, canUseUI, totalPages) => canUseUI },
			{ id: "next_page", text: "Next page %s", icon: ">", shortcut: String.fromCharCode(190), style: "cyan", clickable: (canUseButtons, canUseUI, totalPages) => canUseButtons && totalPages > 1 }
		],
		toggleSelectMenu: function (ship) {
			let visible = !ship.custom.shipUIsHidden;

			let UISpec = this.shipSelectSize;

			if (!visible) {
				for (let row = 0; row < UISpec.rows; ++row) {
					for (let column = 0; column < UISpec.columns; ++column) {
						HelperFunctions.sendUI(ship, { id: this.ItemID.getString({ row, column }), visible: false, clickable: false });
					}
				}
				for (let id of ["next_ship", "prev_ship", "next_page", "prev_page", "page_num", "random_ship"]) HelperFunctions.sendUI(ship, {id, visible: false, clickable: false});
				return;
			}

			let { columns, rows } = UISpec;

			let abilities = this.getUserShipsList(ship);

			let width = (UISpec.xEnd - UISpec.xStart) / (columns + (columns - 1) * UISpec.margin_scale_x);
			let height = (UISpec.yEnd - UISpec.contentYStart) / (rows + (rows - 1) * UISpec.margin_scale_y);

			let lastLineXOffset = (columns - (abilities.length % columns || columns)) * width * (1 + UISpec.margin_scale_x) / 2;

			let i = 0;
			let canUseButtons = HelperFunctions.canUseButtons(ship);
			let canUseUI = canUseButtons && !ship.custom.inAbility && !AbilityManager.isActionBlocked(ship).blocked;

			let rowsCount = Math.ceil(abilities.length / columns);

			for (let abil of abilities) {
				let row = Math.trunc(i / columns), column = i % columns;
				let offsetX = row == rowsCount - 1 ? lastLineXOffset : 0;
				let usable = canUseUI && AbilityManager.assign(ship, abil, true).success;
				let style = "";
				if (ship.custom.shipName == abil) style = "selected";
				else if (usable) style = "default";
				else style = "disabled";

				this.sendIndividual(ship, [
					offsetX + UISpec.xStart + column * width * (UISpec.margin_scale_x + 1),
					UISpec.contentYStart + row * height * (UISpec.margin_scale_y + 1),
					width,
					height
				], abil, style, this.ItemID.getString({ row, column }));
				++i;
			}
			
			let totalItems = this.getTotalItemsCountPerPage();

			for (; i < totalItems; ++i) {
				HelperFunctions.sendUI(ship, {
					id: this.ItemID.getString({
						row: Math.trunc(i / columns),
						column: i % columns
					}),
					visible: false,
					clickable: false
				})
			}

			let itemsLength = this.utilItems.length
			let utilWidth = (UISpec.xEnd - UISpec.xStart) / (itemsLength + (itemsLength - 1) * UISpec.margin_scale_x);

			let menuStartY = UISpec.yEnd + height * UISpec.margin_scale_y * 2, menuHeight = Math.min(height, 95 - menuStartY);

			let totalPages = this.getTotalPagesCount();

			i = 0;
			for (let item of this.utilItems) {
				this.sendIndividual(ship, [
					UISpec.xStart + (i++) * utilWidth * (UISpec.margin_scale_x + 1),
					menuStartY,
					utilWidth,
					menuHeight
				], item.text.replace(/%s/g, item.icon), item.clickable(canUseButtons, canUseUI, totalPages) ? item.style : "disabled", item.id, item.shortcut)
			}

			let titleWidth = UISpec.xEnd - UISpec.xStart, titleTextWidth = this.getTextLength(titleWidth);
			HelperFunctions.sendUI(ship, {
				id: "page_num",
				position: [UISpec.xStart, UISpec.yStart, titleWidth, UISpec.contentYStart - UISpec.yStart],
				components: [
					{ type: "text", position: [0, 0, 100, 100], value: ` Page ${this.getUserPageIndex(ship) + 1}/${totalPages}`.padEnd(titleTextWidth, " "), color: "#FFFFFF", align: "left" },
					{ type: "text", position: [0, 0, 100, 100], value: `[${this.shortcut}] to close `.padStart(titleTextWidth, " "), color: "#FFFFFF", align: "right" }
				]
			});
		}
	},
	updatePlayerCount: function (game) {
		let players = WeightCalculator.getTopPlayers(game, true);

		let teams = TeamManager.getAll();
		let team_counts = new Array(teams.length).fill(0), ghost_count = 0;

		for (let player of players) {
			let teamInfo = TeamManager.getDataFromShip(player);

			if (teamInfo.ghost) ++ghost_count;
			else ++team_counts[teamInfo.id];
		}

		let colon_width = 0.25; // ratio to counter

		let single_equiv = 1 + colon_width; // 1: own width, colon_width: the ":" width

		let width_equiv = teams.length * single_equiv; 
		if (ghost_count > 0) width_equiv += single_equiv;

		width_equiv -= colon_width;

		let width = 100 / width_equiv;

		let compos = [
			{type: "text", position: [0, 0, 100, 25], value: "Players distribution", color: "#cde"}
		];

		// render team ratio
		let i = 0;
		team_counts.forEach((count) => {
			let offsetX = i * width * single_equiv;
			compos.push(
				{ type: "text", position: [offsetX, 25, width, 25], value: count, color: HelperFunctions.toHSLA(teams[i].hue, 1, 100, this.colorTextLightness) },
				{ type: "text", position: [offsetX + width, 25, width * colon_width, 25], value: ":", color: "#cde" }
			);
			++i;
		});

		if (ghost_count > 0) {
			let offsetX = i * width * single_equiv;
			compos.push(
				{ type: "text", position: [offsetX, 25, width, 25], value: ghost_count, color: HelperFunctions.toHSLA(TeamManager.ghostTeam.hue, 1, 100, this.colorTextLightness) }
			);
		}
		else compos.pop();

		// render chart
		let chart_width = 100 / (teams.length + (ghost_count > 0));
		let largest_team_count = Math.max(...team_counts, ghost_count);

		i = 0;
		for (let count of team_counts) compos.push(
			{ type: "box", position: [i * chart_width, 50, chart_width, 50 * ((count / largest_team_count) || 0)], fill: HelperFunctions.toHSLA(teams[i++].hue) }
		);

		if (ghost_count > 0) compos.push(
			{ type: "box", position: [i * chart_width, 50, chart_width, 50 * ghost_count / largest_team_count], fill: HelperFunctions.toHSLA(TeamManager.ghostTeam.hue) }
		);

		this.player_count = {
			id: "player_count",
			position: [85, 40, 10, 10],
			components: compos
		}

		this.renderPlayerCount(game);
	},
	renderPlayerCount: function (ship) {
		HelperFunctions.sendUI(ship, this.player_count);
	},
	updateScoreboard: function (game) {
		if (game.custom.started && !game.custom.ended) {
			let players = WeightCalculator.getTopPlayers(game).slice(0, 10);
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
					let color = HelperFunctions.toHSLA(TeamManager.getDataFromShip(player).hue, 1, 100, this.colorTextLightness)
					return [
						{ type: "player", index, id: player.id, position: pos, color, align: "left"},
						{ type: "text", value: `${player.custom.kills}/${player.custom.deaths} `, position: pos, color, align: "right"},
					]
				}).flat()
			];

			this.updatePlayerCount(game);
		}

		for (let ship of game.ships) {
			if (ship && ship.id != null) this.renderScoreboard(ship);
		}
	},
	renderScoreboard: function (ship) {
		if (ship == null || ship.id == null) return;
		if (ship.custom.kicked) return HelperFunctions.sendUI(ship, {
			id: "scoreboard",
			components: [
				{ type: "text", position: [0, 45, 100, 10], value: "You've been kicked!", color: "#cde" }
			]
		});
		let scoreboardData = { ...this.scoreboard };
		if (game.custom.started && !game.custom.ended && !ship.custom.spectator && ship.custom.joined) {
			// highlight players
			let compos = HelperFunctions.clone(scoreboardData.components);
			let foundIndex = compos.findIndex(c => c.type == "player" && c.id === ship.id);
			if (foundIndex < 0) {
				let color = HelperFunctions.toHSLA(TeamManager.getDataFromShip(ship).hue, 1, 100, this.colorTextLightness);
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
			let increaseAmount = 0;
			try { increaseAmount = this.roundScore(game.custom.increaseAmount) } catch (e) {}
			UIData.scores = {
				id: "team_points",
				position: [35,11.5,30,5],
				components: []
			};
			let teams_count = GAME_OPTIONS.teams_count;
			let ghostTeamScore = Math.floor(control_point_data.ghostScore);
			let ghostTeamShow = ghostTeamScore > 0;
			if (ghostTeamShow) ++teams_count;
			let UI_counts = teams_count * 2 - 1;
			let width = 100 / UI_counts;
			let dash = { type: "text", value: "-", color: "#fff"};
			let index = 0;
			UIData.scores.components = control_point_data.scores.map((score, id) => {
				let color = HelperFunctions.toHSLA(TeamManager.getDataFromID(id).hue, 1, 100, this.colorTextLightness);
				let data = [
					{ type: "text", position: [index * width, 0, width, 100], value: Math.floor(score), color}
				];
				if (game.custom.scoreIncreased && id === game.custom.winner) data.push(
					{ type: "text", position: [index * width, 0, width, 100 / (teams_count + 1)], value: "+" + increaseAmount, color, align: "right"}
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
					{ type: "text", position: [(index + 3/4) * width, 0, width * 1 / 4, 25], value: "+" + increaseAmount, color}
				);
				UIData.scores.components.push(...data);
			}
			else UIData.scores.components.pop();
		};
		HelperFunctions.sendUI(ship, UIData.scores);
	},
	assign: function (ship, func) {
		let oldName = ship.custom.shipName;
		let res = func();
		if (res.success) {
			ship.set({ vx: 0, vy: 0 });
			HelperFunctions.setInvulnerable(ship, GAME_OPTIONS.ship_invulnerability * 60);
			HelperFunctions.spawnShip(ship);
			let x = (ship.custom.chooseTimes[ship.custom.shipName] || 0) + 1;
			if (x >= GAME_OPTIONS.duplicate_choose_limit || TeamManager.getDataFromShip(ship).spawnpoint == null) return this.shipUIs.toggle(ship, true);
			ship.custom.chooseTimes[ship.custom.shipName] = x;
			if (oldName != ship.custom.shipName) {
				let { ItemID } = UIData.shipUIs;
				let userPage = UIData.shipUIs.getUserPageIndex(ship);
				let oldData = ItemID.getIndexFromName(oldName);
				let newData = ItemID.getIndexFromName(ship.custom.shipName);
				if (userPage == newData.page) this.shipUIs.sendIndividual(ship, null, ship.custom.shipName, "selected", ItemID.getString(newData));
				if (userPage == oldData.page) this.shipUIs.sendIndividual(ship, null, oldName, AbilityManager.getAssignableShipsList(ship).includes(oldName) ? "default" : "disabled", ItemID.getString(oldData));
			}
		}
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
			compos.push([offset, control, HelperFunctions.toHSLA(TeamManager.getDataFromID(index).hue)]);
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

let AlienSpawns = [];

const makeAlienSpawns = function () {
	let { map } = MapManager.get(), teams = TeamManager.getAll().map(e => e.spawnpoint).filter(e => e != null);

	let actual_size = GAME_OPTIONS.map_size * 5;

	let dist = GAME_OPTIONS.alienSpawns.distanceFromBases;
	
	// mapping first with positions
	map = map.split("\n").map((v, y) => v.split("").map((size, x) => ({
		x: x * 10 - actual_size + 5,
		y: actual_size - y * 10 - 5,
		size: +size || 0
	}))).flat();

	// filter positions
	map = map.filter(pos => {
		if (pos.size > 0) return false;

		if (HelperFunctions.distance(CONTROL_POINT.position, pos).distance <= CONTROL_POINT.size + dist) return false;

		for (let team of teams) {
			if (HelperFunctions.distance(team, pos).distance <= BASES.size + dist) return false;
		}

		return true;
	});

	AlienSpawns = [];

	let diagonal_size = actual_size * Math.SQRT2;

	// the more close to center, the more spawning chance

	for (let spawn of map) {
		let { x, y } = spawn;
		let distMul = Math.max(Math.round((1 - HelperFunctions.simpleDistance({x: 0, y: 0}, {x, y}) / diagonal_size) * 10), 1);
		for (let i = 0; i < distMul; ++i) AlienSpawns.push({x, y});
	}
}

TeamManager.getAll().map(team => (team.spawning_radius = BASES.size * BASES.spawning_radius_ratio));

AbilityManager.onShipsListUpdate = function (team, newList, oldList) {
	let { shipUIs } = UIData;
	let { ItemID } = shipUIs;
	for (let s of game.ships) {
		if (s == null || s.id == null || !AbilityManager.isAbilityInitialized(s) || s.custom.shipUIsPermaHidden || s.custom.shipUIsHidden || s.custom.inAbility || AbilityManager.isAbilityBlocked(s).blocked) continue;
		let x = TeamManager.getDataFromShip(s), playerShipName = s.custom.shipName;
		if (team.ghost ? !x.ghost : team.id !== x.id) continue; // wrong team

		// update ship usage limit UIs

		let userPage = shipUIs.getUserPageIndex(s);
		
		for (let name of oldList) {
			let pageData = ItemID.getIndexFromName(name);
			if (pageData != null && pageData.page == userPage && playerShipName != name) shipUIs.sendIndividual(s, null, name, "disabled", ItemID.getString(pageData));
		}
		for (let name of newList) {
			let pageData = ItemID.getIndexFromName(name);
			if (pageData != null && pageData.page == userPage && playerShipName != name) shipUIs.sendIndividual(s, null, name, "default", ItemID.getString(pageData));
		}
	}
}

AbilityManager.onAbilityEnd = function (ship) {
	if (game.custom.ended) {
		HelperFunctions.setInvisible(ship, true);
		HelperFunctions.setCollider(ship, false);
	}
	if (!ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}

AbilityManager.onAbilityStart = function (ship, inAbilityBeforeStart) {
	if (!ship.custom.noLongerInvisible && HelperFunctions.isOutOfBase(ship, true, false)) {
		ship.custom.noLongerInvisible = true;
		let colliderLog = HelperFunctions.getColliderLog(ship), invisibleLog = HelperFunctions.getInvisibleLog(ship), invulnerableLog = HelperFunctions.getInvulnerableLog(ship);
		if (colliderLog.length - 1 == ship.custom.lastColliderIndex) HelperFunctions.setCollider(ship, true);
		if (invisibleLog.length - 1 == ship.custom.lastInvisibleIndex) HelperFunctions.setInvisible(ship, false);
		if (invulnerableLog.length - 1 == ship.custom.lastInvulnerableIndex) HelperFunctions.setInvulnerable(ship, 0);
		ship.custom.lastColliderIndex = ship.custom.lastInvisibleIndex = ship.custom.lastInvulnerableIndex = null;
	}
	if (!inAbilityBeforeStart && !ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}

AbilityManager.onActionBlockStateChange = function (ship) {
	if (!ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}

TeamManager.onShipTeamChange = function (ship, newTeamOBJ, oldTeamOBJ) {
	UIData.updateScoreboard(game);
}

AbilityManager.onCodeChange = function () {
	if (game.custom.abilitySystemEnabled) for (let ship of game.ships) {
		if (HelperFunctions.isValidShip(ship) && !ship.custom.abilitySystemDisabled) UIData.shipUIs.toggle(ship, false, false, !!ship.custom.shipUIsHidden, true);
	}
}