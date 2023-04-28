const MAKE_COMMANDS = function (echo) {
    let gameCommands = game.modding.commands;

    const locateShip = function(req, handler) {
        let args=req.replace(/^\s+/,"").replace(/\s+/," ").split(" "),id=Number(args[1]||"NaN");
        if (isNaN(id)) game.modding.terminal.error("Please specify a ship id to take action");
        else {
            let ship=game.findShip(id);
            if (!ship) game.modding.terminal.error("Requested ship not found!");
            else {
                try{typeof handler == "function" && handler(ship, id, args)}
                catch(e){game.modding.terminal.error("An error occured while taking action with the requested ship!")}
            }
        }
    }, infoName = function (ship) {
        return `${ship?.name || "ANONYMOUS"} (ID ${ship?.id || "Unknown"})`
    }

    let commands = [], addCommand = function (commandName, resolver, docs = {}) {
        commands.push(commandName);
        resolver.docs = { ...docs };
        gameCommands[commandName] = resolver;
    }, addShipCommand = function (commandName, resolver, doneText = '', docs = {}) {
        // doneText variables
        // %s ship info (name (ID id))
        // %r return value from resolver
        // dontText won't be shown if it's empty
        docs = { ...docs };
        if (!Array.isArray(docs.arguments)) docs.arguments = [];
        docs.arguments.unshift({ name: "id", required: true });
        addCommand(commandName, function (req) {
            locateShip(req, function (ship, id, args) {
                let data = resolver(ship, id, args);
                let info = infoName(ship);
                let text = doneText;
                if (text) text = text.replace(/%r/g, data).replace(/%s/g, info);
                if (text) echo(text);
            });
        }, docs);
    }, showCommandUsage = function (commandName, newline = false) {
        if (!commands.includes(commandName)) return echo(`Not found: '${commandName}'`);
        let command = gameCommands[commandName];
        if (command.docs == null) return echo(`${commandName}: No descriptions found.`);
        let docs = command.docs;
        let args = Array.isArray(docs.arguments) ? docs.arguments : [];
        echo(`${commandName} ${args.map(e => "<" + (e.required ? "" : "?") + e.name + ">").join(' ').trim()}${newline ? "\n": "\t"}[[;#0f60ff;]${docs.description || "No detailed description."}]`);
    }, showShipInfo = function (ship, newline = false) {
        echo([
            `ID: ${ship.id}`,
            `Name: ${ship.name}`,
            showTeamInfo(ship),
            `X: ${ship.x}`,
            `Y: ${ship.y}`,
            `Ship: ${ship.custom.shipName}`,
            ship.custom.inAbility ? "In ability" : "",
            ship.custom.pucked != null || ship.custom.EMP ? "Ability disabled" : ""
        ].filter(e => e).join(`.${newline ? "\n" : " "}`))
    }, showTeamInfo = function (ship) {
        let teamInfo = TeamManager.getDataFromShip(ship);
        return `Team: ${teamInfo.name.toUpperCase()}, Hue: ${teamInfo.hue}, ${teamInfo.ghost ? "Ghost team, " : ""}${teamInfo.spawnpoint ? ("Spawnpoint: X: " + teamInfo.spawnpoint.x + " Y: " + teamInfo.spawnpoint.y) : "No spawnpoint"}`;
    }

    addCommand('commands', function () {
        for (let command of commands) showCommandUsage(command);
    }, {
        description: "Show all commands used by the mod"
    });

    addCommand('usage', function (req) {
        showCommandUsage(req.split(" ").slice(1).join(' '), true);
    }, {
        arguments: [ { name: "command_name", required: true }],
        description: "Show usage of a command"
    });

    addCommand('info', function (req) {
        let id = +req.split(" ").slice(1).join(" ").trim();
        let ship = game.findShip(id);
        if (ship == null || ship.id == null) {
            echo("List of ships and their specs:");
            for (let tship of game.ships) showShipInfo(tship);
        }
        else showShipInfo(ship, true);
    }, {
        arguments: [
            { name: "id", required: false }
        ],
        description: "Show all ship infos (specify id to only check that ship's info)"
    });

    addCommand('sunall', function () {
        for (let ship of game.ships) ship.set({x: 0, y: 0});
        echo('All players has been teleoprted to the sun!');
    }, { description: "Teleport all players to the sun" });

    addCommand('killaliens', function () {
        for (let alien of game.aliens) alien.set({ kill: true });
        echo('Killed all aliens!');
    }, { description: "Kill all aliens" });

    addCommand('map', function (req) {
        MapManager.set(req.split(" ").slice(1).join(" ").trim(), true);
        let info = MapManager.get();
        echo(`Changed map to ${info.name} by ${info.author}`);
    }, {
        arguments: [
            { name: "map_name", required: false }
        ],
        description: "Change map, leave map name blank for random"
    });

    addShipCommand('kick', function (ship, id, args) {
        ship.custom.kicked = true;
        ship.gameover({
            "You've been kicked by the map host": " ",
            "Reason": args.slice(2).join(" ") || "No reason has been provided"
        });
    }, '%s has been kicked', {
        arguments: [
            { name: "reason", required: false }
        ],
        description: "Kick a ship"
    }); 

    addShipCommand('restore', function (ship, id, args) {
        let abil = ship.custom.ability;
        ship.set({
            shield: 1e4,
            crystals: (abil != null ? abil : AbilityManager).crystals,
            stats: AbilityManager.maxStats
        });
    }, '%s has been restored', {
        description: "Restore a ship's health and crystals"
    });

    addShipCommand('assign', function (ship, id, args) {
        AbilityManager.assign(ship, args.slice(2).join(' ').trim());
        return ship.custom.shipName;
    }, '%s has been set to %r', {
        arguments: [
            { name: "ship_name", required: false }
        ],
        description: "Set a ship to a specific ability ship, leave ship name blank for random assignment"
    });

    addShipCommand('reload', function (ship, id, args) {
        AbilityManager.reload(ship);
    }, 'Skipped cooldown for %s', {
        description: "Skip cooldown for a ship"
    });

    addShipCommand('kill', function (ship, id, args) {
        ship.set({ kill: true });
    }, '%s has been killed', {
        description: "Kills a ship"
    });

    addShipCommand('team', function (ship, id, args) {
        let team = args.slice(2).join(' ').trim();
        let teamInfo = TeamManager.getDataFromShip(ship);
        if (team) {
            let newTeam = TeamManager.getDataFromID(team);
            if (newTeam == teamInfo) return `%s is already on ${teamInfo.name.toUpperCase()}`;
            teamInfo = newTeam;
            TeamManager.set(ship, team, true, false);
            HelperFunctions.TimeManager.setTimeout(function () {
                UIData.updateScoreboard(game);
            }, 60);
        }
        return team ? `Set %s to team ${teamInfo.name.toUpperCase()}`: showTeamInfo(ship);
    }, '%r', {
        arguments: [
            { name: "team_id", required: false }
        ],
        description: "Get/Set ship's team info"
    });

    addShipCommand('tptoship', function (ship1, id1, args) {
        let id2 = +args.slice(2).join(' ');
        let ship2 = game.findShip(id2);
        if (ship2 == null || ship2.id == null) {
            game.modding.terminal.error(`Failed: Ship with ID ${id2} doesn't exist`);
            return '';
        }
        ship1.set({ x: ship2.x, y: ship2.y });
        return `Teleported %s to ${infoName(ship2)}!`;
    }, '%r', {
        arguments: [
            { name: "id2", required: true }
        ],
        description: "Teleport from ship to ship2"
    });

    addShipCommand('tptoxy', function (ship, id, args) {
        let pos = {
            x: args[2],
            y: args[3]
        }
        if (pos.x == null || pos.x == "" || isNaN(pos.x)) delete pos.x; else pos.x = +pos.x;
        if (pos.y == null || pos.y == "" || isNaN(pos.y)) delete pos.y; else pos.y = +pos.y;
        if ('x' in pos || 'y' in pos) {
            ship.set(pos);
            return `Teleported %s to ${['x' in pos ? "X: " + pos.x : "", 'y' in pos ? "Y: " + pos.y : ""].join(' ').trim()}`;
        }
        return "Nothing to teleport to"
    }, `%r`, {
        arguments: [
            { name: "x", required: false },
            { name: "y", required: false }
        ],
        description: "Teleport ship to position x and/or y"
    });
}