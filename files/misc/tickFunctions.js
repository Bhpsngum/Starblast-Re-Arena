const alwaysTick = function (game) {
	AbilityManager.globalTick(game);
	let IDs = [];
	let invul_time = GAME_OPTIONS.leaving_base_invulnerability * 60;
	for (let ship of game.ships) {
		if (ship == null || ship.id == null) continue;
		if (!ship.custom.joined && ship.alive) {
			// ban check
			let banned = false;
			if (DEBUG) for (let info of game.custom.banList) {
				let name = String(ship.name).toLowerCase();
				if (info.full ? name == info.phrase : name.includes(info.phrase)) {
					banned = true;
					game.custom.abilitySystemCommands.kick(ship, "You have been banned by the map host", "Blacklisted player name");
					break;
				}
			}

			if (!banned) {
				UIData.blockers.set(ship);
				control_point_data.renderData(ship, false);
				UIData.renderTeamScores(ship);
				HelperFunctions.sendUI(ship, UIData.radar);
				
				if (game.custom.started) {
					ship.custom.allowInstructor = true;
					if (GAME_OPTIONS.spectator_enabled && ship.type == 102) {
						ship.custom.spectator = true;
						HelperFunctions.setCollider(ship, false);
						ship.set({ ...CONTROL_POINT.position });
						UIData.renderScoreboard(ship);
						UIData.renderPlayerCount(ship);
					}
					else {
						ship.custom.useAbilitySystem = true;
						AbilityManager.random(ship, true);
						WeightCalculator.joinBalanceTeam(ship);
						HelperFunctions.spawnShip(ship);
					}
				}
				else {
					HelperFunctions.sendWaitingText(ship);
					HelperFunctions.setCollider(ship, false);
					ship.set({ idle: true, vx: 0, vy: 0, ...CONTROL_POINT.position, angle: 90, hue: TeamManager.ghostTeam.hue });
				}
				ship.custom.kills = ship.custom.deaths = 0;
				ship.custom.chooseTimes = {};
				UIData.shipUIs.toggle(ship, false, true);
			}

			ship.custom.joined = true;
		}

		if (!ship.custom.spectator && !ship.custom.kicked && ship.custom.joined) {
			// AFK Check
			if (game.custom.started) {
				let data = ship.custom.last_status || {};
				let { r, vx, vy, generator } = ship;
				// check if player is not moving, rotating ship, and firing, then kick
				if (!HelperFunctions.isEqual(data.vx, vx) || !HelperFunctions.isEqual(data.vy, vy) || !HelperFunctions.isEqual(data.r, r) || !HelperFunctions.isEqual(data.generator, generator)) ship.custom.last_active = game.step;

				if (ship.custom.last_active != null && HelperFunctions.timeExceeded(ship.custom.last_active, GAME_OPTIONS.AFK_timeout * 60)) {
					game.custom.abilitySystemCommands.kick(ship, "You have been kicked", "AFK");
				}

				ship.custom.last_status = { r, vx, vy, generator };
			}

			let stepDifference = game.step - ship.custom.lastSpawnedStep;
			if (!ship.custom.shipUIsPermaHidden && (stepDifference > GAME_OPTIONS.ship_ui_timeout * 60 || HelperFunctions.isOutOfBase(ship, true, true))) UIData.shipUIs.toggle(ship, true);

			/*	ANTI-BASECAMP MECHANISM
				(This is a copy of original message from Notus when we were discussing on how to implement this)

				While ship is on base:
					- no collider + not affected by enemy abils
				If ship is leaving the base:
					- he gets collider on + invulnerability for 15 sec + still not affected by enemy abils
					- if he fires then invulnerability is gone (it should be automatical in Starblast native logic) + should be affected by enemy abils
					- if he uses abil then invulnerability is also gone + should be affected by enemy abils
			 */

			if (!ship.custom.noLongerInvisible) {
				if (ship.custom.leaveBaseInvulTime) {
					if (game.step - ship.custom.leaveBaseTimestamp > invul_time || (ship.custom.generator != null && ship.generator < ship.custom.generator)) {
						ship.custom.noLongerInvisible = true;
						ship.custom.generator = null;
						
						let invisibleLog = HelperFunctions.getInvisibleLog(ship);
						if (invisibleLog.length - 1 == ship.custom.lastInvisibleIndex) HelperFunctions.setInvisible(ship, false);
						ship.custom.lastInvisibleIndex = ship.custom.lastInvulnerableIndex = null;
					}
					else ship.custom.generator = ship.generator;
				}
				else if (HelperFunctions.isOutOfBase(ship, true, false)) {
					ship.custom.leaveBaseInvulTime = true;
					ship.custom.leaveBaseTimestamp = game.step;
					let colliderLog = HelperFunctions.getColliderLog(ship);
					if (colliderLog.length - 1 == ship.custom.lastColliderIndex) HelperFunctions.setCollider(ship, true);
					ship.custom.lastColliderIndex = null;
					
					HelperFunctions.setInvulnerable(ship, invul_time);
					ship.custom.lastInvulnerableIndex = HelperFunctions.getInvulnerableLog(ship).length - 1;
				}
			}

			IDs.push(ship.id);

			let intruded = HelperFunctions.intrudedOtherTeamBase(ship);
			if (intruded) {
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
				else if ((game.step - ship.custom.intrudedEnemyBaseStart) % 60 === 0) HelperFunctions.damage(ship, BASES.intrusion_damage, true);
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

	if (game.custom.last_map != MapManager.get()) initialization(game, true);
}

const initialization = function (game, dontChangeTick = false) {
	if (!game.custom.centerObjPlaced) {
		var center_obj = HelperFunctions.randInt(GAME_OPTIONS.nerd) ? {
			scale: {x:2, y:2, z:2},
			rotation: {x:0, y:0, z:0},
			type: {
				id: "lost_sector_aries",
				obj: "https://starblast.io/lost_sector/LostSector_Aries_HardEdges.obj",
				diffuse: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Diffuse.jpg",
				bump: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Height.jpg",
				specular: "https://starblast.io/lost_sector/LostSector_Aries_LostSector_Aries_Specular.jpg",
				shininess: 0,
				emissiveColor: 0,
				specularColor: 0x3fcf00,
				transparent: false
			}
		} : {
			scale: {x: 20, y: 20, z: 20},
			rotation: {x: -Math.PI/4, y: -Math.PI/4, z: 0},
			type: {
				id: "nerd_vibraphone",
				obj: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/objs/nerd_vibraphone.obj",
				diffuse: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/ship_lambert_texture.png",
				emissive: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/ship_emissive_texture.png",
				transparent: false
			}
		};

		HelperFunctions.setObject({
			id: "center_obj",
			position: {x:0, y:0, z:-90},
			...center_obj
		});

		game.custom.centerObjPlaced = true;
	}

	let texture = control_point_data.texture;
	let index = texture == null ? -1 : CONTROL_POINT.textures.findIndex(txt => txt.url === texture.url);
	if (index < 0) index = HelperFunctions.randomItem(CONTROL_POINT.textures).index;
	control_point_data.texture = CONTROL_POINT.textures[index];
	
	
	HelperFunctions.setControlPointOBJ(true, false, true);

	HelperFunctions.setSpawnpointsOBJ();

	HelperFunctions.updateRadar();

	makeAlienSpawns();

	UIData.blockers.set(game, true);

	game.custom.last_map = MapManager.get();

	// rekick the kicked players

	for (let ship of game.ships) {
		if ((ship || {}).id != null && ship.custom.kicked) game.custom.abilitySystemCommands.kick(ship)
	}

	if (!dontChangeTick) {
		this.tick = waiting;
		this.tick(game);
	}
}

const waiting = function (game) {
	alwaysTick(game);
	if (game.custom.started) {
		this.tick = main_phase;
		this.tick(game);
		return;
	}
	let players = game.ships.filter(ship => ship && ship.id != null && ship.custom.joined && !ship.custom.kicked);
	let text = "";
	if (players.length >= GAME_OPTIONS.required_players) {
		if (game.custom.waiting_time == null || isNaN(game.custom.waiting_time)) game.custom.waiting_time = game.step + GAME_OPTIONS.waiting_time * 60;
		if (game.step > game.custom.waiting_time) {
			// game started
			game.custom.started = true;
			game.custom.abilitySystemEnabled = true;
			UIData.renderTeamScores(game, true);
			UIData.updateScoreboard(game);
			HelperFunctions.sendUI(game, UIData.radar);
			HelperFunctions.sendUI(game, {
				id: "waiting_text",
				visible: false
			});
			players.forEach(ship => {
				if ((ship || {}).id == null || ship.custom.kicked || !ship.custom.joined) return;
				ship.custom.allowInstructor = true;
				if (GAME_OPTIONS.spectator_enabled && ship.type == 102) {
					ship.custom.spectator = true;
					HelperFunctions.setCollider(ship, false);
					ship.set({ hue: TeamManager.ghostTeam.hue });
				}
				else {
					ship.custom.useAbilitySystem = true;
					AbilityManager.random(ship, true);
					WeightCalculator.joinBalanceTeam(ship);
					if (ship.alive) {
						HelperFunctions.spawnShip(ship);
						UIData.shipUIs.toggle(ship, false, true);
					}
					ship.custom.last_active = game.step;
				}
				ship.set({ idle: false });
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
	let game_duration = game.step - game.custom.startedStep;
	if (game_duration >= 60 && game_duration % 60 === 0) {
		// game logic should be inside here
		// find all players inside the ring
		let players = HelperFunctions.findEntitiesInRange(CONTROL_POINT.position, CONTROL_POINT.size, true, true, { ships: true, invisible: true }, true);

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
					let TeamData = TeamManager.getDataFromShip(ship);
					if (!TeamData.ghost) control_point_data.teams[TeamData.id] += increment;
					else control_point_data.ghost += increment;
				}
			}
			else {
				// just let teams steal control from each other

				// first, calculate number of ships and previous control % on each team
				let ghostData = {
					index: "ghost",
					control: control_point_data.ghost,
					steal_amount: increment,
					ships: 0
				}, teamControls = [
					...control_point_data.teams.map((control, index) => ({
						index,
						control,
						steal_amount: increment, // % control loss per ship disadvantage
						// later the value above would be lower if the "cake" is too small
						ships: 0
					})),
					ghostData
				];
				for (let ship of players) {
					let TeamData = TeamManager.getDataFromShip(ship);
					if (!TeamData.ghost) ++teamControls[TeamData.id].ships;
					else ++ghostData.ships
				}

				// sorting from smallest team to largest team (by ship count)
				// also filter out teams with 0% control and 0 ships
				teamControls = teamControls.filter(team => team.control > 0 || team.ships > 0).sort((a, b) => a.ships - b.ships);

				// stealing time

				// This is an updated algorithm with only one loop required
				// The algorithm is still the same comparing to old algorithm,
				// it's just that the old one has 2 nested loops that may decrease performance (altho not much significant)
				// and also, credits to @victorz#5357 on Discord (GitHub @theonlypwner) for helping me implement this new approach
				// For old approach with 2 nested loops, see here: https://pastebin.com/APfrRW9Y

				let shipsNotBeforeCurrent = players.length;
				let controlGainPerShip = 0; // control amount gained per ships on the winning team
				let controlPenalty = 0;
				// since total control gain is steal_amount * (ships_count - losing_team_ships_count)
				// `controlPenalty` will be the sum of steal_amount * losing_team_ships_count
				// and it might stack up after each loop

				teamControls.forEach((teamControl, index) => {
					let ships_disadvantage = shipsNotBeforeCurrent - teamControl.ships * (teamControls.length - index);

					teamControl.control += controlGainPerShip * teamControl.ships - controlPenalty;

					if (ships_disadvantage > 0) {
						// how much will it lose?
						let total_loss = Math.min(teamControl.control, ships_disadvantage * increment);

						teamControl.control -= total_loss;

						// later ships need to gain total_loss / ships_disadvantage * (laterTeam.ships - teamControl.ships)
						total_loss /= ships_disadvantage;
						controlGainPerShip += total_loss;
						controlPenalty += total_loss * teamControl.ships;
					}

					shipsNotBeforeCurrent -= teamControl.ships;

					// update control result
					teamControl.control = Math.min(100, teamControl.control);
					
					if (teamControl.index == "ghost") control_point_data.ghost = teamControl.control;
					else control_point_data.teams[teamControl.index] = teamControl.control;
				});
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

		// get max score
		let maxScore = Math.max(...control_point_data.scores, control_point_data.ghostScore);

		let winningScore = GAME_OPTIONS.points, timeLeft = HelperFunctions.timeLeft(game.custom.startedStep + GAME_OPTIONS.duration * 60);

		if (maxControl >= CONTROL_POINT.control_bar.controlling_percentage && maxControlTeam.length == 1) {
			let winningTeam = maxControlTeam[0];
			HelperFunctions.setControlPointOBJ(false, winningTeam);
			if (maxControl >= CONTROL_POINT.control_bar.dominating_percentage) {
				scoreIncreased = true;
				let score = winningTeam == "ghost" ? control_point_data.ghostScore : control_point_data.scores[winningTeam];

				let targetScore = Math.min(winningScore, maxScore + timeLeft * CONTROL_POINT.score_increase);

				let mult = 1;
				if (score != maxScore) mult = Math.max(Math.min(CONTROL_POINT.disadvantage_multiplier_threshold, (targetScore - score) / (targetScore - maxScore)), 1) || 1;

				let increaseAmount = game.custom.increaseAmount = UIData.roundScore(CONTROL_POINT.score_increase * mult);

				score = UIData.roundScore(score + increaseAmount);

				if (winningTeam == "ghost") control_point_data.ghostScore = score;
				else control_point_data.scores[winningTeam] = score;

				let teamPlayers = players.filter(p => HelperFunctions.isTeam(p, { team: winningTeam }));

				let benefits = increaseAmount / teamPlayers.length;

				for (let p of teamPlayers) {
					if (p.custom.teamCaptureValue == null) p.custom.teamCaptureValue = 0;
					p.custom.teamCaptureValue += benefits;
				}

				maxScore = Math.max(maxScore, score);
			}
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
				{ type: "text", position: [0, 0, 100, 100], value: HelperFunctions.toTimer(timeLeft), color: "gray"}
			]
		});

		// check if any endgame condition matches
		game.custom.timeout = HelperFunctions.timeExceeded(game.custom.startedStep, GAME_OPTIONS.duration * 60);

		if (game_duration > GAME_OPTIONS.expiration_time * 60) {
			let test = new Set(WeightCalculator.getTopPlayers(game, true).map(e => TeamManager.getDataFromShip(e)));
			game.custom.oneTeamLeft = test.size < 2;
			game.custom.allLeft = test.size < 1;
			if (game.custom.oneTeamLeft && !game.custom.allLeft) game.custom.winner = [...test][0].id;
		}
		if (game.custom.oneTeamLeft || game.custom.timeout || maxScore >= winningScore) this.tick = endGame; 
	}

	if ((game_duration) % (GAME_OPTIONS.alienSpawns.interval * 60) === 0) {
		let alienSpec = GAME_OPTIONS.alienSpawns;
		while (game.aliens.length < alienSpec.capacity) game.addAlien({
			...HelperFunctions.randomItem(AlienSpawns).value, // x, y
			level: HelperFunctions.randIntInRange(alienSpec.level.min, alienSpec.level.max + 1),
			crystal_drop: HelperFunctions.randIntInRange(alienSpec.crystals.min, alienSpec.crystals.max + 1),
			weapon_drop: HelperFunctions.randomItem(alienSpec.collectibles).value,
			code: HelperFunctions.randomItem(alienSpec.codes).value,
			points: 0
		})
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
		case game.custom.oneTeamLeft: message = `All players in ${game.custom.allLeft ? "all" : "other"} teams left!`; break;
		default: message = `One team reaches ${GAME_OPTIONS.points} points!`
	}
	if (!game.custom.oneTeamLeft) {
		let maxScore = Math.max(...control_point_data.scores, control_point_data.ghostScore);
		let index = control_point_data.scores.indexOf(maxScore);
		if (index < 0) index = "Ghost";
		game.custom.winner = index;
	}
	let winnerData = (game.custom.oneTeamLeft && game.custom.allLeft) ? null : TeamManager.getDataFromID(game.custom.winner);
	let endGameNotification = {
		id: "endgame_notification",
		position: [25, 20, 50, 10],
		components: [
			{ type: "text", position: [0, 0, 100, 50], value: message, color: "#cde"}
		]
	};
	game.custom.endGameInfo = {
		"Status": message,
		"Winner team": void 0,
		" ": " ",
		"Your team": "Unknown",
		"Your kills / deaths": "0/0",
		"Your Team Capture Point (TCP)": 0,
		"  ": void 0,
		"MVP in this match:": void 0,
		"- Team": void 0,
		"- Kills / Deaths": void 0,
		"- Team Capture Point (TCP)": void 0,
		"   ": " ",
		"Community Discord": "discord.gg/697sdMJwKj",
		"Code": "github.com/Bhpsngum/Arena-mod-remake",
		"Feedback": "forms.gle/u9C1Br9kqbdDh22u5"
	};
	if (winnerData != null) {
		let winnerName = winnerData.name.toUpperCase();
		endGameNotification.components.push(
			{ type: "text", position: [0, 50, 50, 50], value: winnerName, color: HelperFunctions.toHSLA(winnerData.hue, 1, 100, UIData.colorTextLightness), align: "right"},
			{ type: "text", position: [50, 50, 50, 50], value: " wins!", color: "#cde", align: "left"}
		);
		game.custom.endGameInfo["Winner team"] = winnerName;
	}
	HelperFunctions.sendUI(game, endGameNotification);

	let MVP = WeightCalculator.getTopPlayers(game, false, "playerWeight")[0];
	if (MVP != null && (MVP.custom.kills || MVP.custom.deaths || MVP.custom.teamCaptureValue)) {
		let KD = [+MVP.custom.kills || 0, +MVP.custom.deaths || 0].join(" / "), teamCaptureValue = UIData.roundScore(Math.min(GAME_OPTIONS.points, MVP.custom.teamCaptureValue) || 0).toString();
		Object.assign(game.custom.endGameInfo, {
			"  ": " ",
			"MVP in this match:": MVP.name,
			"- Team": TeamManager.getDataFromShip(MVP).name.toUpperCase(),
			"- Kills / Deaths": KD,
			"- Team Capture Point (TCP)": teamCaptureValue 
		});

		UIData.scoreboard.components = [
			{ type: "text", position: [5, 30, 90, 10], value: "MVP:", color: "#cde" },
			{ type: "player", id: MVP.id, position: [5, 45, 90, 10], color: HelperFunctions.toHSLA(TeamManager.getDataFromShip(MVP).hue, 1, 100, UIData.colorTextLightness) },
			{ type: "text", position: [5, 60, 90, 10], value: `${KD} | TCP: ${teamCaptureValue}`, color: "#cde" }
		];
	}
	else UIData.scoreboard.components = [
		{ type: "text", position: [0, 40, 100, 10], value: "MVP:", color: "#cde" },
		{ type: "text", position: [0, 50, 100, 10], value: "None", color: "#cde" },
	];

	game.custom.abilitySystemEnabled = false;
	game.custom.ended = true;

	HelperFunctions.sendUI(game, {
		id: "timer",
		position: [40,7.5,20,4],
		components: [
			{ type: "text", position: [0, 0, 100, 100], value: "MATCH FINISHED!", color: "yellow"}
		]
	});

	UIData.updateScoreboard(game);

	for (let ship of game.ships) {
		ship.custom.endGameTick = game.step;
		HelperFunctions.setInvisible(ship, true);
		HelperFunctions.setCollider(ship, false);
	}
	this.tick = im_here_just_to_kick_every_players_out_of_the_game;
}

const im_here_just_to_kick_every_players_out_of_the_game = function (game) {
	alwaysTick(game);
	// yes kick everyone
	for (let ship of game.ships) {
		if (!ship.custom.kicked && (ship.custom.endGameTick == null || game.step - ship.custom.endGameTick > 5 * 60)) {
			let endInfo = HelperFunctions.clone(game.custom.endGameInfo);
			if (ship.custom.spectator) {
				delete endInfo["Your team"];
				delete endInfo["Your kills / deaths"];
				delete endInfo["Your Team Capture Point (TCP)"];
				delete endInfo["  "];
			}
			else {
				endInfo["Your team"] = TeamManager.getDataFromShip(ship).name.toUpperCase();
				endInfo["Your kills / deaths"] = [+ship.custom.kills || 0, +ship.custom.deaths || 0].join(" / ");
				endInfo["Your Team Capture Point (TCP)"] = UIData.roundScore(Math.min(GAME_OPTIONS.points, ship.custom.teamCaptureValue) || 0).toString()
			}
			ship.gameover(endInfo);
			ship.custom.kicked = true;
		}
	}
}