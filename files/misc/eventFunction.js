this.event = function (event, game) {
    AbilityManager.globalEvent(event, game);
    let ship = event.ship;
    if (ship == null || ship.id == null || ship.custom.kicked) return;
    switch (event.name) {
        case "ship_spawned":
            TeamManager.set(ship, void 0, false, true);
            HelperFunctions.resetIntrusionWarningMSG(ship);
            UIData.updateScoreboard(game);
            break;
        case "ship_destroyed":
            HelperFunctions.resetIntrusionWarningMSG(ship);
            ship.custom.deaths = (ship.custom.deaths + 1) || 1;
            let killer = event.killer;
            if (killer != null && killer.id != null && !killer.custom.kicked) {
                killer.custom.kills = (killer.custom.kills + 1) || 1;
            }
            UIData.updateScoreboard(game);
            break;
        case "ui_component_clicked":
            if (UIData.blockers.has(event.id)) break;
            if (ship.custom.lastClickedStep != null && game.step - ship.custom.lastClickedStep <= 0.2 * 60) break;
            ship.custom.lastClickedStep = game.step;
            let component = event.id;
            switch (component) {
                case UIData.shipUIs.toggleID:
                    UIData.shipUIs.toggle(ship);
                    break;
                case "next_ship": if (HelperFunctions.canUseButtons(ship)) {
                    let pos = AbilityManager.ships_list.indexOf(ship.custom.shipName) + 1;
                    AbilityManager.assign(ship, AbilityManager.ships_list[pos] || AbilityManager.ships_list[0]);
                    UIData.shipUIs.toggleSelectMenu(ship);
                    break;
                }
                case "prev_ship": if (HelperFunctions.canUseButtons(ship)) {
                    let pos = AbilityManager.ships_list.lastIndexOf(ship.custom.shipName) - 1;
                    AbilityManager.assign(ship, AbilityManager.ships_list.at(pos));
                    UIData.shipUIs.toggleSelectMenu(ship);
                    break;
                }
                default:
                    if (HelperFunctions.canUseButtons(ship) && component.startsWith(UIData.shipUIs.shipSelectPrefix)) {
                        AbilityManager.assign(ship, component.replace(UIData.shipUIs.shipSelectPrefix, ""));
                        UIData.shipUIs.toggleSelectMenu(ship);
                    }
            }
    }
}