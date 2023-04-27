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
        let color = neutral ? CONTROL_POINT.neutral_color : HelperFunctions.toHSLA(TeamManager.getData(team).hue);
        HelperFunctions.setPlaneOBJ({
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
                emissive: control_point_data.texture.url,
                emissiveColor: color
            }
        });

        this.updateRadar();
    },
    updateRadar: function () {
        let color = (game.custom.winner == null || game.custom.winner == "neutral") ? CONTROL_POINT.neutral_color : HelperFunctions.toHSLA(TeamManager.getData(game.custom.winner).hue);
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
        return !ship.custom.EMP && !ship.custom.shipUIsHidden && ship.custom.pucked == null && !ship.custom.inAbility;
    }
}

Object.assign(HelperFunctions, GameHelperFunctions);

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
                    let color = HelperFunctions.toHSLA(TeamManager.getData(player.team).hue, 1, 100, this.colorTextLightness)
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
                let color = HelperFunctions.toHSLA(TeamManager.getData(ship.team).hue, 1, 100, this.colorTextLightness);
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

let AlienSpawns = [];

const makeAlienSpawns = function () {
    let { map } = MapManager.get(), teams = TeamManager.getAll().map(e => e.spawnpoint).filter(e => e != null);

    let actual_size = GAME_OPTIONS.map_size * 5;
    
    // mapping first with positions
    map = map.split("\n").map((v, y) => v.split("").map((size, x) => ({
        x: x * 10 - actual_size + 5,
        y: actual_size - y * 10 - 5,
        size: +size || 0
    }))).flat();

    // filter positions
    map = map.filter(pos => {
        if (pos.size > 0) return false;

        if (HelperFunctions.distance(CONTROL_POINT.position, pos).distance <= CONTROL_POINT.size) return false;

        for (let team of teams) {
            if (HelperFunctions.distance(team, pos).distance <= BASES.size) return false;
        }

        return true;
    });

    AlienSpawns = map;
}