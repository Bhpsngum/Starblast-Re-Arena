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
    toTimer: function () {
        let seconds = HelperFunctions.timeLeft(game.custom.startedStep + GAME_OPTIONS.duration * 60);
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
        if (BASES.intrusion_damage <= 0 || !ship.alive) return false;

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
    }
}

Object.assign(HelperFunctions, GameHelperFunctions);

const WeightCalculator = {
    playerWeight: function (ship) {
        let kills = ship.custom.kills = +ship.custom.kills || 0;
        let deaths = ship.custom.deaths = +ship.custom.deaths || 0;

        return kills - deaths / 3;
    },
    getTopPlayers: function (game, donSort = false) {
        let players = game.ships.filter(e => (e || {}).id != null && !e.custom.kicked);
        if (donSort) return players;
        return players.sort((a, b) => this.playerWeight(b) - this.playerWeight(a));
    },
    getTeamPlayersCount: function (id) {
        let teamData = TeamManager.getDataFromID(id);
        let res = 0;
        for (let ship of game.ships) {
            if ((ship || {}).id == null || !ship.custom.joined || ship.custom.kicked) continue;

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
        if (game.options.root_mode == "team") return;

        TeamManager.set(ship, this.getTeamsWeights()[0].id, true, true);
    }
}

const UIData = {
    colorTextLightness: 65,
    scoreIncreaseRouding: (String(CONTROL_POINT.score_increase).match(/\..*/) || ["a"])[0].length - 1,
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
            let buildHue = parseInt(__ABILITY_SYSTEM_INFO__.buildID, 16) % 360, scoreBlock = {
                id: "score_block",
                position: [4,3,12,6],
                components:[
                    {type:'box',position:[0,0,100,100],fill:"black", stroke: HelperFunctions.toHSLA(buildHue), width: 2},
                    {type:'box',position:[0,0,100,100],fill: HelperFunctions.toHSLA(buildHue, 0.25)},
                    {type: "text", position: [5,5,90,45], value: `Re:Arena (${__ABILITY_SYSTEM_INFO__.branch}) v${__ABILITY_SYSTEM_INFO__.version}`, color: HelperFunctions.toHSLA(buildHue)},
                    {type: "text", position: [5,50,90,45], value: `Build ID: ${__ABILITY_SYSTEM_INFO__.buildID}`, color: HelperFunctions.toHSLA(buildHue)}
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
                    {type: "text", position: [0,0,100,50], value: `${map.name} Map`, color: '#cde', align: "left"},
                    {type: "text", position: [0,50,100,50], value: `By ${map.author}`, color: '#cde', align: "left"}
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
        shortcut: "V",
        toggleID: "toggle_choose_ship",
        shipSelectPrefix: "choose_ship_",
        shipSelectSize: {
            textLength: 35, // to keep the text looks pretty and aligned
            itemsPerLine: 4,
            xStart: 21,
            yStart: 19,
            xEnd: 79,
            yEnd: 85,
            margin_scale_x: 1/8, // comparing to button width
            margin_scale_y: 1/6, // comparing to button height
        },
        positionCache: {},
        styles: {
            selected: {
                borderColor: "#AAFF00",
                textColor: "#AAFF00",
                borderWidth: 8,
                bgColor: "rgba(170, 225, 0, 0.25)"
            },
            default: {
                borderColor: "#FFFFFF",
                textColor: "#FFFFFF",
                borderWidth: 2,
                bgColor: `rgba(68, 85, 102, 0.25)`
            },
            disabled: {
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
        toggle: function (ship, perma = false, firstOpen = false) {
            // perma means also hides the choose ship button
            // first open to assign starting tick
            if (!game.custom.started || !game.custom.abilitySystemEnabled || ship.custom.abilitySystemDisabled) {
                firstOpen = false;
                perma = true;
            }
            if (!firstOpen && ship.custom.shipUIsPermaHidden) return;
            let isHidden = perma || firstOpen || !ship.custom.shipUIsHidden;
            if (perma) {
                ship.custom.shipUIsPermaHidden = true;
            }
            if (firstOpen) {
                ship.custom.shipUIsPermaHidden = false;
                ship.custom.lastSpawnedStep = game.step;
            }
            let oldHidden = ship.custom.shipUIsHidden;
            ship.custom.shipUIsHidden = isHidden;
            if (oldHidden !== isHidden || perma || firstOpen) this.openUI(ship, !perma);
            if (oldHidden !== isHidden) this.toggleSelectMenu(ship);
        },
        sendIndividual: function (ship, position, name, stylePreset, id = null, shortcut = null) {
            let { bgColor, borderColor, borderWidth, textColor } = this.styles[stylePreset];
            if (!id) id = this.shipSelectPrefix + name;
            let visible = true;
            position = this.positionCache[name] = position == null ? this.positionCache[name] : position;
            if (position == null) visible = false;
            HelperFunctions.sendUI(ship, {
                id,
                position,
                visible,
                shortcut,
                clickable: stylePreset == "default",
                components: [
                    { type: "box", position: [0, 0, 100, 100], fill: bgColor, stroke: borderColor,width: borderWidth},
                    { type: "text", position: [0, 0, 100, 100], value: HelperFunctions.fill(name, this.shipSelectSize.textLength), color: textColor}
                ]   
            });
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

            let lastLineXOffset = (itemsPerLine - (abilities.length % itemsPerLine || itemsPerLine)) * width * (1 + UISpec.margin_scale_x) / 2;

            let i = 0;
            let canUseUI = HelperFunctions.canUseButtons(ship) && !AbilityManager.isActionBlocked(ship).blocked;

            for (let abil of abilities) {
                let row = Math.trunc(i / itemsPerLine), column = i % itemsPerLine;
                let offsetX = row == itemsPerColumn - 1 ? lastLineXOffset : 0;
                let usable = canUseUI && AbilityManager.assign(ship, abil, true).success;
                let style = "";
                if (ship.custom.shipName == abil) style = "selected";
                else if (usable) style = "default";
                else style = "disabled";

                this.sendIndividual(ship, [
                    offsetX + UISpec.xStart + column * width * (UISpec.margin_scale_x + 1),
                    UISpec.yStart + row * height * (UISpec.margin_scale_y + 1),
                    width,
                    height
                ], abil, style);
                ++i;
            }

            this.sendIndividual(ship, [
                UISpec.xStart,
                UISpec.yEnd + height * UISpec.margin_scale_y * 2,
                width,
                95 - (UISpec.yEnd + height * UISpec.margin_scale_y * 2)
            ], "[ Previous ship", canUseUI ? "default" : "disabled", "prev_ship", String.fromCharCode(219));

            this.sendIndividual(ship, [
                UISpec.xEnd - width,
                UISpec.yEnd + height * UISpec.margin_scale_y * 2,
                width,
                95 - (UISpec.yEnd + height * UISpec.margin_scale_y * 2)
            ], "Next ship ]", canUseUI ? "default" : "disabled", "next_ship", String.fromCharCode(221));
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
        let largest_team_count = Math.max(...teams_count, ghost_count);

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
        if (game.custom.started) {
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
            ]
        }

        this.updatePlayerCount(game);

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
        if (game.custom.started) {
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
            try { increaseAmount = game.custom.increaseAmount.toFixed(this.scoreIncreaseRouding) } catch (e) {}
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
    assign: function (ship, name) {
        let oldName = ship.custom.shipName;
        let res = AbilityManager.assign(ship, name);
        if (res.success) {
            AbilityManager.restore(ship);
            ship.set({ vx: 0, vy: 0 });
            let x = (ship.custom.chooseTimes[ship.custom.shipName] || 0) + 1;
            if (x >= GAME_OPTIONS.duplicate_choose_limit) return this.shipUIs.toggle(ship, true);
            ship.custom.chooseTimes[ship.custom.shipName] = x;
            if (oldName != ship.custom.shipName) {
                this.shipUIs.sendIndividual(ship, null, ship.custom.shipName, "selected");
                this.shipUIs.sendIndividual(ship, null, oldName, AbilityManager.getAssignableShipsList(ship).includes(oldName) ? "default" : "disabled");
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

    AlienSpawns = map;
}

AbilityManager.onShipsListUpdate = function (team, newList, oldList) {
    for (let s of game.ships) {
        if (s == null || s.id == null || s.custom.shipUIsPermaHidden || s.custom.shipUIsHidden || s.custom.inAbility || AbilityManager.isAbilityBlocked(s).blocked) continue;
        let x = TeamManager.getDataFromShip(s), playerShipName = s.custom.shipName;
        if (team.ghost ? !x.ghost : team.id !== x.id) continue; // wrong team

        // update ship usage limit UIs
        
        for (let name of oldList) if (playerShipName != name) UIData.shipUIs.sendIndividual(s, null, name, "disabled");
        for (let name of newList) if (playerShipName != name) UIData.shipUIs.sendIndividual(s, null, name, "default");
    }
}

AbilityManager.onAbilityEnd = function (ship) {
    if (!ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}

AbilityManager.onAbilityStart = function (ship, inAbilityBeforeStart) {
    if (!inAbilityBeforeStart && !ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}

AbilityManager.onActionBlockStateChange = function (ship) {
    if (!ship.custom.shipUIsHidden) UIData.shipUIs.toggleSelectMenu(ship);
}
