




const drawGrid = () => {
    const color = settings.grid.color;
    const lineWidth = settings.grid.lineWidth;
    const size = settings.grid.size;

    //const vertLines = settings.grid.lines.vert;
    //const horLines = settings.grid.lines.hor;
    const xOffset = settings.grid.offset.x;
    const yOffset = settings.grid.offset.y;

    //viewport: {w:-1, h:-1},
    /*let spaceW = (vertLines*size) + xOffset*2;
    if(spaceW >= settings.viewport.w) {
        //settings.grid.offset.x = 5;
        //xOffset = 5;
    }*/
    ctx.font = '100 15px Caslon';
    const r = settings.grid.numbers.color.r;
    const g = settings.grid.numbers.color.g;
    const b = settings.grid.numbers.color.b;
    const opa = settings.grid.numbers.opa;
    let textColor;


     //vertical grid lines and numbers
    for (let i = 0; i < settings.w+1; i++) {
        textColor = `rgba(${r}, ${g}, ${b}, ${opa})`;
        //line(ctx, sx, sy, tx, ty, color, lineWidth, globalAlpha = 1) 
        line(ctx, xOffset+i*size, yOffset, xOffset+i*size, settings.h*size+yOffset, color, lineWidth);

        if (settings.grid.numbers.x && i < settings.w) {
            if (i === settings.hoveredTile.col) { 
                textColor = settings.grid.numbers.highlightColor; 
            }
            ctx.fillStyle = textColor;
            let num = i;
            if (settings.grid.numbers.romanize.x) { num = romanize(i);  }
            ctx.fillText(num, (i+0.5)*size + xOffset, yOffset-size*0.7);
        }
    }

    //horizontal grid lines and numbers
    for (let i = 0; i < settings.h+1; i++) {
        textColor = `rgba(${r}, ${g}, ${b}, ${opa})`;


        line(ctx, xOffset, yOffset+i*size, settings.w*size+xOffset, yOffset+i*size, color, lineWidth);
       
        if (settings.grid.numbers.y  && i < settings.h) {
            ctx.textAlign = 'center'
            
            if (i === settings.hoveredTile.row) { 
                textColor = settings.grid.numbers.highlightColor; 
            }
            ctx.fillStyle = textColor;
            let num = i;
            if (settings.grid.numbers.romanize.y) { num = romanize(i); }
            ctx.fillText(num, xOffset-size*0.7, (i+0.5)*size + yOffset + 5);
        }
    }
}

const clearTileHighlight = () => {
    //ctxHighlight.clearRect(0, 0, canvasHighlight.width, canvasHighlight.height)
} 

const drawTileHighlight = () => {
    const tileW = settings.grid.size;
    const tileH = settings.grid.size;
    const tileX = settings.hoveredTile.x;
    const tileY = settings.hoveredTile.y;

    let borderColor = settings.highlight.border;
    let lineW = settings.grid.lineWidth


    ctx.lineWidth = lineW; 
    ctx.fillStyle =  settings.highlight.fill;
    ctx.strokeStyle = borderColor;
    ctx.fillRect(tileX, tileY, tileW, tileH);
    ctx.strokeRect(tileX, tileY, tileW, tileH);


    //tile highlight on the axises
    if (settings.axisTileHighlight && settings.hoveredTile !== -1) {
        ctx.lineWidth = 2; 
        ctx.fillStyle =  'rgba(255, 255, 255, 0.02)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        //x-axis (horizontal)
        for (let i = settings.hoveredTile.col; i >= 0; i--) {
            const size = settings.grid.size;
            const x = settings.map[settings.hoveredTile.row][i].x;
            const y = settings.map[settings.hoveredTile.row][i].y;
            ctx.fillRect(x, y, size, size);
            ctx.strokeRect(x, y, size, size);
        }

         //x-axis (vertical)
         for (let i = settings.hoveredTile.row; i >= 0; i--) {
            const size = settings.grid.size;
            const x = settings.map[i][settings.hoveredTile.col].x;
            const y = settings.map[i][settings.hoveredTile.col].y;
            ctx.fillRect(x, y, size, size);
            //ctx.strokeRect(x, y, size, size);
        }
    }

    
    
}

//old
const drawAxisLineHighlight = () => {
    //line highlight on the axises
    if (settings.axisLineHighlight && settings.hoveredTile !== -1) {
        //ctx.lineWidth = 2; 
        //ctx.fillStyle =  'rgba(255, 255, 255, 0.02)';
        //ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';

        let lineW = 2;
        let color = 'rgba(0, 255, 150, 0.2)';
        const size = settings.grid.size;

        const x1 = settings.grid.offset.x;
        const y1 = settings.grid.offset.y;
        const x2 = x1 + size * settings.w;
        const y2 = y1 + size * settings.h;

        const len = 10; //short line length
        /* line(ctx, startX, startY, endX, endY, color, lineWidth); */
        //line(ctx, x1, settings.mouse.y, x2, settings.mouse.y, color, lineW); //long line
        //line(ctx, settings.mouse.x, y1, settings.mouse.x, y2, color, lineW); //long line 

        line(ctx, x1+1, settings.mouse.y, x1+len, settings.mouse.y, color, lineW); //short line
        line(ctx, settings.mouse.x, y1+1, settings.mouse.x, y1+len, color, lineW);//short line
        line(ctx, x2-len, settings.mouse.y, x2-1, settings.mouse.y, color, lineW); //short line on other side
        line(ctx, settings.mouse.x, y2-len, settings.mouse.x, y2-1, color, lineW);//short line on other side
    }
}

// draw lines to buildmode circle, but not over it
const drawAxisLineHighlight2 = () => {
    if (settings.hoveredTile !== -1 && settings.buildMode) {
        let lineW = 2;
        let color = 'rgba(0, 255, 150, 0.2)';
        const size = settings.grid.size;

        const weaponType = settings.buildings.towers[settings.buildings.selectedIndex].weapon;
        const rad = settings.weapons.types[weaponType].range * size;

        const grid = settings.grid.pos;
        const mouse = settings.mouse;

        //make the game grid a clipping path. Add ctx.restore() after done drawing
        ctx.save();
        ctx.beginPath();
        ctx.rect(settings.grid.pos.x1, settings.grid.pos.y1, settings.w*settings.grid.size, settings.h*settings.grid.size);
        ctx.clip()

        //horizontal line 1
        line(ctx, grid.x1, mouse.y, mouse.x-rad, mouse.y, color, lineW);

        //horizontal line 2
        line(ctx, mouse.x+rad, mouse.y, grid.x2, mouse.y, color, lineW);

        //vertical line 1
        line(ctx, mouse.x, grid.y1, mouse.x, mouse.y-rad, color, lineW);

        //vertical line 2
        line(ctx, mouse.x, mouse.y+rad, mouse.x, grid.y2, color, lineW);

        //draw text/icons on buildmode mouse

         
        const weaponName = settings.buildings.towers[settings.buildings.selectedIndex].weapon.toUpperCase();
      

        let buildingName = settings.buildings.towers[settings.buildings.selectedIndex].name;

        buildingName = toTitleCase(buildingName);

        ctx.font = '100 20px Caslon'; //Caslon
        ctx.textAlign = 'right'
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        
    
          //horizontal line 2
          line(ctx, mouse.x+rad, mouse.y, grid.x2, mouse.y, color, lineW);
        
        ctx.fillText(weaponName, grid.x2-3, mouse.y-8);
        ctx.fillText(buildingName, grid.x2-3, mouse.y+22);
        ctx.fillStyle = 'rgba(0, 150, 0, 1)';
        ctx.fillText(weaponName, grid.x2-5, mouse.y-10);
        ctx.fillText(buildingName, grid.x2-5, mouse.y+20);

        ctx.restore();
    }
}

const drawBuildingInfo = (x, y) => {


}




const drawSelectedTile = () => {
    if (settings.selectedTile !== -1) {
        const size = settings.grid.size;
        const tileX = settings.selectedTile.x;
        const tileY = settings.selectedTile.y;
        //ctxHighlight ctx
        ctx.lineWidth = 2; 
        ctx.fillStyle =  'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        //ctx.fillRect(tileX, tileY, size, size);
        //ctx.strokeRect(tileX, tileY, size, size);
    } 
}

const drawSelectRing = ring => {
    let x = ring.x //+ settings.grid.size/2;
    let y = ring.y //+ settings.grid.size/2;

    if (settings.selectedTile.hasWorld) {
        x = ring.x + settings.worlds[settings.selectedTile.worldIndex].tilePos.x;
        y = ring.y + settings.worlds[settings.selectedTile.worldIndex].tilePos.y;
    }

    //let frames = ring.frames;
  
    const rad = ring.rad;
    const lineW = settings.selectRing.lineW;
    const r = settings.selectRing.color.r;
    const g = settings.selectRing.color.g;
    const b = settings.selectRing.color.b; 
    const opa = settings.selectRing.opa;
    let color = `rgba(${r}, ${g}, ${b}, ${opa})`;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineW;

    const prog = ring.getAnimProg();
    let radMod = ring.radMod * prog;
    //let radMod = -ring.radMod * prog;

    if (prog <= 0.5) {
        radMod =  -radMod + ring.radMod;

    }

    ctx.beginPath();
    ctx.arc(x, y, rad + radMod, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    function draw_rectangle(x, y, w, h, deg){
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(degreesToRadians(deg+90));
        ctx.fillRect(-1*(w/2), -1*(h/2), w, h);
        ctx.restore();
    }

    var bars = 4;
    let degInc = 100;

    for(var i = 0; i < bars; i++){
      var x2 = x + (radMod+rad)*Math.cos( degreesToRadians(i*90) );
      var y2 = y + (radMod+rad)*Math.sin( degreesToRadians(i*90) );
      //ctx.fillStyle = 'red';
      draw_rectangle(x2, y2, lineW, 10, i*90);
    }
     
}




const drawSelectRings = () => {
    let now, elapsed;

    for (const ring of settings.selectRing.rings) {
        drawSelectRing(ring);
        ring.setAnimProg();
        now = Date.now();
        elapsed = now - ring.lastFrame;

        if (elapsed > ring.frameDur) {
            ring.lastFrame = now - (elapsed % ring.frameDur);
            ring.frame++;
            if(ring.frame >= ring.maxFrames) {
                ring.frame = 0;
            }
        }

    }
}









//generic blip
const drawBlip = blip => {
    let x = blip.x
    let y = blip.y

    //log(blip)
    const rad = blip.rad; //flips starts from nothing
    const lineW = blip.lineW;
    const r = blip.color.r;
    const g = blip.color.g;
    const b = blip.color.b; 
    const opa = blip.opa;
    let color = `rgba(${r}, ${g}, ${b}, ${opa})`;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineW;

    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
}

//draw all generic blips
const drawBlips = () => {
    let now, elapsed;

    for (const blip of settings.blip.blips) {
        if (blip.done) { continue; }
        drawBlip(blip);
        now = Date.now();
        elapsed = now - blip.lastFrame;

        if (elapsed > blip.frameDur) {
            blip.lastFrame = now - (elapsed % blip.frameDur);
            blip.followTarget()
            blip.increaseRadius()
            blip.decreaseOpa()
            blip.frame++;
            if(blip.frame >= blip.maxFrames) {
                blip.setAsDone();
            }
        }
    }
}











//https://gist.github.com/jwir3/d797037d2e1bf78a9b04838d73436197
const drawArrowHead = (from, to) => {
	const x_center = to.x, y_center = to.y;
	let angle, x, y;
    let radius = 10;

	ctx.beginPath();

	angle = Math.atan2(to.y - from.y, to.x - from.x)
	x = radius * Math.cos(angle) + x_center ;
	y = radius * Math.sin(angle) + y_center;
	ctx.moveTo(x, y);

   

	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center ;
	ctx.lineTo(x, y);

	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius *Math.cos(angle) + x_center;
	y = radius *Math.sin(angle) + y_center;

	ctx.lineTo(x, y);
	ctx.closePath();
	ctx.fill();
}

const calcArrowCoords = (startX, startY, endX, endY) => {
    //calculate coordinates for a shorter arrow from the original start and end point
    const dir = Math.atan2(endY - startY, endX - startX);
    const deltaX = Math.cos(dir); 
    const deltaY = Math.sin(dir);
    const inc = 20;
    let coords = {
        start: {
            x: startX + inc*deltaX,
            y: startY + inc*deltaY
        },
        end: {
            x: endX - inc*deltaX,
            y: endY - inc*deltaY
        },
    }
    return coords;
}



/*
const drawOldShip = ship => {
    const shipNum = ship.num;
    const name = ship.name;
    const worldIndex = ship.worldIndex;
    const world = settings.worlds[worldIndex];
    const img = settings.images.skull.img;

    let imgW = img.width * 0.7;
    let imgH = img.height * 0.7;
    let imgX = world.tile.x + world.tilePos.x + 20;
    let imgY = world.tile.y + world.tilePos.y - 10; 

    //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.drawImage(img, 0, 0, img.width, img.height, imgX, imgY, imgW, imgH);

    ctx.font = 'bold 25px Caslon';
    const color = '#cc0066'; //'#dfba45'
    const shadowColor = 'black';
    ctx.textAlign = 'center'

    const label = romanize(shipNum); 
    const x = imgX;
    const y = imgY; 
    const s = 1;
   
    ctx.fillStyle = shadowColor;
    ctx.fillText(label,  x + 17 + s, y + 20 + s);
    ctx.fillStyle = color;
    ctx.fillText(label,  x + 17, y + 20);

    if (ship.moveArrow && settings.selectedTile.hasWorld && ship.worldIndex !== settings.selectedTile.worldIndex) {
        const startX = imgX + (imgW / 2); 
        const startY = imgY + (imgH / 2); 
        let endX = settings.selectedTile.x;
        endX += settings.worlds[settings.selectedTile.worldIndex].tilePos.x;
        let endY = settings.selectedTile.y;
        endY += settings.worlds[settings.selectedTile.worldIndex].tilePos.y;

        let result = calcArrowCoords(startX, startY, endX, endY);

        let r = 0, g = 255, b = 255;
        let color = `rgba(${r}, ${g}, ${b}, ${0.5})`;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        //ctx.moveTo(startX, startY);
        //ctx.lineTo(endX, endY)
        ctx.moveTo(result.start.x, result.start.y);
        ctx.lineTo(result.end.x, result.end.y)
        ctx.stroke();
        ctx.closePath();

        drawArrowHead(result.start, result.end) //from, to
    }
}
*/




const drawWorld = world => {
    //let x = world.tile.x + settings.grid.size/2; // centered
    //let y = world.tile.y + settings.grid.size/2; // centered

    let x = world.tile.x + world.tilePos.x;
    let y = world.tile.y + world.tilePos.y; 

    const rad = settings.world.rad * 1;
    const lineW = settings.world.lineW;
    const r = settings.world.color.r;
    const g = settings.world.color.g;
    const b = settings.world.color.b; 
    const opa = settings.world.opa;
    let color = `rgba(${r}, ${g}, ${b}, ${opa})`;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineW;

    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    //ctx.stroke();
    ctx.fill();
    ctx.closePath();

    const r2 = 0;
    const g2 = 0;
    const b2 = 0; 
    const opa2 = 0.5;
    const radFlat = 5;
    let ellipseColor = `rgba(${r2}, ${g2}, ${b2}, ${opa2})`;
    let ellipseColorBack = `rgba(${r2}, ${g2}, ${b2}, ${opa2*0.2})`;
    //ellipseColor = 'red';
    //ellipseColorBack = 'blue'
    
    /*
    //draw ellipses on circle to make it look like a 3d globe
    //ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle [, counterclockwise]);
    
    ctx.strokeStyle = ellipseColorBack;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad/radFlat, 0, Math.PI, 0);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = ellipseColor;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad/radFlat, Math.PI/2, Math.PI, 0);
    //ctx.ellipse(x, y, rad, rad/3, 0, Math.PI, 0, true);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = ellipseColor;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad/radFlat, 0, Math.PI, 0, true);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = ellipseColorBack;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad/radFlat, Math.PI/2, Math.PI, 0, true);
    ctx.stroke();
    ctx.closePath(); 
    */
}



const drawWorlds = () => {
    for (const world of settings.worlds) {
        if (world.visible) {
            drawWorld(world)
        }
    }
}

//bars not used at the moment
const drawWorldBars = () => {
    for (const world of settings.worlds) {
        if (!world.visible) { continue}
        let x = world.tile.x + world.tilePos.x;
        let y = world.tile.y + world.tilePos.y; 
        const maxBars = world.maxBars;

        ctx.strokeStyle = 'grey';
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1;

        for (let i = 0; i < maxBars; i++) {
            let w = 5;
            let h = 10;
            let margin = 5;
            let barAreaLen = w*maxBars + margin*(maxBars-1)  //length of all bars and margins
            let barX = x - (  (barAreaLen/2) ) + (i*(w+margin))
            let barY = y + 15;       
            ctx.strokeRect(barX, barY, w, h);
            ctx.fillRect(barX, barY, w, h);
        }
    }
}

const drawWorldNames = () => {
    ctx.font = '100 25px Caslon';
    //const txtColor = 'rgba(0, 200, 200, 0.99)';
    const shadowColor = 'black';
    ctx.textAlign = 'center'

    for (const world of settings.worlds) {
        if (!world.visible) { continue}
        const name = world.name; 
        const x = world.tile.x + world.tilePos.x;
        const y = world.tile.y + world.tilePos.y; 

        let yOffset = 30;

        ctx.fillStyle = shadowColor;
        ctx.fillText(name,  x+2, y+2 - settings.world.rad*2 - yOffset);
        ctx.fillStyle = world.nameColor;
        ctx.fillText(name,  x, y - settings.world.rad*2 - yOffset);
    }
}

//the number next to World (hp)
const drawWorldPowers = () => {
    ctx.font = '100 20px consolas'; //Caslon
    //const txtColor = 'rgba(0, 200, 200, 0.99)';
    const shadowColor = 'black';
    let color = '#0080ff'; //#0066ff
    color = 'rgba(0, 150, 150, 0.99)';
    ctx.textAlign = 'center'

    for (const world of settings.worlds) {
        if (!world.visible) { continue}
        let power = world.hp; 
        power = power.toFixed(0);

        const x = world.tile.x + world.tilePos.x;
        const y = world.tile.y + world.tilePos.y; 

        let xOffset = 0;
        let yOffset = -10;

        if (world.dead) {
            power = '☠';
            color = 'red';
        }

        ctx.fillStyle = shadowColor;
        ctx.fillText(power,  x+2 + xOffset, y+2 + yOffset);
        //ctx.fillStyle = world.nameColor;
        ctx.fillStyle = color;
        ctx.fillText(power,  x + xOffset, y + yOffset);
    }
}

const drawSkull = (num, i) => {
    const img = settings.images.skull.img;
    let imgW = img.width *0.7 ;
    let imgH = img.height *0.7 ;
    let imgX = 20 + (i*40) 
    let imgY = 20
    //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.drawImage(img, 0, 0, img.width, img.height, imgX, imgY, imgW, imgH);

    ctx.font = 'bold 25px Caslon';
    const color = '#cc0066'; //'#dfba45'
    const shadowColor = 'black';
    ctx.textAlign = 'center'

    const name = num; 
    const x = imgX;
    const y = imgY; 
    const s = 1;
   

    ctx.fillStyle = shadowColor;
    ctx.fillText(name,  x + 17 + s, y + 20 + s);
    ctx.fillStyle = color;
    ctx.fillText(name,  x + 17, y + 20);
}

const drawSkulls = (num, i) => {
    const nums = ['I', 'II', 'III']
    for (let i = 0; i < nums.length; i++) {
        drawSkull(nums[i], i)
    }
}



const drawBuildingOnMouse = () => {
    if (!settings.buildMode) { return false }

    let weaponType = settings.buildings.towers[settings.buildings.selectedIndex].weapon;

    let rad = settings.weapons.types[weaponType].range * settings.grid.size;
    

    let x = settings.mouse.x;
    let y = settings.mouse.y;
    let lineW = 2;
    let color = 'lime';
    let opa = 0.3;
    color = colorNameToHex(color);
    color = hexToRgbaStr(color, opa);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;

    //Draw range circle, don't draw outside grid
    //make the game grid a clipping path. Add ctx.restore() after done drawing
    ctx.save();
    ctx.beginPath();
    ctx.rect(settings.grid.pos.x1, settings.grid.pos.y1, settings.w*settings.grid.size, settings.h*settings.grid.size);
    ctx.clip()

    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill() 
    ctx.stroke();

    //draw dot on mouse
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill() 

    ctx.restore();
}




const drawBuildingRange = (building, color='rgba(255,255,255,0.1)') => {
    const rad = building.weapon.range * settings.grid.size;

    const x = building.x;
    const y = building.y;
    const lineW = 1;
    //let color = 'lime';
    //const opa = 0.3;
    //color = colorNameToHex(color);
    //color = hexToRgbaStr(color, opa);
    //color = 'rgba(255,255,255,0.1)';

    //ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;

    //Draw range circle, don't draw outside grid
    //make the game grid a clipping path. Add ctx.restore() after done drawing
    ctx.save();
    ctx.beginPath();
    ctx.rect(settings.grid.pos.x1, settings.grid.pos.y1, settings.w*settings.grid.size, settings.h*settings.grid.size);
    ctx.clip()

    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.closePath();
    //ctx.fill() 
    ctx.stroke();

    ctx.restore();
}





const drawBuilding = building => {
    //Draw range circle
    if (settings.buildMode) { drawBuildingRange(building); }
    //drawBuildingRange(building);
    let fillColor = building.color.fill;
    let borderColor = building.color.border;
   
    //draw rectangle
    const w = 5;
    const h = 5;
    const x = building.x - w/2;
    const y = building.y - h/2;
    //let color = 'rgba(0, 255, 0, 0.6)';
    //ctx.lineWidth = 1;
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.fillRect(x, y, w, h);
    //ctx.strokeRect(x, y, w, h);

    /* //draw dot 
    ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
    ctx.beginPath();
    //ctx.arc(building.x, building.y, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill() 
    //ctx.stroke(); */  
}


const drawBuildings = () => {
    for (const building of settings.buildings.built) {
      drawBuilding(building);
    }

    if (settings.selectedBuilding !== -1) {
        drawBuildingRange(settings.selectedBuilding, 'rgba(0,255,0,0.5)'); 
    }
}



const drawBuildAnimation = anim => {
        //draw dot on building pos
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(anim.x, anim.y, 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill() 


        //the decreasing timer number
        const now = Date.now();
        const elapsed = now - anim.buildStartTime;
        const timeLimit = anim.buildingData.buildTime * 1000; //ms

     
        let prog = elapsed / timeLimit; //anim progress, 0-1
        prog = 5**prog - 1
        if (prog > 1) { prog = 1; }
        //log(prog)

        //draw fading filled range circle
        //clip area to not draw outside grid, restore after
        ctx.save();
        ctx.beginPath();
        ctx.rect(settings.grid.pos.x1, settings.grid.pos.y1, settings.w*settings.grid.size, settings.h*settings.grid.size);
        ctx.clip()

        ctx.beginPath();
        const rad = anim.weapon.range*settings.grid.size;
        ctx.fillStyle = `rgba(0, 255, 0, ${(1-prog)*0.3})`;
        ctx.arc(anim.x, anim.y, rad, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill() 
        //stroke for a fade-in border effect
        ctx.strokeStyle = `rgba(0, 255, 0, ${(prog)*0.1})`;
        ctx.stroke() 
        ctx.restore();
 
        //Draw countdown number
        let num = timeLimit - elapsed;
        num = num / 1000;
        num = num.toFixed(1)

        const x = anim.x + 0;
        const y = anim.y - 20; 

        ctx.font = 'normal 15px monospace'; //Caslon
        //const txtColor = 'rgba(0, 200, 200, 0.99)';
        const shadowColor = 'black';
        ctx.textAlign = 'center'

        ctx.fillStyle = shadowColor;
        ctx.fillText(num, x+2, y+2);
        ctx.fillStyle = 'rgba(0, 150, 0, 1)';
        ctx.fillText(num, x, y);  
}


const drawBuildAnimations = () => {
    let now, elapsed;

    for (const anim of settings.buildings.buildAnimations) {
        if (!anim.done) {
            now = Date.now();
            if (now < anim.buildStartTime + anim.buildTime*1000) {
                //still not built, draw animation
                drawBuildAnimation(anim);
                //drawBuildingRange(anim)
            } else {
                anim.setAsDone();
            }

        } 
    }
}

const drawShip = ship => {
    const w = 5;
    const h = 5;
    const x = ship.x - w/2;
    const y = ship.y - h/2;

    let color = ship.color;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    /*
    //test to draw text on enemy ships
    ctx.font = 'normal 30px monospace';
    let text = '☠'; //☠ 
    color = 'red';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center'
    ctx.fillText(text,  x+2, y+2);
    //ctx.fillStyle = world.nameColor;
    ctx.fillStyle = color;
    ctx.fillText(text,  x, y);
    */

}


const drawShips = () => {
    for (const ship of settings.ships.enemy) {
        //drawShipTargetLines(ship);
        if (!ship.dead) {
            drawShip(ship);
        }
    }
}



const drawShipTargetLines = ship => {
    let startX = ship.x, startY = ship.y;
    let endX = ship.moveTarget.x, endY = ship.moveTarget.y;
    let opa = 0.5;
    let r = 0, g = 255, b = 255;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opa})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY)
    ctx.stroke();
    ctx.closePath();
}


const drawGatlingBullet = bullet => {
    const color = 'rgba(255, 215, 0, 0.3)'
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    //ctx.arc(bullet.x, bullet.y, 0.5, 0, Math.PI * 2);
    ctx.moveTo(bullet.tracer.x1, bullet.tracer.y1);
    ctx.lineTo(bullet.tracer.x2, bullet.tracer.y2)
    ctx.closePath();
    //ctx.fill() 
    ctx.stroke();

    //draw dot on bullet head
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.99)';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 0.5, 0, Math.PI * 2);
    ctx.closePath();
    //ctx.stroke();
}


const drawGatlingBullets = () => {
    for (const bullet of settings.gatlingBullets) {
        if (!bullet.done) {
            drawGatlingBullet(bullet);
        }
        
    }
}




const drawTorpedo = torpedo => {
    //const color = 'rgba(255, 215, 0, 0.3)';
    const color = 'rgba(255, 255, 255, 0.9)';
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    //ctx.arc(bullet.x, bullet.y, 0.5, 0, Math.PI * 2);
    ctx.moveTo(torpedo.tracer.x1, torpedo.tracer.y1);
    ctx.lineTo(torpedo.tracer.x2, torpedo.tracer.y2)
    ctx.closePath();
    //ctx.fill() 
    ctx.stroke();

    //draw dot
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.99)';
    ctx.beginPath();
    ctx.arc(torpedo.x, torpedo.y, 0.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
}


const drawTorpedos = () => {
    for (const torpedo of settings.torpedos) {
        if (!torpedo.done) 
            drawTorpedo(torpedo);
    }
}


const drawMissileCurve = missile => {
    const lut = missile.curve.getLUT(100);

    ctx.beginPath();
    for (let i = 0; i < lut.length; i++) {
        let step = lut[i];
        //log(dot)
        ctx.moveTo(step.x,step.y)
        ctx.arc(step.x, step.y, 0.5, 0, Math.PI * 2);
    }
    ctx.stroke();
}


const drawMissile = missile => {
    const color = 'rgba(255, 215, 0, 0.3)';
    //const color = 'rgba(150, 150, 150, 0.99)';
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(missile.x, missile.y, 0.5, 0, Math.PI * 2);
    //draw "tracer": a line which is the missile body
    ctx.moveTo(missile.tracer.x1, missile.tracer.y1);
    ctx.lineTo(missile.tracer.x2, missile.tracer.y2)
    ctx.closePath();
    ctx.stroke();

    //drawMissileCurve(missile);


    //draw dot on the missile head
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.99)';
    ctx.beginPath();
    ctx.arc(missile.x, missile.y, 0.5, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
}


const drawMissiles = () => {
    for (const missile of settings.missiles) {
        if (!missile.done) 
            drawMissile(missile);
    }
}




const drawAoeExplosion = explo => {
    let x = explo.x
    let y = explo.y

    const lineW = explo.lineW;
    let rad = explo.rad; 
    let r = explo.color.r;
    let g = explo.color.g;
    let b = explo.color.b; 
    let opa = explo.opa;
    // this.color = {r:'255', g:'255', b:'150'},  

    const prog = explo.animProg;
    const expo = 0.95

    r = ( (1-prog) * 255 ) **expo
    g = ( (1-prog) * 255 ) **expo
    b = ( (1-prog) * 150 ) **expo

    let color = `rgba(${r}, ${g}, ${b}, ${opa})`;
  
    var gradient = ctx.createRadialGradient(x, y, rad/2, x, y, rad);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.2)');
    gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 55, 255, 1)');
    //ctx.fillStyle = gradient;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineW;

    ctx.globalCompositeOperation = "color-dodge";

    ctx.beginPath();
    ctx.moveTo(x, y)
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    //ctx.stroke();
    ctx.closePath();

    ctx.globalCompositeOperation = "source-over";
 
    
    //ctx.beginPath();
    //color = `rgba(${0}, ${200}, ${200}, ${1})`;
    //ctx.moveTo(x, y)
    //ctx.arc(x, y, rad+20, 0, Math.PI * 2);
    //ctx.stroke();
    //ctx.closePath();
}

const drawAoeExplosions = () => {
    let now, elapsed;

    for (const explo of settings.aoeExplosions) {
        if (explo.done) { continue; }
        drawAoeExplosion(explo);
        now = Date.now();
        elapsed = now - explo.lastFrame;

        if (elapsed > explo.frameDur) {
            explo.lastFrame = now - (elapsed % explo.frameDur);
            explo.increaseRadius()
            explo.decreaseOpa()
            explo.frame++;
            if(explo.frame >= explo.maxFrames) {
                explo.setAsDone();
            }
            explo.setAnimProg();
        }
    }
}

const drawWaveData = () => {
    const wave = settings.wave.current.number;
    const textColor = 'rgba(0, 200, 200, 0.8)';
    let str = `Wave ${wave}`;
    str = String(str).padStart(8);

    const enemies = settings.wave.current.enemyAmount;
    let killed = settings.wave.current.enemiesKilled;
    killed = String(killed).padStart(6)

    str += `${killed}/${enemies}`;

    if (wave === 0) {
        str = "Hostile fleet approaching...";
    }

    if (settings.worlds[0].dead) {
        str +=  ` (world destroyed on Wave ${settings.wave.lostOnWave})`;
    }

    let x = settings.wave.label.x;
    let y = settings.wave.label.y;


    ctx.font = '100 1.5em monospace'; //Caslon
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.textAlign = 'center'

    ctx.fillText(str, x+2, y+2);
    ctx.fillStyle = textColor;
    ctx.fillText(str, x, y);


    if (settings.wave.current.complete) {
        x = x;
        y = y + 30;
        const time = (settings.wave.timeToNext / 1000).toFixed(1); 
        str = `next: ${time}`;
        
        if (wave === 0) {
            str = `${time}`;
        }

        ctx.font = '100 1.5em monospace'; //Caslon
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(str, x+2, y+2);
        ctx.fillStyle = textColor;
        ctx.fillText(str, x, y);

    }

}

