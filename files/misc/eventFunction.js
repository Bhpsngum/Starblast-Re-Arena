this.event = function (event, game) {
	AbilityManager.globalEvent(event, game);
	let ship = event.ship;
	if (ship == null || ship.id == null || ship.custom.kicked || !ship.custom.joined) return;
	switch (event.name) {
		case "ship_spawned":
			if (ship.custom.spectator) {
				ship.set({ x: 0, y: 0 });
				break;
			}
			TeamManager.set(ship, void 0, false, true);
			AbilityManager.restore(ship);
			HelperFunctions.resetIntrusionWarningMSG(ship);
			UIData.updateScoreboard(game);
			HelperFunctions.setInvulnerable(ship, GAME_OPTIONS.ship_invulnerability * 60);
			HelperFunctions.spawnShip(ship);
			ship.custom.chooseTimes = {};
			if (game.custom.abilitySystemEnabled && !ship.custom.abilitySystemDisabled) UIData.shipUIs.toggle(ship, false, true);
			break;
		case "ship_destroyed":
			if (ship.custom.spectator) break;
			HelperFunctions.resetIntrusionWarningMSG(ship);
			ship.custom.deaths = (ship.custom.deaths + 1) || 1;
			let killer = event.killer;
			if ((killer || {}).id != null && !killer.custom.kicked) killer.custom.kills = (killer.custom.kills || 0) + 1;
			UIData.updateScoreboard(game);
			break;
		case "ui_component_clicked":
			if (ship.custom.spectator || UIData.blockers.has(event.id)) break;
			if (ship.custom.lastClickedStep != null && game.step - ship.custom.lastClickedStep < GAME_OPTIONS.buttons_cooldown * 60) break;
			ship.custom.lastClickedStep = game.step;
			let component = event.id;
			switch (component) {
				case UIData.shipUIs.toggleID:
					UIData.shipUIs.toggle(ship);
					break;
				case "next_ship": if (HelperFunctions.canUseButtons(ship)) {
					let ships_list = UIData.shipUIs.getUserShipsList(ship, true, true);
					if (ships_list.length < 2) break;
					let pos = ships_list.indexOf(ship.custom.shipName) + 1;
					UIData.assign(ship, function() {
						return AbilityManager.assign(ship, ships_list[pos] || ships_list[0]);
					});
					break;
				}
				case "prev_ship": if (HelperFunctions.canUseButtons(ship)) {
					let ships_list = UIData.shipUIs.getUserShipsList(ship, true, true);
					if (ships_list.length < 2) break;
					let pos = ships_list.lastIndexOf(ship.custom.shipName) - 1;
					UIData.assign(ship, function(){
						return AbilityManager.assign(ship, ships_list[pos] || ships_list.at(-1));
					});
					break;
				}
				case "prev_page": if (HelperFunctions.canUseButtons(ship)) {
					ship.custom.shipSelectPage = (ship.custom.shipSelectPage || 0) - 1;
					UIData.shipUIs.toggleSelectMenu(ship);
					break;
				}
				case "next_page": if (HelperFunctions.canUseButtons(ship)) {
					++ship.custom.shipSelectPage;
					UIData.shipUIs.toggleSelectMenu(ship);
					break;
				}
				case "random_ship": if (HelperFunctions.canUseButtons(ship)) {
					UIData.assign(ship, function () {
						return AbilityManager.random(ship);
					});
					break;
				}
				default:
					let pageData = UIData.shipUIs.ItemID.getIndexFromID(component);
					if (HelperFunctions.canUseButtons(ship) && pageData != null) {
						let shipName = UIData.shipUIs.ItemID.getShipName(ship, pageData);
						if (shipName != null && shipName !== ship.custom.shipName) UIData.assign(ship, function () {
							return AbilityManager.assign(ship, shipName)
						});
					}
			}
			break;
	}
}