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