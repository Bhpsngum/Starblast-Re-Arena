this.event = function (event, game) {
	AbilityManager.globalEvent(event, game);
	let ship = event.ship;
	if (ship == null || ship.id == null || ship.custom.kicked) return;
	switch (event.name) {
		case "ship_spawned":
			TeamManager.set(ship, void 0, false, true);
			AbilityManager.restore(ship);
			HelperFunctions.resetIntrusionWarningMSG(ship);
			UIData.updateScoreboard(game);
			ship.set({invulnerable: GAME_OPTIONS.ship_invulnerability * 60});
			ship.custom.chooseTimes = {};
			if (game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled) UIData.shipUIs.toggle(ship, false, true);
			break;
		case "ship_destroyed":
			HelperFunctions.resetIntrusionWarningMSG(ship);
			ship.custom.deaths = (ship.custom.deaths + 1) || 1;
			let killer = event.killer;
			if ((killer || {}).id != null && !killer.custom.kicked) killer.custom.kills = (killer.custom.kills || 0) + 1;
			UIData.updateScoreboard(game);
			break;
		case "ui_component_clicked":
			if (UIData.blockers.has(event.id)) break;
			if (ship.custom.lastClickedStep != null && game.step - ship.custom.lastClickedStep < GAME_OPTIONS.buttons_cooldown * 60) break;
			ship.custom.lastClickedStep = game.step;
			let component = event.id;
			switch (component) {
				case UIData.shipUIs.toggleID:
					UIData.shipUIs.toggle(ship);
					break;
				case "next_ship": if (HelperFunctions.canUseButtons(ship)) {
					let ships_list = AbilityManager.getAssignableShipsList(ship);
					let pos = ships_list.indexOf(ship.custom.shipName) + 1;
					UIData.assign(ship, ships_list[pos] || ships_list[0]);
					break;
				}
				case "prev_ship": if (HelperFunctions.canUseButtons(ship)) {
					let ships_list = AbilityManager.getAssignableShipsList(ship);
					let pos = ships_list.lastIndexOf(ship.custom.shipName) - 1;
					UIData.assign(ship, ships_list.at(pos));
					break;
				}
				default:
					if (HelperFunctions.canUseButtons(ship) && component.startsWith(UIData.shipUIs.shipSelectPrefix)) {
						let shipName = component.replace(UIData.shipUIs.shipSelectPrefix, "");
						if (shipName !== ship.custom.shipName) UIData.assign(ship, shipName);
					}
			}
			break;
	}
}