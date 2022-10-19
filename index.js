

class Tile {
    //x, y are pixel positions on the whole canvas
    constructor(x, y, col, row) {
        this.x = x; 
        this.y = y;
        this.col = col; // x position in the map[y][x]
        this.row = row; // y position in the map[y][x]
        this.hasWorld = false;
        this.worldIndex = -1; //where the world is on the settings.worlds array
    }
}

class SelectRing { 
    constructor(x, y) {
      //this.x = tile.x;
      //this.y = tile.y;
      this.x = x;
      this.y = y;
      this.maxFrames = 200; //frames are looped
      this.frame = 0;
      this.frameDur = 10; //ms
      this.lastFrame = Date.now();
      this.radMod = 10; //px to change radius in anim
      this.animProg = 0; //percent, 0-1
  
      //this.rad = settings.grid.size/2 - 10;
      //this.rad = settings.grid.size;
      this.rad = 15;
      this.lineW = settings.selectRing.opa;;
      //this.rInc = 5;
      //this.decreaseInc = 5;
      this.opa = settings.selectRing.opa;
      //this.opaInc = 0.2;
    }
    remove() { settings.selectRing.rings.shift();  }
    //decreaseOpa() { this.opa = this.opa - this.opaInc; }
    //increaseRadius() { this.r = this.r + this.rInc; }
    setAnimProg() {  this.animProg = (this.frame / this.maxFrames)}
    getAnimProg() { return this.animProg; }
}


//more generic blip
class Blip { 
    constructor(x, y, dataObj, target) {
        this.x = x;
        this.y = y;
        this.maxFrames = dataObj.maxFrames; 
        this.frame = 0;
        this.frameDur = dataObj.frameDur; //ms
        this.lastFrame = Date.now();

        this.rad = 0; //blips start from nothing
        this.lineW = dataObj.lineW;
        this.radInc = dataObj.radInc;
        this.opa = dataObj.opa;
        this.opaInc = dataObj.opaInc;
        this.color = dataObj.color;
        this.done = false; //when blip is done it's not drawn. Old blips are cleaned in createBlip function with a limit amount.
        //blip may have target which it follows
        (target === 'none') ?  this.target = -1 : this.target = target;
        this.limit()
    }
    //remove() { settings.blip.blips.shift();  }
    setAsDone() { this.done = true;  }
    decreaseOpa() { this.opa = this.opa - this.opaInc; }
    increaseRadius() { this.rad = this.rad+ this.radInc; }

    limit() {
        if (settings.blip.blips.length > settings.blip.maxBlips) { settings.blip.blips.shift(); }
        //log("limiting")
    }
    followTarget() {
        //if Blip has a target entity, follow it
        if (this.target === -1) { return false; }
        this.x = this.target.x;
        this.y = this.target.y;
    }
}


class World { 
    constructor(tile) {
        this.tile = tile;
        this.name = getPlanetName();
        //this.pop = createPop();
        this.img = selectFrom(settings.images.world.imgs);
        this.power = ranNum(5,20);
        this.maxHp = settings.world.maxHp;
        this.hp = this.maxHp;

        
        this.nameColor = selectFrom(settings.world.nameColors);
        this.tilePos = {
            x: ranNum(settings.world.rad*2, settings.grid.size-settings.world.rad*2), 
            y: ranNum(settings.world.rad*2, settings.grid.size-settings.world.rad*2)
        }
        this.maxBars = 10;
        this.dead = false;
        //this.shipNum = -1;
        this.visible = false;
        this.x = this.tile.x + this.tilePos.x;
        this.y = this.tile.y + this.tilePos.y;
    }
    kill() {
        this.dead = true;
        this.nameColor = settings.world.deadNameColor;
        createBlip(this.x, this.y, 'worldExplosion');
        createBlip(this.x, this.y, 'warning');

        //multiple explosions animation
        let explos = 15; 
        let rad = settings.grid.size / 2;
        for (let i = 1; i <= explos; i++) {
            setTimeout( () => {
                let x = ranNum(this.x-rad, this.x+rad);
                let y = ranNum(this.y-rad, this.y+rad);
                createBlip(x, y, "warning");
            }, 0 + 100*i); 
        }

        //check if all worlds are dead
        if (settings.worlds.every(obj => obj.dead = true)) {
            //log("all worlds are dead")
            settings.wave.lostOnWave = settings.wave.current.number;
        }
        //if all
    }
    getX() {
        let x = this.tile.x + this.tilePos.x;
        return x;
    }
    getY() {
        let y = this.tile.y + this.tilePos.y;
        return y;
    }
    damage(num) {
        if (!this.dead && !settings.godMode) {
            this.hp -= num;
            if (this.hp <= 0) { this.kill(); }
        }
    }
    heal(num) {
        if (!this.dead) {
            this.hp += num;
            if (this.hp >= this.maxHp) { this.hp = this.maxHp}
        }
    }

}


//dataObj is the object with building data in settings.buildings.towers
class Building { 
    constructor(x, y, dataObj, weaponType) {
        this.id = settings.buildings.idCounter;
        settings.buildings.idCounter++;
        this.x = x;
        this.y = y;
        this.name = dataObj.name;
        this.desc = dataObj.desc;
        this.imageFile = dataObj.imageFile;
        this.shortName = dataObj.shortName; //used in flavor only
        //this.range = dataObj.range; 
        this.level = 1;

        this.weapon = {}
        //copy all weapon data to building, we can upgrade the stats later
        Object.assign(this.weapon, settings.weapons.types[weaponType]);
        this.weapon.lastFire = Date.now();
        this.weapon.type = weaponType;

        this.upgradeBaseCost = this.weapon.upgrade.baseCost;
        this.upgradeCost = -1;
        this.setUpgradeCost();

        this.target = -1;
        this.flavorName = this.generateFlavorName();
        this.color = dataObj.color;

    }
    generateFlavorName() {
        let name = "";
        name += `${this.weapon.type}-`;
        name += `${this.shortName}-`;
        name += `${this.x}${this.y}-`;
        name += `${romanize(this.id)}`;
        return name;
    } 
    useWeapon() {
        if (this.target.dead) { 
            this.target = -1;
            return false;
        }
        let now = Date.now();
        let fireSpeed = this.weapon.fireSpeed;
        let speed = this.weapon.projectileMoveSpeed;
        let lastFire = this.weapon.lastFire;

        if (this.weapon.type === 'gatling') {
            if (now > lastFire + fireSpeed*1000) {
                this.weapon.lastFire = now;
                speed = speed * ranNum(1, 1.05);
                const projectile = new GatlingBullet(this);
                settings.gatlingBullets.push(projectile);
            }
        }
        if (this.weapon.type === 'missile') {
            if (now > lastFire + fireSpeed*1000) {
                this.weapon.lastFire = now;
                const projectile = new Missile(this);
                settings.missiles.push(projectile);
            }
        }
        if (this.weapon.type === 'torpedo') {
            if (now > lastFire + fireSpeed*1000) {
                this.weapon.lastFire = now;
                const projectile = new Torpedo(this);
                settings.torpedos.push(projectile);
            }
        }
    }
    setUpgradeCost() {
        //clicker-raider monster hp skaalaus:
        //var lvl = game.curLevel;
        //var hp = baseHP*(lvl**2);
        //var hp = baseHP * ( lvl-1 + (1.55**(lvl-1)) );
        const baseCost = this.upgradeBaseCost;
        const lvl = this.level;
       
        let cost = baseCost * ( lvl-1 + (1.55**(lvl-1)) )
        //log(cost)
        this.upgradeCost = cost;
        const buttonElem = document.getElementById('upgrade'); 
        buttonElem.innerHTML = `Upgrade<br> ${this.upgradeCost.toFixed(0)}`;
    }
    upgrade() {
        this.level += 1;
        const level = this.level;
        this.setUpgradeCost();
      

        const weaponType = this.weapon.type;

        this.weapon.damage += this.weapon.damage * (level * 0.01);
        //this.weapon.range += this.weapon.range *  (level * 0.001);
        //this.weapon.fireSpeed *= (1 - level * 0.01);
        
        if (weaponType === 'torpedo') {

        } else if (weaponType === 'missile') {
            //this.weapon.explosionRadius += this.weapon.explosionRadius * (level * 0.01);
            this.weapon.explosionDamage += this.weapon.explosionDamage * (level * 0.01);
        }


    }
}

class BuildAnimation { 
    constructor(x, y, dataObj) {
      this.x = x;
      this.y = y;
      this.done = false; //if animation is done, if it's done dont do anything
      this.buildingData = dataObj;
      this.buildTime = dataObj.buildTime; 
      this.buildTimeLeft = dataObj.buildTime;
      this.buildStartTime = Date.now();
      this.weaponType = dataObj.weapon;
      this.weapon = settings.weapons.types[dataObj.weapon];
      this.maxFrames = 50; //frames are looped
      this.frame = 0;
      this.frameDur = 10; //ms
      this.lastFrame = Date.now();
      this.rad = 0;
      this.radInc = 1;
      this.opaInc = 0.02;
    }
    setAsDone() { 
        this.done = true;
        createBlip(this.x, this.y, "buildingReady");
        const newBuilding = new Building(this.x, this.y, this.buildingData, this.weaponType);
        settings.buildings.built.push(newBuilding);
    }
    decreaseOpa() { this.opa = this.opa - this.opaInc; }
    increaseRadius() { this.rad = this.rad+ this.radInc; }
}



class Ship { 
    constructor(x, y, enemyBoolean, shipTypeStr, weaponTypeStr) {
        const shipData = settings.ships.types[shipTypeStr];
        this.x = x;
        this.y = y;
        this.enemy = enemyBoolean;
        this.shipType = shipTypeStr;

        this.hp = wave.getShipHp(shipTypeStr);
        this.armor = shipData.armor;
        this.speed = shipData.speed;
        this.color = shipData.color;
        this.drop = {}
        this.drop.money = shipData.drop.money;

        this.weapon = {}
        //copy all weapon data to ship
        Object.assign(this.weapon, settings.weapons.types[weaponTypeStr]);
        this.weapon.lastFire = Date.now();
        this.weapon.type = weaponTypeStr;

        this.dead = false;
        this.attackVector = 'line'; //line curve


        this.target = settings.worlds[0];

        this.moveTarget = { //the ship's movement destination
            x: this.target.x,
            y: this.target.y,
        }

    }
    kill() {
        this.dead = true;
        createBlip(this.x, this.y, 'shipExplosion');
        money.add(this.drop.money);
        wave.enemyKilled();

        /*createBlip(this.x, this.y, 'worldExplosion');
        let explos = 10;  //multiple explosions animation
        let rad = settings.grid.size / 2;
        for (let i = 1; i <= explos; i++) {
            setTimeout( () => {
                let x = ranNum(this.x-rad, this.x+rad);
                let y = ranNum(this.y-rad, this.y+rad);
                createBlip(x, y, "shipExplosion");
            }, 0 + 100*i); 
        }*/
    }
    damage(num) {
        if (!this.dead) {
            this.hp -= num;
            if (this.hp <= 0) { this.kill(); }
        }
    }
    moveTowardsTarget() {
        const speed = this.speed;
        const multi = speed / 100;

        const x1 = this.x;
        const y1 = this.y;
        const x2 = this.moveTarget.x;
        const y2 = this.moveTarget.y;

        const dir = Math.atan2(y2 - y1, x2 - x1);
        const deltaX = Math.cos(dir); 
        const deltaY = Math.sin(dir);

        const pointX = deltaX * multi;
        const pointY = deltaY * multi;
        this.x = this.x + pointX;
        this.y = this.y + pointY;
    }
    useWeapon() {
        if (this.target.dead) { return false }
        let now = Date.now();

        if (this.weapon.type === 'gatling') {
            if (now > this.weapon.lastFire + this.weapon.fireSpeed*1000) {
                this.weapon.lastFire = Date.now();
                const projectile = new GatlingBullet(this);
                settings.gatlingBullets.push(projectile);
            }
        }
        if (this.weapon.type === 'torpedo') {
            if (now > this.weapon.lastFire + this.weapon.fireSpeed*1000) {
                this.weapon.lastFire = Date.now();
                const projectile = new Torpedo(this);
                settings.torpedos.push(projectile);
            }
        }
    }
}


class GatlingBullet { 
    constructor(owner) {
      this.x = owner.x;
      this.y = owner.y;
      this.target = owner.target; //the target entity, eg. World, Ship
      this.targetX = this.target.x;
      this.targetY = this.target.y;
   
      this.done = false; //when bullet has hit or is destroyed etc.

      this.tracer = { //tracer bullet line start and end coords
        x1:this.x, y1:this.y, x2:this.x, y2:this.y
      }
    
      this.damage = owner.weapon.damage;
      this.hitbox = owner.weapon.hitbox;
      this.speed = owner.weapon.projectileMoveSpeed * ranNum(1, 1.05);   
    }
    //move bullet towards target
    moveTowardsTarget() {
        const speed = this.speed;
        const multi = speed / 100;
        const dist = 10; //length of bullet tracer line

        const x1 = this.x;
        const y1 = this.y;
        const x2 = this.targetX; //bullets fly in straight line instead of homing in
        const y2 = this.targetY;

        let dir = Math.atan2(y2 - y1, x2 - x1);

        const deltaX = Math.cos(dir); 
        const deltaY = Math.sin(dir);

        const pointX = deltaX * multi;
        const pointY = deltaY * multi;

        this.tracer.x1 +=  pointX;
        this.tracer.y1 +=  pointY;
        this.tracer.x2 =  this.tracer.x1 - dist*deltaX;
        this.tracer.y2 =  this.tracer.y1 - dist*deltaY

        this.x = this.x + pointX;
        this.y = this.y + pointY;
    }
}


class Missile { 
    constructor(owner) {
      this.x = owner.x;
      this.y = owner.y;
      this.target = owner.target; //the target entity
      this.targetX = this.target.x;
      this.targetY = this.target.y;
  
      this.done = false; //when projectile has hit or is destroyed etc.
      this.damage = owner.weapon.damage;
      this.explosionDamage = owner.weapon.explosionDamage;
      this.explosionRadius = owner.weapon.explosionRadius;
      this.hitbox = owner.weapon.hitbox;
      this.speed = owner.weapon.projectileMoveSpeed;
      this.timeToFullSpeed = owner.weapon.timeToFullSpeed;

      this.tracer = { //tracer  line start and end coords
        x1:this.x, y1:this.y, x2:this.x, y2:this.y
      }
      this.smoke = {
        last: Date.now(),
        interval: 20, //ms
        offset: 1, //px
      }
      this.launched = Date.now();
      this.flyTime = 2000 //ms;
    
      this.curveCp = this.createCurveControlPoint()
      this.curve = -1;
      this.createCurve();

    }
    createCurve() {
        //3 points for a bezier curve
        //https://pomax.github.io/bezierjs/
        const ob1 = {x:(this.x), y:(this.y)} 
       
        //const ob3 = {x:( this.targetX*0.5 ), y:( this.targetY*0.5 )}
        const ob2 = {x:( this.curveCp.x ), y:( this.curveCp.y )}
        const ob3 = {x:(this.target.x), y:(this.target.y)}

        //start, end, control point
        let curve = new Bezier(ob1, ob2, ob3);
        this.curve = curve;
        //log(curve.intersects())
    }
    createCurveControlPoint() {
        let x1 = this.x;
        let y1 = this.y;
        let x2 = this.target.x;
        let y2 = this.target.y;

        let middleX = (x1+x2)/2;
        let middleY = (y1+y2)/2;
        let x = middleX + ranNum(-100,100)
        let y = middleY  + ranNum(-100,100)
    
        const controlPoint = { x: x, y: y }
        return controlPoint;
    }
    smokeTrail() {
        let now = Date.now();
        if (now > this.smoke.last + this.smoke.interval) {
            this.smoke.last = Date.now();
            let offset = this.smoke.offset; 
            let x = ranNum(this.x-offset, this.x+offset);
            let y = ranNum(this.y-offset, this.y+offset);
            createBlip(x, y, 'missileTrail');
        }
    }
    //move missile towards target
    moveTowardsTarget() {
        //calculate progress to full speed to make missile speed up
        let speedProg = (Date.now() - this.launched) / this.timeToFullSpeed;
        speedProg = (5**speedProg - 1) * 0.01;
        //log(speedProg)
        if (speedProg > 1) { speedProg = 1; }

        let speed = this.speed * speedProg ;
        let multi = speed / 100;
        const dist = 5; //length of  tracer line

        
        this.createCurve() 
        const curve = this.curve;

        let x1 = this.x;
        let y1 = this.y;

        let prog2 = (Date.now() - this.launched) / this.flyTime;
        if (prog2 > 1) { prog2 = 1; }
        prog2 = prog2

        let point = curve.get(prog2);
        let x2 = point.x;
        let y2 = point.y;

        const dir = Math.atan2(y2 - y1, x2 - x1);
        const deltaX = Math.cos(dir); 
        const deltaY = Math.sin(dir);
        
        if (multi > 5) {
            multi = 5
        }

        let pointX = deltaX * (multi);
        let pointY = deltaY * (multi);

        this.tracer.x1 +=  pointX;
        this.tracer.y1 +=  pointY;
        this.tracer.x2 = this.tracer.x1 - dist*deltaX;
        this.tracer.y2 = this.tracer.y1 - dist*deltaY

        this.x += pointX;
        this.y += pointY;
        this.smokeTrail();
    }
    explode() {
        //missile explodes on hit, creates AOE explosion
        //
        const rad = this.explosionRadius;
        const dmg = this.explosionDamage;
        const explo = new AoeExplosion(this.x, this.y, rad);
        settings.aoeExplosions.push(explo);

        //deal damage here, draw animation on frames later
        const ships = settings.ships.enemy;
        for (let i = 0; i < ships.length; i++) {
            const ship = ships[i];
 
            const dist = getDistance(this.x, this.y, ship.x, ship.y); 
       
            if (dist <= rad) {
                //ship is in range, damage it
                ship.damage(dmg);
                createBlip(ship.x, ship.y, 'miniExplosion');
            }
        }

    }
}

class AoeExplosion { 
    constructor(x, y, rad) {
        this.x = x;
        this.y = y;
        this.rad = rad;
        this.startRad = this.rad;

        this.maxFrames = 10; 
        this.frame = 0;
        this.frameDur = 20; //ms
        this.lastFrame = Date.now();
        
        this.lineW = 5
        this.radInc = -1;
        this.opa = 0.99;
        this.startOpa =  this.opa;
        this.opaInc = 0.05;
        //this.color = 'rgba(255,255,255,0.5)';
        this.color = {r:'255', g:'255', b:'150'},  
        this.done = false; //when anim is done
        this.animProg = 0; //percent, 0-1
    }
    setAsDone() { this.done = true;  }
    decreaseOpa() { 
        let opa =  (1-this.getAnimProg()) * this.startOpa;
        //this.opa = this.opa - this.opaInc; 
        this.opa = opa;
    }
    increaseRadius() { 
        this.rad = this.rad + this.radInc; 
        if (this.rad < 0.9*this.startRad) { 
            //this.rad = 0.9*this.startRad; 
        }

        if (this.rad < 0) { 
            this.rad = 0; 
        }
    }
    setAnimProg() {  this.animProg = (this.frame / this.maxFrames)}
    getAnimProg() { return this.animProg; }
}


class Torpedo { 
    constructor(owner) {
        this.x = owner.x;
        this.y = owner.y;
        this.target = owner.target; //the target entity, eg. World
        this.targetX = this.target.x;
        this.targetY = this.target.y;
       
        this.done = false; //when projectile has hit or is destroyed etc.
        this.damage = owner.weapon.damage;
        this.hitbox = owner.weapon.hitbox;
        this.speed = owner.weapon.projectileMoveSpeed;
        this.damage = owner.weapon.damage;
        this.timeToFullSpeed = owner.weapon.timeToFullSpeed;

        this.tracer = { //tracer  line start and end coords
            x1:this.x, y1:this.y, x2:this.x, y2:this.y
        }
        this.smoke = {
            last: Date.now(),
            interval: 20, //ms
            offset: 1, //px
        }
        this.launched = Date.now();
    }
    smokeTrail() {
        let now = Date.now();
        if (now > this.smoke.last + this.smoke.interval) {
            this.smoke.last = Date.now();
            let offset = this.smoke.offset; 
            let x = ranNum(this.x-offset, this.x+offset);
            let y = ranNum(this.y-offset, this.y+offset);
            createBlip(x, y, 'torpedoTrail');
        }
    }
    //move torpedo towards target
    moveTowardsTarget() {
        //calculate progress to full speed to make torpedo speed up
        let prog = (Date.now() - this.launched) / this.timeToFullSpeed;
        if (prog > 1) { prog = 1; }
 
        let speed = this.speed * prog ;

        const multi = speed / 100;
        const dist = 2; //length of  tracer line

        const x1 = this.x;
        const y1 = this.y;
        let x2 = this.targetX;
        let y2 = this.targetY;
        x2 = this.target.x;
        y2 = this.target.y;
       

        let dir = Math.atan2(y2 - y1, x2 - x1);

        const deltaX = Math.cos(dir); 
        const deltaY = Math.sin(dir);

        const pointX = deltaX * multi;
        const pointY = deltaY * multi;
 
        this.tracer.x1 +=  pointX;
        this.tracer.y1 +=  pointY;
        this.tracer.x2 =  this.tracer.x1 - dist*deltaX;
        this.tracer.y2 =  this.tracer.y1 - dist*deltaY

        this.x = this.x + pointX;
        this.y = this.y + pointY;
        this.smokeTrail();
    }
}


//process torpedos
const processTorpedos = () => {
    for (let i = 0; i < settings.torpedos.length; i++) {
        const torpedo = settings.torpedos[i];

        //getDistance = (x1, y1, x2, y2) 
        const dist = getDistance(torpedo.x, torpedo.y, torpedo.target.x, torpedo.target.y); //distance to target

        if (torpedo.target.dead) {
            //torpedo target is dead
        }

        //hit box of 5
        const hitboxArea = torpedo.hitbox;
        if (!torpedo.done && dist <= hitboxArea) {
            torpedo.done = true;
            torpedo.target.damage(torpedo.damage);
            //make mini explosion on hit on bullet target
            let offset = 3; //for the miniExplosion
            let exploX = ranNum(torpedo.target.x-offset, torpedo.target.x+offset);
            let exploY = ranNum(torpedo.target.y-offset, torpedo.target.y+offset);
            createBlip(exploX, exploY, 'miniExplosion');
            continue;
        } else if (!torpedo.done) {
            torpedo.moveTowardsTarget();
        } 
    }
    //purge the oldest (1st) projectile if it's done
    if (settings.torpedos.length > 0 && settings.torpedos[0].done) {
        settings.torpedos.shift();
    }
}



//process missiles
const processMissiles = () => {
    for (let i = 0; i < settings.missiles.length; i++) {
        const missile = settings.missiles[i];

        //getDistance = (x1, y1, x2, y2) 
        const dist = getDistance(missile.x, missile.y, missile.target.x, missile.target.y); //distance to target

        if (missile.target.dead) {
            //missile target is dead
        }

        //hit box of 5
        const hitboxArea = missile.hitbox;
        if (!missile.done && dist <= hitboxArea) {
            missile.done = true;
            missile.target.damage(missile.damage);
            missile.explode();
            //make mini explosion on hit on target
            let offset = 3; //for the miniExplosion
            let exploX = ranNum(missile.target.x-offset, missile.target.x+offset);
            let exploY = ranNum(missile.target.y-offset, missile.target.y+offset);
            createBlip(exploX, exploY, 'miniExplosion');
            continue;
        } else if (!missile.done) {
            missile.moveTowardsTarget();
        } 
    }
    //purge the oldest (1st) projectile if it's done
    if (settings.missiles.length > 0 && settings.missiles[0].done) {
        settings.missiles.shift();
    }
}






const createEnemyShips = () => {
    let amount = 10;
    let spawnDelay = 200; //ms

    for (let i = 0; i < amount; i++) {
        setTimeout( () => {
            //const size = settings.grid.size;

            const world = settings.worlds[0];
            const grid = settings.grid.pos;
        
            let x = ranNum(grid.x1, grid.x2);
            let y = ranNum(grid.y1, grid.y2);

            while ( getDistance(world.x, world.y, x, y) < 10*settings.grid.size) {
                x = ranNum(grid.x1, grid.x2);
                y = ranNum(grid.y1, grid.y2);
            }

    
            const ship = new Ship(x, y, true, 'cruiser', 'gatling');
            settings.ships.enemy.push(ship);
            createBlip(x, y, 'warning', ship);
        }, 0 + spawnDelay*i); 
    }
}



//enemy ship game logic
const processShips = () => {
    for (let i = 0; i < settings.ships.enemy.length; i++) {
        const ship = settings.ships.enemy[i];
        if (ship.dead) {
            continue;
        }
        const dist = getDistance(ship.x, ship.y, ship.moveTarget.x, ship.moveTarget.y); //distance to target

        if(dist > ship.weapon.range*settings.grid.size) {
            //ship is not in attack range of target, move ship
            ship.moveTowardsTarget()
        } else {
            //target is in range, attack
            ship.useWeapon()
        }
    }
}

//process gatling bullets
const processGatlingBullets = () => {
    for (let i = 0; i < settings.gatlingBullets.length; i++) {
        const bullet = settings.gatlingBullets[i];

        //getDistance = (x1, y1, x2, y2) 
        const dist = getDistance(bullet.x, bullet.y, bullet.targetX, bullet.targetY); //distance to target
        

        //hit box of 5
        const hitboxArea = bullet.hitbox;
        if (!bullet.done && dist <= hitboxArea) {
            bullet.done = true;
            bullet.target.damage(bullet.damage);
            //make mini explosion on hit on bulelt target
            let offset = 3; //for the miniExplosion
            let exploX = ranNum(bullet.target.x-offset, bullet.target.x+offset);
            let exploY = ranNum(bullet.target.y-offset, bullet.target.y+offset);
            createBlip(exploX, exploY, 'miniExplosion');
            continue;
        } else if (!bullet.done && bullet.target.dead) {
            //bullet.done = true;
            //continue;
        }

        bullet.moveTowardsTarget();
    }
    //purge the oldest (1st) bullet if it's done
    if (settings.gatlingBullets.length > 0 && settings.gatlingBullets[0].done) {
        settings.gatlingBullets.shift();
        //log('purge old bullet');
    }
}


//OLD process building game logic
const oldProcessBuildings = () => {
    const ships = settings.ships.enemy;
    const buildings = settings.buildings.built;

    //each tower checks all enemies if they're in rage
    //maybe not the most efficient way

    for (let i = 0; i < buildings.length; i++) {
 
        const building = buildings[i];
        building.target = -1;
      
        for (let j = 0; j < ships.length; j++) {
            const ship = ships[j];
            const dist = getDistance(building.x, building.y, ship.x, ship.y); 
       
            if (dist <= building.weapon.range*settings.grid.size) {
                building.target = ship;
                building.useWeapon()
            }
        }

    }
}




//select random target, not just the 1st one found
//buildings shoot random target in range each shot, no focusing at all
//prioritize heavy ships like "battleship"
const processBuildings2 = () => {
    const ships = settings.ships.enemy;
    const buildings = settings.buildings.built;
    const priorityShips = ['battleship'];

    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        building.target = -1;
        const shipsInRange = []
      
        for (let j = 0; j < ships.length; j++) {
            const ship = ships[j];
            const dist = getDistance(building.x, building.y, ship.x, ship.y); 
       
            if (!ship.dead && dist <= building.weapon.range*settings.grid.size) {
                shipsInRange.push(ship);
                if (priorityShips.indexOf(ship.shipType) > -1 ) {
                    //ship is on priority list, set it as target
                    building.target = ship;
                    building.useWeapon();
                    continue;
                }
            }
        }

        //shoot random ship, no priority ships were found
        if (shipsInRange.length > 0) {
            const ship = selectFrom(shipsInRange);
            building.target = ship;
            building.useWeapon();
        }
    }
}


//process regen ticks for world(s)
const regen = () => {
    let now = Date.now();
    let last = settings.world.regen.last;
    let interval = settings.world.regen.interval;
    let amount = settings.world.regen.amount;

    if (now > last + interval) {
        for (let i = 0; i < settings.worlds.length; i++) {
            const world = settings.worlds[i];
            world.heal(amount);
        }
        settings.world.regen.last = now;
    }
}



const getDistance = (x1, y1, x2, y2) => {
    const dist = Math.sqrt(Math.pow((x1-x2), 2)+Math.pow((y1-y2), 2))
    //log(`distance is: ${dist}`)
    return dist;
}

const createBlip = (x, y, typeStr, target = 'none') => {
    const blipTypes = Object.keys(settings.blip);
    let typeDataObj;
    for (let i = 0; i < blipTypes.length; i++) {
        if (typeStr === blipTypes[i]) {
            typeDataObj = settings.blip[typeStr];
            //log(typeDataObj)
        }
    }
    const blip = new Blip(x, y, typeDataObj, target);
    settings.blip.blips.push(blip);
}



const placeBuilding = () => {
    if ( mouseIsInsideGrid() ) {
        const buildingData = settings.buildings.towers[settings.buildings.selectedIndex];
        if (money.get() < buildingData.cost) {
            //cant afford the building
            //do some animation here to indicate that can't afford
            return false
        }

        money.add(-buildingData.cost);
        const x = settings.mouse.x;
        const y = settings.mouse.y;


        //create a build animation instead of building, after it's done create the building there
        //const newBuilding = new Building(x, y, buildingData);
        //settings.buildings.built.push(newBuilding);
        const anim = new BuildAnimation(x, y, buildingData);
        settings.buildings.buildAnimations.push(anim);
        //createWarningBlip(x, y);
        createBlip(x, y, "buildingPlaced");
        //createBlip(x, y, "warning");


    }
}



const createMap = () => {
    const w = settings.w //tiles
    const h = settings.h //tiles
    const size = settings.grid.size;
    const xOffset = (settings.bg.w - w*size) / 5;
    const yOffset = (settings.bg.h - h*size) / 2 ;
    settings.grid.offset.x = xOffset;
    settings.grid.offset.y = yOffset;

    settings.grid.pos.x1 = xOffset;
    settings.grid.pos.y1 = yOffset;
    settings.grid.pos.x2 = xOffset + w*size;
    settings.grid.pos.y2 = yOffset + h*size;

    for (let y = 0; y < h; y++) {
        let line = []; 
        for (let x = 0; x < w; x++) {
            const tileX = x * size + xOffset;
            const tileY = y * size + yOffset;
            const col = x;
            const row = y;
            let tileObj = new Tile(tileX, tileY, col, row);
            line.push(tileObj);
        }
        settings.map.push(line);
    }
}



const isMapTile = (tileX, tileY) => {
    if (tileY >= 0 && tileY < settings.map.length && 
        tileX >= 0 && tileX < settings.map[0].length) { 
        return true;
    } else {
        return false
    }
}


const setSelectedTile = () => {
    settings.selectedTile = settings.hoveredTile;
  
    const size = settings.grid.size;
    const tile =  settings.selectedTile;
    const ids = []; //buildings

    for (const building of settings.buildings.built) {
        if (building.x >= tile.x && building.x <= tile.x+size && building.y >= tile.y && building.y <= tile.y+size) {
            ids.push(building.id); //building is inside tile
        }
    }
    settings.tileBuildingIds = ids;
    setSelectedMenuContent();
}

const setHoveredTile = () => {
    let x = settings.mouse.x;
    let y = settings.mouse.y;
    
    const size = settings.grid.size;
    const xOf = settings.grid.offset.x;
    const yOf = settings.grid.offset.y;

    let tileX, tileY;

    tileX = Math.floor( (x-xOf) / size)  //+ settings.grid.offset.x;
    tileY = Math.floor( (y-yOf) / size)  //+ settings.grid.offset.y;

    if (isMapTile(tileX, tileY)) {
        settings.hoveredTile = settings.map[tileY][tileX];

        if (settings.hoveredTile !== -1) {
         
        }
    } else {
        settings.hoveredTile = -1;
    }
}



const createSelectRing = (x, y) => {
    //const tile = settings.selectedTile;
    const ring = new SelectRing(x, y);
    settings.selectRing.rings.push(ring)
    if (settings.selectRing.rings.length > 1) { settings.selectRing.rings.shift(); }
}

const clearSelectRings = () => {
    settings.selectRing.rings.shift();
}

const createMouseBlip = () => {
    let x = settings.mouse.x;
    let y = settings.mouse.y;

    if (settings.hoveredTile.hasWorld) {
        //if tile has a world, make blip over the world/planet image
        x = settings.worlds[settings.hoveredTile.worldIndex].tilePos.x + settings.hoveredTile.x;
        y = settings.worlds[settings.hoveredTile.worldIndex].tilePos.y + settings.hoveredTile.y
    }
    //dont make mouse blip if placing down buildings
    if (mouseIsInsideGrid() && settings.buildMode) {
        return false
    }
    createBlip(x, y, "mouse");
}



//flash a flip on each world at the beginning of game
const createIntroWarningBlips = () => {
    for (let i = 0; i < settings.worlds.length; i++) {
        const world = settings.worlds[i];
        setTimeout( () => {
            let x = world.tile.x + world.tilePos.x;
            let y = world.tile.y + world.tilePos.y; 
            createBlip(x, y, "buildingReady");
            world.visible = true;
        }, 0 + 700*i); 
    }
}

const numberWithCommas = num => { //https://stackoverflow.com/a/2901298
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

const createPop = () => { 
    const min = 500000, max = 600000000;
    let num = ranNum(min, max);
    let rounder = 100000;
    if (num > 10000000) { rounder *= 10;}
    num = Math.round(num/rounder)*rounder;
    num = numberWithCommas(num);
    //log(num)
    return num;
}



//if tile has a world in any direction next to them (including itself), return true
const tileHasNearbyWorld = (tile, radius) => {
    const map = settings.map;
    for (let y = tile.row-radius; y <= tile.row+radius; y++) {
        for (let x = tile.col-radius; x <= tile.col+radius; x++) {
            if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
                if (map[y][x].hasWorld) {
                    return true
                }
            }
        }
    }
    return false;
}

const createWorlds = () => {
    for (let i = 0; i < settings.world.amount; i++) {
        const xMax = settings.map[0].length-2, yMax = settings.map.length-2;
        let x = ranNum(1,xMax);
        let y = ranNum(1,yMax);

        //center the world, player base/fortress
        x = Math.floor( settings.map[0].length /2 ) - 1;
        y = Math.floor( settings.map.length /2 ) - 1;

        let counter = 0;
        while ( tileHasNearbyWorld(settings.map[y][x], settings.world.minDistance) ) {
            x = ranNum(1,xMax);
            y = ranNum(1,yMax);
            counter++;
            if (counter > 2000) {
                //if the map is too small to find place for all worlds, stop loop
                log('Error in createWorlds() loop, too many retrys')
                return false;
            }
        }
        
        const world = new World(settings.map[y][x]);
        settings.worlds.push(world);
        settings.map[y][x].hasWorld = true;
        settings.map[y][x].worldIndex = settings.worlds.length - 1;
    }
}

const setSidebar = () => {
    const elem = document.getElementById('sidebar');
    elem.style.visibility = 'visible';
    let x, y, h;

    //put sidebar on right side of map grid
    x = settings.grid.offset.x + settings.grid.size * settings.w;
    //x = x + settings.grid.size;
    x = x + 10;

    y = window.innerHeight/2 - settings.grid.size * settings.h/2;
    y = y - settings.grid.size;
    
    h = settings.grid.size*settings.h + settings.grid.size;

    elem.style.left = x +"px";
    elem.style.top = y +"px";
    elem.style.height = h +"px";
}



const openSidebarMenu = i => {
    buildModeOff(); //set build mode off when changing tabs
    const contentElems = document.querySelectorAll('div.menu-content');
    const buttonElems = document.querySelectorAll('#menu-buttons > div.button');

    for (const elem of contentElems) { elem.classList.remove('selected'); }
    for (const elem of buttonElems ) { elem.classList.remove('selected'); }

    const menuElem = contentElems[i];
    const buttonElem = buttonElems[i];

    menuElem.classList.add('selected')
    buttonElem.classList.add('selected')

    //set buildmode always on when in the build menu tab
    if (menuElem.id === 'build') {
        buildModeOn();
    }
}


//display info of the selected build menu building
const selectBuildingMenuItem = i => {
    const items = document.querySelectorAll('#building-list > div.item');


    for (const item of items) {
        item.classList.remove('selected')
    }

    const selectedItem = items[i];
    selectedItem.classList.add('selected')

    const title = document.querySelector('#build.menu-content > #building-info > .title');
    title.innerHTML = toTitleCase(settings.buildings.towers[i].name);

    const image = document.querySelector('#build.menu-content > #building-info > div.image');
    image.style.backgroundImage = `url(${settings.buildings.towers[i].imageFile})`;



    const weaponName = settings.buildings.towers[i].weapon;
    const weaponObj = settings.weapons.types[weaponName];
    const weapon = document.querySelector('#build.menu-content > #building-info > .stats > .weapon');
    const weaponNameElem = weapon.querySelector('.name');
    weaponNameElem.innerHTML = weaponName;
    weapon.append(weaponNameElem);



    const range = document.querySelector('#build.menu-content > #building-info > .stats > .range > span.stat');
    //const rangeStat = range.querySelector('span.stat');
    //range.innerHTML = `Range: ${weaponObj.range} units`;
    range.innerHTML = `${weaponObj.range} units`;

    

    const damage = document.querySelector('#build.menu-content > #building-info > .stats > .damage > span.stat');
    damage.innerHTML = `${weaponObj.damage}`;

    const fireRate = document.querySelector('#build.menu-content > #building-info > .stats > .fire-rate > span.stat');
    fireRate.innerHTML = `${(1/weaponObj.fireSpeed).toFixed(1)}/s`;

    const buildTime = document.querySelector('#build.menu-content > #building-info > .stats > .build-time > span.stat');
    buildTime.innerHTML = `${settings.buildings.towers[i].buildTime}s`;


    const desc = document.querySelector('#build.menu-content > #building-info > div.desc');
    desc.innerHTML = settings.buildings.towers[i].desc;

    settings.buildings.selectedIndex = i;
}


const createSidebarMenuButtons = () => {
    const buttons = [
        settings.sidebar.menuButtons.selected,
        settings.sidebar.menuButtons.build,
        settings.sidebar.menuButtons.overview
    ];

    const target = document.getElementById('menu-buttons');

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];

        const elem = document.createElement('div');
        elem.classList.add('button');
        elem.id = button.id;
        elem.setAttribute('data-index', i);

        const iconElem = button.icon;
        elem.innerHTML = iconElem;
        target.append(elem);

        elem.addEventListener("mousedown", (e) => {
            const index = elem.getAttribute('data-index');
            openSidebarMenu(index);
        });
    }
}



//create list of buildings to select and build
const createBuildMenuButtons = () => {
    const targetElem = document.getElementById('building-list');

    for (let i = 0; i < settings.buildings.towers.length; i++) {
        const building = settings.buildings.towers[i];

        const item = document.createElement('div');
        item.classList.add('item');
        item.setAttribute('data-index', i);

        const imgElem = document.createElement('img');
        imgElem.classList.add('image');
        imgElem.setAttribute('src', building.imageFile);
        

        const title = document.createElement('div');
        title.classList.add('title');
        title.innerHTML = toTitleCase(building.name);

        const cost = document.createElement('div');
        cost.classList.add('cost');
        cost.innerHTML = building.cost;


        item.append(imgElem);
        item.append(title);
        item.append(cost);

        targetElem.append(item);
        item.addEventListener("mousedown", (e) => {
            const index = item.getAttribute('data-index');
            selectBuildingMenuItem(index);
        });
    }
}



const toggleBuildMode = () => {
    settings.buildMode = !settings.buildMode;
    setBuildMode()
}

const buildModeOff = () => {
    settings.buildMode = false;
    setBuildMode();
}

const buildModeOn = () => {
    settings.buildMode = true;
    setBuildMode();
}


const setBuildMode = () => {
    //const buildButtonIcon = document.querySelector('div#build.menu-content > #build-button > i.icon');
    //const spinAnimationClass = 'spin-animation';
    if (settings.buildMode) {
        //changeCursor(settings.cursor.test);
        
    } else {
        //changeCursor('none');
        changeCursor(settings.cursor.normal);
      
    
    }
}


//show info for the selected item
const setSelectedMenuInfo = id => {
    const allIcons = document.querySelectorAll('#tile-buildings > div.item');
   

    for (const icon of allIcons) {
        icon.classList.remove('selected');
    }

    let buildingIconElem; //the icon in the tileBuildings area
    let building = -1; //the building object in the settings.buildings.built array


    for (let i = 0; i < settings.buildings.built.length; i++) {
        let currentBuilding = settings.buildings.built[i];
        if (currentBuilding.id == id) {
            building = currentBuilding;
            settings.selectedBuilding = building;
            buildingIconElem = document.querySelector(`#tile-buildings > div.item[data-id="${id}"]`);
            //log(building)
            createSelectRing(building.x, building.y);
            createBlip(building.x, building.y, "warning")
        }
    }

    buildingIconElem.classList.add('selected');

    building.setUpgradeCost();

    const title = document.querySelector('#selected.menu-content > .info > .title');
    title.innerHTML = toTitleCase(building.name);

    const flavorName = document.querySelector('#selected.menu-content > .info > .flavor-name');
    flavorName.innerHTML = building.flavorName;

    const image = document.querySelector('#selected.menu-content > .info > div.image');
    //image.setAttribute('src',  settings.buildings.towers[i].imageFile)
    image.style.backgroundImage = `url(${building.imageFile})`;

    const desc = document.querySelector('#selected.menu-content > .info > div.desc');
    //desc.innerHTML = building.desc;

 

    //stats stuff
    const level = document.querySelector('#selected.menu-content > .info > .stats > .level > span.stat');
    level.innerHTML = `${building.level}`;


    const bigLevel = document.querySelector('#selected.menu-content > .info > div.image > div.level');
    bigLevel.innerHTML = `${building.level}`;

    const weaponName = building.weapon.type;
    const weaponData = building.weapon;

    const wepName = document.querySelector('#selected.menu-content > .info > .stats > .weapon > span.name');
    wepName.innerHTML = `${weaponName}`;

    const range = document.querySelector('#selected.menu-content > .info > .stats > .range > span.stat');
    range.innerHTML = `${weaponData.range.toFixed(1)} units`;

    const damage = document.querySelector('#selected.menu-content > .info > .stats > .damage > span.stat');
    damage.innerHTML = `${weaponData.damage.toFixed(1)}`;


    const fireRate = document.querySelector('#selected.menu-content > .info > .stats > .fire-rate > span.stat');
    fireRate.innerHTML = `${(weaponData.fireSpeed).toFixed(1)}/s`;

    
    const blastRadius = document.querySelector('#selected.menu-content > .info > .stats > .blast-radius');
    const blastRadiusStat = blastRadius.querySelector('span.stat');

    if (weaponData.hasOwnProperty('explosionRadius')) {
        blastRadius.style.visibility = 'visible';
        blastRadiusStat.innerHTML = weaponData.explosionRadius.toFixed(1);
    } else {
        blastRadius.style.visibility = 'hidden';
        //blastRadiusStat.innerHTML = weaponData.explosionRadius;
    }

    const blastDamage = document.querySelector('#selected.menu-content > .info > .stats > .blast-damage');
    const blastDamageStat = blastDamage.querySelector('span.stat');

    if (weaponData.hasOwnProperty('explosionDamage')) {
        blastDamage.style.visibility = 'visible';
        blastDamageStat.innerHTML = weaponData.explosionDamage.toFixed(1);
    } else {
        blastDamage.style.visibility = 'hidden';
        //blastRadiusStat.innerHTML = weaponData.explosionRadius;
    }
   


    let props = Object.getOwnPropertyNames(building);
    //log(props)

    
    //const unitListElem = document.querySelectorAll('#tile-buildings > .item');
    //set info and tile buildings visible
    const info = document.querySelector('#selected.menu-content > .info');
    const list = document.querySelector('#tile-buildings');
    const upgrade = document.querySelector('#upgrade');
    info.style.opacity = 1;
    list.style.opacity = 1;
    upgrade.style.opacity = 1;

}



//set content for the "selected" sidebar menu tab
const setSelectedMenuContent = () => {
    const unitListElem = document.getElementById('tile-buildings');
    unitListElem.innerHTML = '';

    for (const id of settings.tileBuildingIds) {

        for (let i = 0; i < settings.buildings.built.length; i++) {
            const building = settings.buildings.built[i];
            if (building.id === id) {
                const item = document.createElement('div');
                item.classList.add('item');
                item.setAttribute('data-id', id);

                const level = document.createElement('div');
                level.classList.add('level');
                level.innerHTML = building.level;
                item.append(level);

                const image = document.createElement('div');
                image.classList.add('image');
                image.style.backgroundImage = `url(${building.imageFile})`;

                item.append(image);
                unitListElem.append(item);

                item.addEventListener("mousedown", (e) => {
                    const dataId = item.getAttribute('data-id');
                    setSelectedMenuInfo(dataId, e.currentTarget);
            
                });
            }
        }
    }

    //help element says "no building selected" etc
    const help = document.querySelector('#selected.menu-content > .help');
    //select and show info for the 1st item on default
    if (settings.tileBuildingIds.length > 0) {

        setSelectedMenuInfo(settings.tileBuildingIds[0]);

        //if only 1 item in tile, no need to show a list of tile-buildings
        if (settings.tileBuildingIds.length === 1) {
            const list = document.querySelector('#tile-buildings');
            list.style.opacity = 0;
        }
        help.style.display = 'none';
    } else { 
        //clear info elem if tile has nothing to select
        //clearSelectedMenuInfo();
        const info = document.querySelector('#selected.menu-content > .info');
        const upgrade = document.getElementById('upgrade');
        info.style.opacity = 0;
        upgrade.style.opacity = 0;
        clearSelectRings();
        help.style.display = 'block';
        settings.selectedBuilding = -1;

    }
}



const purgeOldObjects = () => {
    let now = Date.now();
 
    if (now > settings.purge.last + settings.purge.interval*1000) {
        settings.purge.last = Date.now();

        const arraysToPurge = [
            { 
                arr: settings.ships.enemy, name:'ships' 
            },{
                arr: settings.gatlingBullets, name:'gatlingBullets' 
            },{
                arr: settings.torpedos, name:'torpedos' 
            },{
                arr: settings.missiles, name:'missiles' 
            },{
                arr: settings.blip.blips, name:'blips' 
            },{
                arr: settings.buildings.buildAnimations, name:'buildAnimations' 
            },{
                arr: settings.aoeExplosions, name:'aoeExplosions' 
                
            }
        ]

        for (let i = 0; i < arraysToPurge.length; i++) {
            const arr = arraysToPurge[i].arr;
            const arrayName =  arraysToPurge[i].name;
            const oldLen = arr.length;

            for (let j = 0; j < arr.length; j++) {
                const item = arr[j];
                if (item.hasOwnProperty('dead') && item.dead ||
                    item.hasOwnProperty('done') && item.done) {
                    arraysToPurge[i].arr.splice(j, 1);
                    if (j > 0) { j--; }
                }
            }
            //log(`Purged ${arrayName}, from ${oldLen} to ${arr.length}`);
        }
    }   
}


//test enemy waves
const enemySpawner = () => {
    if (!settings.enemySpawner.enabled) { return false }
    if (settings.ships.enemy.length > settings.ships.maxEnemyShips) { return false }

    let now;
    now = Date.now();
 
    if (now > settings.enemySpawner.lastSpawn + settings.enemySpawner.interval*1000) {
        const delay = settings.enemySpawner.spawnDelay;
        const minDist = settings.enemySpawner.distance * settings.grid.size;
        const enemyAmount = settings.enemySpawner.enemiesPerWave;
      
        for (let i = 0; i < enemyAmount; i++) {
       
            setTimeout( () => {
                const world = settings.worlds[0];
                const grid = settings.grid.pos;
            
                let x = ranNum(grid.x1, grid.x2);
                let y = ranNum(grid.y1, grid.y2);

                while ( getDistance(world.x, world.y, x, y) < minDist) {
                    x = ranNum(grid.x1, grid.x2);
                    y = ranNum(grid.y1, grid.y2);
                }

                let shipType = 'cruiser';
                let weaponType = 'gatling';

                //chance to spawn different ship
                if (chance(1)) {
                    shipType = 'battleship';
                    weaponType = 'torpedo';
                }

                const ship = new Ship(x, y, true, shipType, weaponType);
                settings.ships.enemy.push(ship);
                createBlip(x, y, 'warning', ship);

            }, 0 + delay*i); 
        }

        settings.enemySpawner.lastSpawn = Date.now();
    }
}


//money stuff inside object
const money = {

    add: (amount) => {
        settings.money += amount;
        if (settings.money < 0 ) { settings.money = 0; }
        //return settings.money
        money.update();
    },

    get: () => {
        return settings.money;
    },

    setStartMoney: () => {
        money.add(settings.startMoney);
        money.update();
    },

    setMoneyElement: () => {
        const elem = document.getElementById('money');
        settings.moneyElement = elem;
    },

    update: () => {
        settings.moneyElement.innerHTML = settings.money.toFixed(0);
    },

    //add money (increase or decrease)
    //get current player money
    //set start money
}

const upgradeBuilding = () => {
    if (settings.selectedBuilding !== -1) {
        const building = settings.selectedBuilding;
        if (money.get() >= building.upgradeCost) {
            building.upgrade();
            money.add(-building.upgradeCost)
            setSelectedMenuContent();
        }
    }     
}

//all wave methods in obj
const wave = {

    get: () => {
        let wave = settings.wave.current + "";
        return wave;
    },

    setLabelPosition: () => {
        const x =  (settings.grid.pos.x2 + settings.grid.pos.x1)/2;
        const y =  settings.grid.pos.y1 - 70;
        settings.wave.label.x = x;
        settings.wave.label.y = y;
        //settings.wave.label.y = y + 100;
    },

    setMultipliers: wave => {
        //var hp = baseHP*(lvl**2);
        //var hp = baseHP * ( lvl-1 + (1.55**(lvl-1)) );
        const curWave = wave;

        const hp = ( 1.1**(curWave-1) ); 
        const enemyAmount = ( 1.1**(curWave-1) ); 
        const specialShipChance = ( 1.05**(curWave-1) ); 

        settings.wave.multiplier.hp = hp;
        settings.wave.multiplier.enemyAmount = enemyAmount;
        settings.wave.multiplier.specialShipChance = specialShipChance;
    },

    //start wave
    start: () => {
        settings.wave.current.number++;
        wave.setMultipliers(settings.wave.current.number);
        wave.setCurrentEnemyAmount();

        log(`Starting wave ${settings.wave.current.number} (${settings.wave.current.enemyAmount} ships).`);

        log(`Cruiser hp: ${wave.getShipHp('cruiser')}, battleship hp: ${wave.getShipHp('battleship')}`);

        
        

        settings.wave.current.enemiesKilled = 0;
        settings.wave.current.complete = false;
        wave.spawnEnemies();
    },

    setCurrentEnemyAmount: () => {
        const base =  settings.wave.baseValues.enemyAmount;
        const multi = settings.wave.multiplier.enemyAmount;
        settings.wave.current.enemyAmount = Math.round(base * multi);
        //log(`setCurrentEnemyAmount() | base : ${base}, multi ${multi}`)
    },
    enemyKilled: () => {
        settings.wave.current.enemiesKilled++;

        //check if wave is complete after every enemy kill
        if(wave.isComplete() && !settings.wave.current.complete) {
            settings.wave.current.complete = true;
            settings.wave.waveEnded = Date.now();
            //log("wave complete")
        }  
    },
    isComplete: () => {
        const amount = settings.wave.current.enemyAmount;
        const killed = settings.wave.current.enemiesKilled;
        return (killed >= amount);
    },

    process: () => {
        if (settings.wave.current.complete) {
            const timeBetween = settings.wave.timeBetweenWaves * 1000;
            const waveEnded = settings.wave.waveEnded;
            const now = Date.now();
            const elapsed = now - waveEnded;
            //log(`elapsed: ${elapsed}`)

            if (elapsed >= timeBetween ) {
                wave.start();
            } else {
                let time = timeBetween - (elapsed);
                settings.wave.timeToNext = time
                //log(settings.wave.timeToNext);
            }
        }

    },
    spawnEnemies: () => {

        const now = Date.now();
        const delay = settings.wave.spawnDelay;
        const minDist = settings.wave.minDistance * settings.grid.size;
        const enemyAmount = settings.wave.current.enemyAmount;
        const specialShipChance = settings.wave.baseValues.specialShipChance * settings.wave.multiplier.specialShipChance;


        for (let i = 0; i < enemyAmount; i++) {
       
        
            setTimeout( () => {
                const world = settings.worlds[0];
                const grid = settings.grid.pos;
            
                let x = ranNum(grid.x1, grid.x2);
                let y = ranNum(grid.y1, grid.y2);

                while ( getDistance(world.x, world.y, x, y) < minDist) {
                    x = ranNum(grid.x1, grid.x2);
                    y = ranNum(grid.y1, grid.y2);
                }

                let shipType = 'cruiser';
                let weaponType = 'gatling';

                //chance to spawn different ship
                if (chance(specialShipChance)) {
                    shipType = 'battleship';
                    weaponType = 'torpedo';
                }

                const ship = new Ship(x, y, true, shipType, weaponType);
                settings.ships.enemy.push(ship);
                createBlip(x, y, 'warning', ship);

            }, 0 + delay*i); 
        }
    },

    getShipHp: (shipType) => {
        let baseHp = settings.ships.types[shipType].hp;
        let multi = settings.wave.multiplier.hp;
        const hp = Math.round(baseHp * multi);
        return hp;
    },

  


    //test wave scaling
    test: () => {
        let waves = 20;
        for (let i = 1; i <= waves; i++) {
            wave.setMultipliers(i);
            let str;

            //str = `hp multiplier (wave ${i}): ${settings.wave.multiplier.hp}`

            //str = `enemyAmount multiplier (wave ${i}): ${settings.wave.multiplier.enemyAmount}`

            str = `specialShipChance multiplier (wave ${i}): ${settings.wave.multiplier.specialShipChance}`

            //log(str);
        }
    }
}
