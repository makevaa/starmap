

const showMenu = () => {
    const elem = document.getElementById('menu-container');
    elem.style.opacity = 1;
    elem.style.display = 'flex'; 
}

const hideMenu = () => {
    const elem = document.getElementById('menu-container');
    elem.style.opacity = 0;
    setTimeout(function() {
        elem.style.display = 'none';
    }, 500);
}

const setStartMenuText = () => {
    const title = document.getElementById('title');
    const text = document.getElementById('text');
    const start = document.getElementById('start');

    title.innerHTML = settings.text.startMenu.title;
    text.innerHTML = settings.text.startMenu.text;
    start.innerHTML = settings.text.startMenu.startButton;

}

const setWorldImg = file => {
    let img = new Image();
    img.src = file;
    settings.images.world.imgs.push(img);
    //log(img)
}

const setWorldImgs = () => {
    for (const file of settings.images.world.files) {
        setWorldImg(file);
    }
}

const setSkullImg = () => {
    let img = new Image();
    img.src = settings.images.path+settings.images.skull.file;
    settings.images.skull.img = img;
}



const setBuildingImgs = () => {
    for (const building of settings.buildings.towers) {
        let img = new Image();
        img.src = building.imageFile;
        building.image = img;
    }
}



const setImgs = () => {
    //setWorldImgs();
    setSkullImg();
    setBuildingImgs();
}




const initBg = () => {
    initCanvas();
    createBg();
    saveBg();
}

//misc click listeners
const setListeners = () => {


    const upgradeBuildingButton = document.getElementById('upgrade');
    upgradeBuildingButton.addEventListener("click", (e) => {
        upgradeBuilding();
    });



}






const init = () => {
    hideMenu();
    setTileHighlightColors();
    //dallePlanets(); //function in settings.js

    settings.images.world.populateWorldFileList();
    setImgs();

    createMap();
    createWorlds();
    //createShips();
    createIntroWarningBlips();
    //log(settings.map);

    setSidebar();
    createSidebarMenuButtons();
    createBuildMenuButtons()
    openSidebarMenu(1);
    selectBuildingMenuItem(0);
    //createEnemyShips();
    setKeyboardControlListeners(); //controls.js
    setListeners();
    //toggleBuildMode();
    money.setMoneyElement();
    money.setStartMoney();
    wave.setLabelPosition();



    //wave.start(); 
    
    //starting the first wave, from wave 0 to wave 1
    
    //wave.test();
    
     // Start the first frame request
    window.requestAnimationFrame(gameLoop);
}


const gameLoop = timestamp => {


    if (!settings.paused) { 
        
        processShips();
        //processBuildings();
        processBuildings2(); //random target test
        processGatlingBullets();
        processTorpedos();
        processMissiles();

        regen();
        clearTileHighlight();
        drawBgImage();
        drawGrid();
        setHoveredTile();


        drawSelectedTile();
        drawBlips(); //generic blips
        drawWorldNames()
        drawSelectRings();

        drawWorlds();
        drawBuildings();
        drawBuildAnimations();
        drawBuildingOnMouse(); //draw building preview on mouse when in build mode (range as circle etc)
        
        drawGatlingBullets();
        drawTorpedos();
        drawMissiles();
        drawShips(); 
        drawAoeExplosions();
    
        drawWorldPowers();
        drawWaveData();

   

        if (settings.buildMode)  {
            drawAxisLineHighlight2();   
        } else {
            drawTileHighlight();
            drawAxisLineHighlight();    
        }

        purgeOldObjects();
        enemySpawner();

        wave.process();

        
    }
    // Keep requesting new frames
    window.requestAnimationFrame(gameLoop);
}


if (settings.showStartMenu) {
    initBg();
    setStartMenuText();
    showMenu(); 
} else {
    initBg();

    preloadImages(imagesToPreload.list).then(function(imgs) {
        // all images are loaded now and in the array imgs
        log("all images loaded.")
        init();
    }, function(errImg) {
        // at least one image failed to load
        log("failed to preload image: " + errImg);
    });
    
    //init();
}