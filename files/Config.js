const DEBUG = true; // if in debug phase

const map_name = `Arena Mod v4.0 Beta`; // leave `null` if you want randomized map name

const GAME_OPTIONS = {
    map_size: 100,
    waiting_time: 30, // in seconds
    teams_count: 2, // number of teams
    required_players: 2, // players required to start, min 2
    max_players: 80,
    duration: 30 * 60, // in seconds
    points: 100, // points for one team to reach in order to win
    healing_ratio: 1, // better don't touch this
    crystal_drop: 0.5, // this.options.crystal_drop
    ship_ui_timeout: 15, // time for the ship ui to hide, in seconds
    alienSpawns: {
        level: {
            min: 1,
            max: 2
        },
        codes: [10, 11],
        collectibles: [10, 11, 12, 20, 21, 41, 42, 90, 91],
        crystals: {
            min: 45,
            max: 80
        },
        interval: 10, // in seconds
        capacity: 30 // number of aliens should be on map at a time (including aliens spawned by abilities)
    }
}

const CONTROL_POINT = {
    neutral_color: "#fff", // color of control point when neutral, better don't change this
    neutral_fill: "hsla(0, 0%, 0%, 0)", // this is for displaying bar point
    position: {
        x: 0,
        y: 0
    },
    size: 65, // in radius
    control_bar: {
        percentage_increase: 3.5, // percentage of control point increased/decreased for each ship
        controlling_percentage: 66, // % of control one team needs in order to be a winning team
        dominating_percentage: 90 // % of control one team needs in order to dominate and gain points
    },
    score_increase: 0.10, // team points increases per player per sec for the dominating team
    textures: [
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/capture_area.png",
            author: "Nexagon", // it's shown nowhere on the mod, but at least a token of respect
            scale: 2.24
        }
    ]
}

const BASES = {
    size: 45, // in radius
    intrusion_damage: 145, // damage per sec if enemy enters the base
    textures: [ // textures list to choose from (randomized)
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_0.png",
            author: "Nexagon", // it's shown nowhere on the mod, but at least a token of respect
            scale: 2.24
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_1.png",
            author: "Nexagon",
            scale: 2.24
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_2.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_3.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_4.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_5.png",
            author: "Caramel",
            scale: 2.07
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_6.png",
            author: "Caramel",
            scale: 2.07
        }
    ]
}

// don't remove those
GAME_OPTIONS.required_players = Math.max(GAME_OPTIONS.required_players, 2) || 2; // restriction
GAME_OPTIONS.teams_count = Math.min(Math.max(GAME_OPTIONS.teams_count, 0), 5) || 0; // restriction
CONTROL_POINT.control_bar.dominating_percentage = Math.min(Math.max(CONTROL_POINT.control_bar.controlling_percentage, CONTROL_POINT.control_bar.dominating_percentage), 100) || 100;