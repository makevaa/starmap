//mouse.js

const setMouseListeners = () => {

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    //const tSize = settings.bg.tileSize;
    //console.log(ctx)
    canvas.addEventListener('mousemove', function(e) {
        //log(e);
        //where mouse is on the canvas
        let x = e.layerX | 0; 
        let y = e.layerY | 0;

        x = e.layerX // + settings.grid.offset.x
        y = e.layerY // + settings.grid.offset.y

        //x = x / tSize;
        //y = y / tSize;

        //x += settings.grid.offset.x;
        //y += settings.grid.offset.y;

        settings.mouse.x = x;
        settings.mouse.y = y;
        //debug.setMouseCoords(x,y);
        //debug.setMouseCoords(settings.mouse.x, settings.mouse.y);
    });

    canvas.addEventListener('mousedown', e => {
        
        //try to place building on map if in build mode
        if (settings.buildMode) {
            placeBuilding();
        } else {
            setSelectedTile();
        }

        createMouseBlip();
        //drawTileTooltip(); 
    });

    canvas.addEventListener('mouseup', e => {
        //drawTileTooltip(settings.mouse.x,settings.mouse.y);
    });

    document.getElementById('start').addEventListener('mousedown', e => {
        init();
    });
    
}



setMouseListeners();