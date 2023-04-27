/* import templates/Misc.js */

/* import templates/tickFunctions.js */

if (DEBUG) {
    const debug = { ...this };
    debug.tick = initialization;
    this.tick = function (game) {
        try { debug.tick(game); } catch (e) { console.error(e) }
    }
}
else this.tick = initialization;

/* import templates/eventFunction.js */

/* import templates/gameOptions.js */

AbilityManager.echo("[[bg;crimson;]Arena Mod[[bg;DarkTurquoise;] Recontinuation][[;Cyan;]\nRandomized map picked:]][[b;Cyan;] " + MapManager.get().name + " by " + MapManager.get().author + "\n\nType `commands` to see all commands and `usage <commandName>` to show usage of a command\n\n]");