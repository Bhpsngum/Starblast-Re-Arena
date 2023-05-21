/* import misc/GameConfig.js */

/* import misc/Misc.js */

/* import misc/tickFunctions.js */

if (DEBUG) {
    const debug = { ...this };
    debug.tick = initialization;
    this.tick = function (game) {
        try { debug.tick(game); } catch (e) { console.error(e) }
    }
}
else this.tick = initialization;

/* import misc/eventFunction.js */

/* import misc/gameOptions.js */

AbilityManager.echo(`[[bg;DarkTurquoise;]Re:][[bg;crimson;]Arena] ([[;Blue;]${__ABILITY_SYSTEM_INFO__.branch}]) [[;Cyan;]v${__ABILITY_SYSTEM_INFO__.version} (Build ID [[;${HelperFunctions.toHSLA(__ABILITY_SYSTEM_INFO__.buildID)};]${__ABILITY_SYSTEM_INFO__.buildID}])\nMap picked: [[b;Cyan;]${MapManager.get().name} by ${MapManager.get().author}\n\nType \`commands\` to see all commands\nAnd \`usage <commandName>\` to show usage of a command\n\n]`);