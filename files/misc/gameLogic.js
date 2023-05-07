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

AbilityManager.echo("[[bg;crimson;]Arena Mod[[bg;DarkTurquoise;] Recontinuation][[;Cyan;]\nMap picked:]][[b;Cyan;] " + MapManager.get().name + " by " + MapManager.get().author + "\n\nType `commands` to see all commands\nAnd `usage <commandName>` to show usage of a command\n\n]");