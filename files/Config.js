const DEBUG = true; // if in debug phase

const map_name = `Arena Mod v4.0 Early Beta Test`;

const GAME_OPTIONS = {
    map_size: 100,
    waiting_time: 30, // in seconds
    teams_count: 2, // number of teams
    required_players: 2, // players required to start, min 2
    max_players: 80,
    duration: 30 * 60, // in seconds
    points: 100, // points for one team to reach in order to win
    healing_ratio: 1, // better don't touch this
    ship_ui_timeout: 15, // time for the ship ui to hide, in seconds
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
    score_increase: 0.10, // team points increases per sec for the dominating team
    texture: {
        url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/capture_area.png",
        scale: 2.24,
    }
}

const BASES = {
    size: 45, // in radius
    intrusion_damage: 145, // damage per sec if enemy enters the base
    textures: [ // textures list to choose from (randomized)
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_0.png",
            scale: 2.24
        },
        {
            url: "https://raw.githubusercontent.com/Bhpsngum/Arena-mod-remake/main/resources/textures/base_1.png",
            scale: 2.24
        }
    ]
}

/* import Teams.js */

/* import Maps.js */

// don't remove those
GAME_OPTIONS.required_players = Math.max(GAME_OPTIONS.required_players, 2) || 2; // restriction
GAME_OPTIONS.teams_count = Math.min(Math.max(GAME_OPTIONS.teams_count, 0), 5) || 0; // restriction
CONTROL_POINT.control_bar.dominating_percentage = Math.min(Math.max(CONTROL_POINT.control_bar.controlling_percentage, CONTROL_POINT.control_bar.dominating_percentage), 100) || 100;