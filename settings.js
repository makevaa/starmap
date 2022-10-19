let bgUrl; //the whole bg star map image with stars, mist etc.

//clicker-raider monster hp skaalaus:
//var lvl = game.curLevel;
//var hp = baseHP*(lvl**2);
//var hp = baseHP * ( lvl-1 + (1.55**(lvl-1)) );
	

let settings = {
    w: 30, //tiles
    h: 20, //tiles
    showStartMenu:false,
    godMode:false, //world cant die 
    fullScreen:true, //draw whole viewport, overwrites mapW and mapH
    tileSize: 1, //px, this is for the background star image, not for game grid

    bgTimer:1,
    mouse: {x:-1, y:-1},
    axisTileHighlight:false, //tile highlight on the whole axis on mouse hover
    axisLineHighlight:true, 
    buildMode:false,
    paused:false,

    startMoney:10000, //1000
    money:0,
    moneyElement:-1, //dom element
  
    enemySpawner: {
        enabled: false,
        interval: 5, //sec, time between waves
        enemiesPerWave: 20,
        lastSpawn: Date.now(),
        spawnDelay: 200, //enemies spawn 1 by 1 with timer
        distance: 10, //spawn enemy at least this far
    },
    //enemy hp scales
    //enemy amount scales
    //enemy battleship chance scales
    wave: {
        current: {
            number:0,
            enemyAmount:1,
            enemiesKilled:-1, //to keep track of when wave is complete
            complete:true,

        },
        baseValues: {
            specialShipChance:1, //percent, base chance
            enemyAmount:20,
        },
        //the current multipliers, these are increased
        multiplier: {
            hp:1,
            enemyAmount:1,
            specialShipChance:1
        },
        timeBetweenWaves: 7, //sec
        timeToNext:-1, //to display countdown
        waveEnded: Date.now(), //to display countdown
        spawnDelay:100, //ms, enemies spawn 1 by 1 with delay
        minDistance: 10, //tiles, enemis spaw nat least this far
        lostOnWave:-1,

        label: { //the wave text in-game
            x:-1, y:-1
        }
    },

    purge: { //remove dead objects periodically
        interval: 1, //sec
        last: Date.now()
    },
    
    viewport: {w:-1, h:-1},
    canvas: {w:-1, h:-1},

    selectedTile: -1, //tile obj
    hoveredTile: -1, //tile obj
    tileBuildingIds:[], //ids of buildings which are on the current selectedTile
    selectedBuilding:-1, //Building object, -1 when none selected
    
    map:[],
    worlds:[],
    //ships:[],
    gatlingBullets:[],
    missiles:[],
    torpedos:[],
    aoeExplosions:[],


    world: { //the playable worlds on map
        amount: 1, //
        minDistance:5, //tiles, min distance between worlds
        rad: 2,
        lineW:2,
        color:{r:'204', g:'204', b:'204'},
        opa:1,
        maxHp:1000,
        regen: {
            interval: 500, //ms, heal tick
            last: Date.now(),
            amount:5,
        },
       
        nameColors: [
            'rgba(49, 171, 29, 0.99)', //'rgba(0, 200, 200, 0.8)',
            //'rgba(173, 131, 90, 0.8)',
            //'rgba(200, 100, 250, 1.99)',
            //'rgba(6, 188, 249, 0.8)',
        ],
        deadNameColor:'#800000', //213a45
    },

    selectRing: {
        rings:[],
        lineW:3,
        color:{r:'255',g:'0',b:'0'},
        opa:0.3,
        img:-1,
    },

    
  




    //the generic blips, data for different blips
    blip: {
        blips:[],
        maxBlips:2000,
        mouse: { //the mouse click blip
            maxFrames: 50,
            frameDur: 20, //ms
            lineW: 3,
            radInc: 2,
            opa: 1,
            opaInc: 0.05,
            color:{r:'12', g:'141', b:'92'},  
        },
        warning: { //the red warning blip
            maxFrames: 50,
            frameDur: 20, //ms
            lineW: 2,
            radInc: 0.5,
            opa: 1,
            opaInc: 0.02,
            color:{r:'255', g:'0', b:'0'},  
        },
        buildingPlaced: { //whn placing down building
            maxFrames: 50,
            frameDur: 20, //ms
            lineW: 1,
            radInc: 1,
            opa: 1,
            opaInc: 0.02,
            color:{r:'0', g:'255', b:'255'},  
        },
        buildingReady: { //when building is ready ☠
            maxFrames: 50,
            frameDur: 20, //ms
            lineW: 5,
            radInc: 1,
            opa: 1,
            opaInc: 0.02,
            color:{r:'0', g:'255', b:'0'},  
        },
        worldExplosion: { 
            maxFrames: 400,
            frameDur: 20, //ms
            lineW: 5,
            radInc: 1.2,
            opa: 1.5,
            opaInc: 0.02,
            color:{r:'255', g:'255', b:'255'},  
        },
        shipExplosion: { 
            maxFrames: 50,
            frameDur: 20, //ms
            lineW: 1,
            radInc: 0.5,
            opa: 0.8,
            opaInc: 0.02,
            color:{r:'255', g:'255', b:'0'},  
        },
        miniExplosion: { 
            maxFrames: 15,
            frameDur: 20, //ms
            lineW: 1,
            radInc: 0.5,
            opa: 0.7,
            opaInc: 0.05,
            color:{r:'255', g:'255', b:'255'},  
        },
        torpedoTrail: { 
            maxFrames: 20,
            frameDur: 20, //ms
            lineW: 1,
            radInc: 0.2,
            opa: 0.7,
            opaInc: 0.05,
            color:{r:'255', g:'255', b:'255'},  
        },
        missileTrail: { 
            maxFrames: 20,
            frameDur: 20, //ms
            lineW: 1,
            radInc: 0.2,
            opa: 0.7,
            opaInc: 0.05,
            color:{r:'0', g:'255', b:'255'},  
        },
    },

    grid: {
        color: 'rgba(0, 255, 255, 0.1)', //rgba(0, 255, 255, 0.35)
        lineWidth:1,
        size: 30,
        offset: {x:-1, y:-1}, //position of map on center of canvas, set in createMap() index.js
        pos : { //set in createMap() index.js
            x1:-1, y1:-1, x2:-1, y2:-1
        },
        //lines: {vert:-1, hor:-1},
        //margin: {x:200, y:100}, //px

        numbers: {  //draw number labels around grid
            x:true, y:true, 
            romanize: { x:false, y:true }, 
            color:{r:'0',g:'255',b:'255'},  
            opa:'0.3',
            highlightColor: 'rgba(0, 255, 255, 0.7)',
        },
    },

    highlight: { //tile highlight on mouse hover, rest of the styling is in draw.js: drawTileHighlight()
        borderColor:'aqua',
        borderOpacity:0.6,
        fillColor:'black',
        fillOpacity:0.2,
        border:'', //full rgba string, processed later
        fill:'', //full rgba string, processed later
    },


    bg: { //background space image
        w:1200, //not sure if used
        h:400,  //not sure if used
        tileSize:1,
        color: 'rgba(0, 0, 0, 1.0)', //map background color
        dotStar: {
            amount:2000,
            color:'slategrey'
        },
        circles: { //random circles
            amount:5,
            sizeMin:10, sizeMax:200,
            opacity:0.3,
            lineWidth:1,
            colors: ['lime', 'magenta'],
        },
        lines : {  //random lines
            color: 'darkslateblue',
            colors: ['midnightblue','mediumblue'],
            multiColor:false, 
            amount: 5,
            lenMin: 50, lenMax: 5000,
            opacity: 0.3,
            lineWidth: 2,
        },
        mist: { //background circles which should become a mist 
            colors: ['dodgerblue','firebrick','DarkSlateBlue'], //both named color and hex with a # work
            // MidnightBlue
            multiColor:true, 
            amount: 3000,
            radMin: 10, radMax: 150,
            opacity: 0.002,
        },
        layerCircles: { //random layered circles
            amount:2,
            layersMin:2,
            layersMax:4,
            radMin:30, radMax:150,
            opacity:0.2,
            lineWidth:1,
            colors :['red', 'orange', 'cyan'],
        },
        vignette: {
            draw:true,
            amount:150,
            radMin:10,
            radMax:150,
            color:'rgba(0, 0, 0, 0.05)',
            margin:0
        },
    },
    
    // fa-solid fa-screwdriver-wrench  fa-solid fa-house  icon fa-solid fa-gear  fa-solid fa-wrench
    sidebar: {
        menuButtons:{
            build: { //build menu to build new structures 
                icon:'<i class="fa-solid fa-wrench"></i>', 
                id:"build",
            },
            selected: { //show selected unit/building with stats, upgrade buttons etc.
                icon:'<i class="fa-solid fa-crosshairs"></i>',
                id:"selected",
            },
            overview: { //overview of your building/units etc.
                icon:'<i class="fa-solid fa-list"></i>',
                id:"overview",
            },
        },
    },

    cursor: {
        normal:'img/cursor/pointer2a.png',
        green:'img/cursor/cursor2.png',
        red:'img/cursor/cursor3.png',
        test:'img/cursor/pointer2c.png',
    },
    buildings: {
        selectedIndex:-1,
        idCounter:0,
        built:[],
        buildAnimations:[],

        towers: [
            {
                name:'Automatic weapons array',
                desc:'Weapon systems controlled by an artifical intelligence to defend against all enemy intruders.',
                imageFile: 'img/space_minigun.jpg', //space_minigun  space_weapons
                image:-1,
                buildTime: 0.5, //Seconds
                weapon:'gatling',
                shortName:'array', //used in flavor only
                color: { //color on map
                    fill: 'rgba(0, 255, 0, 0.6)',
                    border: 'black',
                },
                cost:50,
            },{
                name:'Defence outpost',
                desc:'Military garrison stronghold armed with impulse drive torpedo batteries.',
                imageFile: 'img/heavy_station.jpg', //outpost2 heavy_station
                image:-1,
                buildTime: 2,
                weapon:'torpedo',
                shortName:'outpost',
                color: {
                    fill: 'rgba(0, 255, 0, 0.6)',
                    border: 'black',
                },
                cost:100,
            },{
                name:'Star fortress',
                desc:'Defensive citadel equipped with nuclear warhead missile batteries (splash damage). ',
                imageFile: 'img/fortress.jpg', //
                image:-1,
                buildTime: 3, //3
                weapon:'missile',
                shortName:'fortress',
                color: {
                    fill: 'rgba(0, 255, 0, 0.6)',
                    border: 'black',
                },
                cost:200,
            },
        ]

        //wall: block a game tile, "Localised warp storm fields disrupt all navigational instruments in region, blocking all space travel."
    },

    ships: {
        enemy:[], //all enemy ships
        maxEnemyShips:500,
        types: {
            cruiser: {
                hp:10,
                armor:1,
                speed:50, //100 50
                color:'rgba(255, 0, 0, 0.8)',
                drop: {
                    money:5,
                }
            },
            battleship: {
                hp: 200,
                armor:1,
                speed:10,
                color:'rgba(255, 255, 0, 0.8)',
                drop: {
                    money:50,
                }
            }
        },
    },

    weapons: {
        types: {
            gatling: {
                range: 3,
                damage: 1,
                fireSpeed: 0.1, //times per second
                projectileMoveSpeed: 700,
                hitbox: 8, //px area around target, faster bullet needs larger hitbox
                upgrade: {
                    baseCost:50
                }

            },
            //torpedo flies straight with smoke trail
            //it should speed up as it goes
            torpedo: {
                range: 5,
                damage: 10,
                fireSpeed: 0.5, //0.6
                projectileMoveSpeed: 1000,
                hitbox: 8,
                timeToFullSpeed:800, //ms
                upgrade: {
                    baseCost:50
                }
            },
            //missile flies in an arc,
            missile: {
                range: 6,
                damage: 10, //damage to target 
                fireSpeed: 0.6,
                projectileMoveSpeed: 1000,
                hitbox: 10,
                timeToFullSpeed: 800, //ms
                explosionRadius:20, //px
                explosionDamage: 5, //lower splash damage
                upgrade: {
                    baseCost:50
                }

            }

        }
    },



    images: {
        path:"img/use/",
        world: { //planet images
            files: [], //filenames with extensions
            populateWorldFileList: () => {
                const planetImageAmount = 40;
                for (let i = 1; i <= planetImageAmount; i++) {
                    const file = `img/planet/planet (${i}).png`;
                    settings.images.world.files.push(file);
                    //log(file)
                }
            },
            imgs:[], //img objects
        },
        skull: { file:'cross_skull.png', img:-1}
    },
    
    text: {
        startMenu: {
            title: '+++ STARMAP +++',
            text: 'Defend your home world from attackers by building turrets.',
            startButton: 'START' //  <!--<img src="img/cross_skull.png">-->
        }
    }

}


// put images to dalle_planet folder and update amount below, comment or un-comment in init.js function init
const dallePlanets = () => {
    let dallePlanetAmount = 28;

    settings.images.path = 'img/dalle_planets/';
    settings.images.world.files = [];

    for (let i = 1; i < dallePlanetAmount+1; i++) {
        let file = `planet (${i}).png`;
        //let arr = 
        settings.images.world.files.push(file);
        //log(file)
    }
    log(settings.images.world.files);
}