const HelperFunctions = {
    toHSLA: function (hue = 0, alpha = 1, saturation = 100, lightness = 50) {
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
    },
    getObjectID: function (id) {
        // return ability manager-specific id name (to prevent id duplication from other special IDs)
        return "__ABILITY_MANAGER_" + String(id) + "__"
    },
    setObject: function (specs) {
        specs = { ...specs };
        specs.id = this.getObjectID(specs.id);
        if (specs.type != null) specs.type.id = this.getObjectID(specs.type.id);
        game.setObject(specs);
    },
    removeObject: function (id) {
        // remove objects without leaving traces (client issues)
        this.setObject({
            id,
            position: { x:0, y: 0, z: Number.MAX_VALUE },
            rotation: { x:0, y: 0, z: 0 },
            scale: { x:0, y:0, z:0 },
            type: {
                id,
            }
        });
        game.removeObject(this.getObjectID(id));
    },
    setPlaneOBJ: function (options) {
        options = options || {};
        this.setObject({
            ...options,
            position: {
                ...options.position,
                z: GAME_OPTIONS.plane_3D_OBJ_Z_level
            },
            scale: {
                ...options.scale,
                z: 0
            },
            type: {
                ...(options.type || {}),
                obj: RESOURCES.planeOBJ
            }
        })
    },
    fromMapUnitToShipModelUnit: function (value, size) {
        // convert map unit to ship model unit
        return value * AbilityManager.model_conversion_ratio / size;
    },
    clone: function (obj) {
        // clone JSON-parseable object
        return JSON.parse(JSON.stringify(obj));
    },
    timeExceeded: function (timestamp, duration) {
        return game.step > (duration + timestamp);
    },
    timeLeft: function (timestamp) {
        return Math.max(Math.ceil((timestamp - game.step) / 60), 0);
    },
    randInt: function (num) {
        return Math.floor(Math.random() * num);
    },
    randIntInRange: function (start, end) {
        // random x with start <= x < end
        return this.randInt(end - start) + start;  
    },
    spawnCollectibles: function (ship, codes) {
        // spawn collectilble under ship
        for (let i of codes) game.addCollectible({
            x: ship.x,
            y: ship.y,
            code: i
        })
    },
    randomItem: function (list, removeItemAfterRandom = false) {
        if (list.length < 1) return { index: -1, value: null };
        let index = this.randInt(list.length);
        return {
            index,
            value: removeItemAfterRandom ? list.splice(index, 1)[0] : list[index]
        }
    },
    isTeam: function (ship1, ship2) {
        // check if ship2 is on the same team with ship1
        let team1 = TeamManager.getDataFromShip(ship1), team2 = TeamManager.getDataFromShip(ship2);
        
        // if ship1 on ghost team or there are no teams, only itself belongs to its team
        if (team1.ghost || GAME_OPTIONS.teams_count < 1) return ship1.id === ship2.id;

        // else
        return team1.id === team2.id;
    },
    simpleDistance: function (ship = {x: 0, y: 0}, target = {x: 0, y: 0}) {
        // @description simple distance function, just regular math
        return Math.sqrt((target.x - ship.x) ** 2 + (target.y - ship.y) ** 2);
    },
    distance: function(ship = {x: 0, y: 0}, target = {x: 0, y: 0}) {
        const mapsize_xy = game.options.map_size * 10;
        
        const x_diff = ship.x - target.x;
        const y_diff = ship.y - target.y;

        /* jshint ignore:start */
        const x_plus_mapsize = x_diff + mapsize_xy;
        const x_minus_mapsize = x_diff - mapsize_xy;

        const y_plus_mapsize = y_diff + mapsize_xy;
        const y_minus_mapsize = y_diff - mapsize_xy;
        /* jshint ignore:end */

        const d = [
            [x_diff, y_diff],
            [x_diff, y_plus_mapsize],
            [x_diff, y_minus_mapsize],
            [x_plus_mapsize, y_diff],
            [x_minus_mapsize, y_diff],
            [x_plus_mapsize, y_plus_mapsize],
            [x_plus_mapsize, y_minus_mapsize],
            [x_minus_mapsize, y_plus_mapsize],
            [x_minus_mapsize, y_minus_mapsize]
        ];

        let shortestPath, shortestAngle;
        for (let point of d) {
            let path = Math.sqrt(point[0] ** 2 + point[1] ** 2);
            let angle = Math.atan2(point[1], point[0]);

            if (shortestPath == null || shortestPath > path) {
                shortestPath = path;
                shortestAngle = angle;
            }
        }

        return {
            distance: shortestPath,
            angle: shortestAngle
        }
    },
    accelerate: function (ship, speed, angle = null, initial_dependency = 0) {
        // accelerate ship with speed and angle (or ship angle)
        if (angle == null) angle = ship.r;
        if (initial_dependency) speed += Math.sqrt(ship.vx ** 2 + ship.vy ** 2) * initial_dependency;
        ship.set({
            vx: speed * Math.cos(angle),
            vy: speed * Math.sin(angle)
        });
    },
    accelerateToTarget: function (ship, target, strength, push = false) {
        // accelerate ship from/to target with strength
        // push: `true` is push, otherwise pull
        let accelAngle = this.distance(target, ship).angle;
        if (push) accelAngle += Math.PI;
        this.accelerate(ship, strength, accelAngle);
    },
    satisfies: function (ship1, ship2, teammate, enemy) {
        // check if ship2 statisfies condition with ship1
        if (teammate && enemy) return true;
        if (teammate && this.isTeam(ship1, ship2)) return true;
        if (enemy && !this.isTeam(ship1, ship2)) return true;
        return false;
    },
    findEntitiesInRange: function (entity, range, teammate = false, enemy = false, includes = {
        aliens: false, // include aliens
        ships: false, // include asteroids
        asteroids: false, // include ships
        self: false // include itself (see notes below)
    }, dontSort = false) {
        // Find all entities in range
        // Set `donSort` to `true` if you want it to ignore the sorting
        // Set `includeSelf` to `true` if you want to include the entity (if condition matches)
        // Note that please pass `entity` as a ship, asteroid or alien object if neccessary (in case for `includeSelf` to match)
        // or else, just pass this object to `entity`:
        // {
        //     x: Number,
        //     y: Number,
        //     team: any // it will try to find any ships with the same/different team as the defined team ID (if condition matches)
        // }

        includes = includes || {};

        let data = [];

        if (entity == null || !["aliens", "asteroids", "ships", "self"].find(a => includes[a])) return data;

        if (includes.aliens) {
            let isAlien = game.aliens.includes(entity);
            // Only find aliens if:
            // - Given entity is an alien --> teammate =?= true
            // - Given entity is not an alien --> enemy =?= true
            if (isAlien ? teammate : enemy) data.push(...game.aliens.filter(alien => alien != null && alien.id != -1 && (includes.self || !isAlien || alien !== entity) && this.distance(entity, alien).distance <= range))
        }
        
        if (includes.asteroids) {
            let isAsteroid = game.asteroids.includes(entity);
            // Only find asteroids if:
            // - Given entity is an asteroid --> at least `teammate` or `enemy` is `true` (since we don't know if asteroids are friends or foes to each other?)
            // - Given entity is not an asteroid --> enemy =?= true
            if (isAsteroid ? (teammate || enemy) : enemy) data.push(...game.asteroids.filter(asteroid => asteroid != null && asteroid.id != -1 && (includes.self || !isAsteroid || asteroid !== entity) && this.distance(entity, asteroid).distance <= range));
        }

        // Only find ships if either `teammate` or `enemy` is `true`

        if (includes.ships && (teammate || enemy)) data.push(...game.ships.filter(ship => (ship || {}).id != null && ship.alive && (includes.self || ship !== entity) && this.satisfies(entity, ship, teammate, enemy) && this.distance(entity, ship).distance <= range));
        
        if (dontSort) return data;

        return data.sort((a, b) => this.distance(entity, a).distance - this.distance(entity, b).distance);
    },
    damage: function (ship,num) {
        // damage ship by `num` HP
        if (ship.shield < num){
          let val = ship.crystals + ship.shield;
          if (val < num) ship.set({kill:true});
          else ship.set({crystals: val - num, shield: 0});
        }
        else ship.set({shield:ship.shield-num});
    },
    parseUI: function (UI) {
        try { UI = new Object(JSON.parse(JSON.stringify(UI))) } catch (e) { UI = {} }
      
        let id;
        try { id = String(UI.id) } catch (e) { id = '' }
      
        let parsedUI = {
          id: id,
          position: UI.position,
          visible: UI.visible,
          clickable: UI.clickable,
          shortcut: UI.shortcut,
          components: UI.components
        }
      
        if (parsedUI.visible || parsedUI.visible == null) {
          delete parsedUI.visible;
          let position = parsedUI.position, count = 0;
          for (let i = 0 ; i < 4 ; i++) {
            let pos = (position||{})[i];
            if (pos == null || pos == 100) count++
          }
          if (count == 4) delete parsedUI.position
        }
        else {
          parsedUI.position = [0,0,0,0];
          parsedUI.visible = false;
          delete parsedUI.components
        }
      
        if (!parsedUI.clickable) {
          delete parsedUI.clickable;
          delete parsedUI.shortcut
        }
      
        return parsedUI
    },
    sendUI: function (ship, UI) {
        if (ship != null && "function" == typeof ship.setUIComponent) ship.setUIComponent(this.parseUI(UI));
    },
    TimeManager: {
        id_pool: 0,
        setTimeout: function(f,time){
            let id = this.id_pool++;
            this.jobs.set(id, {f: f,time: game.step+time});
            return id;
        },
        clearTimeout: function (id) {
            this.jobs.delete(id);
        },
        jobs: new Map(),
        tick: function() {
          var t = game.step;
          for (let i of this.jobs){
            var job = i[1];
            if (t>=job.time){
              try {
                job.f();
              }
              catch (err){
                console.error(err);
              }
              this.jobs.delete(i[0]);
            }
          }
        }
    },
    fill: function (text, limit) {
        // fill text with whitespaces until limit
        let charLeft = limit - text.length;
        if (charLeft <= 0) return text;
        return " ".repeat(Math.floor(charLeft / 2)) + text + " ".repeat(Math.ceil(charLeft / 2));
    },
    templates: {
        canStart: function (ship) {
            return !ship.custom.inAbility && HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.cooldown);
        },

        canEnd: function (ship) {
            return HelperFunctions.timeExceeded(ship.custom.lastTriggered, this.duration);
        },

        start: function (ship) {
            ship.set({invulnerable: 100, type: this.codes.ability, stats: AbilityManager.maxStats, generator: 0});
        },

        end: function (ship) {
            if (ship.custom.ability === this) ship.set({invulnerable: 100, type: this.codes.default, stats: AbilityManager.maxStats, generator: this.generatorInit});
        },

        tick: function () {},

        initialize: function () {},

        event: function (event, ship) {
            if (event.name == "ship_destroyed" && event.ship == ship && this.endOnDeath) AbilityManager.end(ship);
        },

        requirementsText: function (ship) {
            return HelperFunctions.timeLeft(ship.custom.lastTriggered + this.cooldown);
        },

        abilityName: function (ship) {
            return this.name;
        },

        reload: function (ship) {
            ship.custom.lastTriggered = game.step - this.cooldown;
        },

        unload: function (ship) {
            ship.custom.lastTriggered = game.step;
        },

        onCodeChanged: function () {}
    },
    terminal: {
        errors: 0,
        log: function (text) {
            AbilityManager.echo(`[[bg;azure;][AbilityCompiler\\] ${text}]\n`);
        },
        error: function (text) {
            ++this.errors;
            AbilityManager.echo(`[[bg;#FF7733;][AbilityCompiler\\] ${text}]\n`);
        }
    }
}