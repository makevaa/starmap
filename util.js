// util.js

const log = console.log;

const initCanvas = () => {
    window.devicePixelRatio=1; 
  
    let viewportW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let viewportH = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    settings.viewport.w = viewportW;
    settings.viewport.h = viewportH;


    let tSize = settings.bg.tileSize;
    let canvasW = settings.bg.w * tSize; 
    let canvasH = settings.bg.h * tSize;

    if (settings.fullScreen) {
      canvasW = viewportW;
      canvasH = viewportH;
      settings.bg.w = canvasW / tSize;
      settings.bg.h = canvasH / tSize;
    }
  
    if (canvasW > viewportW) { canvasW = viewportW; }
    if (canvasH > viewportH) { canvasH = viewportH; }
  
    let scale = window.devicePixelRatio;  

    const canvas = document.getElementById('canvas'); 
    const ctx = canvas.getContext('2d'); 
    canvas.width = Math.floor(canvasW * scale); 
    canvas.height = Math.floor(canvasH * scale); 
    ctx.scale(scale, scale); 

    settings.canvas.w = canvas.width;
    settings.canvas.h = canvas.height;
    

    /*
    //do same for the highlight-canvas
    const canvas2 = document.getElementById('highlight-canvas'); 
    const ctx2 = canvas.getContext('2d'); 
    canvas2.width = Math.floor(canvasW * scale); 
    canvas2.height = Math.floor(canvasH * scale); 
    ctx2.scale(scale, scale); 
    */
  }
  
  
  const setDrawDistance = () => {
    let viewportW = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let viewportH = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  
    let tSize = game.tileSize;
    let maxDist = game.drawDistance.max;
    let hDist = maxDist; //horizontal
    let vDist = maxDist; //vertical
  
    //if viewport can't fit maxDist tiles, lower the distances accordingly
    let hTiles =  Math.floor(viewportW / tSize); //how many horizontal tiles we can fit to viewport
    let vTiles =  Math.floor(viewportH / tSize); //vertical tiles 
    log("hTiles: " + hTiles + ", vTiles: " + vTiles);
  
    if (maxDist*2 + 1 >= hTiles) 
      hDist = Math.floor(hTiles/2);
    
    if (maxDist*2 + 1 >= vTiles) 
      vDist =  Math.floor(vTiles/2 + 1);
  
    game.drawDistance.h = hDist;
    game.drawDistance.v = vDist;
  }
  
  
  function isElementInViewport (el) {
    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
  
    var rect = el.getBoundingClientRect();
  
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }
  
  function testTileVisibility() {
    let row = document.querySelectorAll('.tile-row')[0]
    let tile = row.querySelectorAll('.tile')[0]
    let status = isElementInViewport(tile);
    let str = "testTileVisibility game.map[0][0]: " + status;
    //console.log(str);
  }
  
  const tileInViewport = function(x,y) {
    let row = document.querySelectorAll('.tile-row')[y]
    let tile = row.querySelectorAll('.tile')[x]
    let status = isElementInViewport(tile);
    return status;
    //let str = "testTileVisibility game.map[0][0]: " + status;
    //console.log(str);
  }
  
  
  function startsWithCapitalLetter(word) {
      return word[0] !== word[0].toLowerCase();
    }
  
  
  function sortByAttribute(array, ...attrs) {
      // generate an array of predicate-objects contains
      // property getter, and descending indicator
      let predicates = attrs.map(pred => {
        let descending = pred.charAt(0) === '-' ? -1 : 1;
        pred = pred.replace(/^-/, '');
        return {
          getter: o => o[pred],
          descend: descending
        };
      });
      // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
      return array.map(item => {
        return {
          src: item,
          compareValues: predicates.map(predicate => predicate.getter(item))
        };
      })
      .sort((o1, o2) => {
        let i = -1, result = 0;
        while (++i < predicates.length) {
          if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
          if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
          if (result *= predicates[i].descend) break;
        }
        return result;
      })
      .map(item => item.src);
    }
    
  const toRadian = d => d * Math.PI / 180;
  
  const circle = function(context, x, y, r, color, fill, lineWidth, globalAlpha = 1) {
    context.globalAlpha = globalAlpha;
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    fill ? context.fill() :  context.stroke();
    context.globalAlpha = 1;
    context.closePath();
  }
  
  const line = (context, sx, sy, tx, ty, color, lineWidth, globalAlpha = 1) => {
    //const w = 0;
    context.globalAlpha = globalAlpha;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(sx, sy);
    context.lineTo(tx, ty);
    context.stroke();
    context.globalAlpha = 1;
    context.closePath();
  
    //context.fillStyle = "white";
    //context.fillRect(tx - w / 2, ty - w / 2, w, w);
  };
  
  const rect = function(context, x, y, w, h, color, mode = "stroke", isCentered = false) {
    context.beginPath();
  
    if (isCentered) y = y - h / 2
  
    if (mode === "stroke") {
      context.strokeStyle = color;
      context.strokeRect(x, y, w, h);
      context.stroke();
    } else {
      context.fillStyle = color;
      context.fillRect(x, y, w, h);
    }
    context.closePath();
  };

  
  
  Object.prototype.allFalse = function() { 
    for (var i in this) {
        if (this[i] === true) return false;
    }
    return true;
  }
  
  //log to game log area
  const gameLog = (msg, color = '#06a9e0') => {
    let target = document.querySelector('#log');
  
    let item = document.createElement("div");
    item.classList.add("item");
    
  
    let timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");
    let time = Date.now();
    timestamp.innerHTML = "["+time+"]";
    item.append(timestamp);
  
    let message = document.createElement("span");
    message.innerHTML = msg;
    message.style.color = color;
    item.append(message);
   
  
  
    target.prepend(item);
  
    let logCount = target.childElementCount;
    if(logCount > 10) {
      let lastElem = document.querySelectorAll('#log > .item')[10];
      lastElem.remove();
    }
  }

  
  const hexToRgbOld = hex => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  
  
  const transformCanvas = () => {
    const target = document.getElementById('canvas-container'); 
    let str = "";
    //transform: perspective(400px) rotateX(20deg) rotateZ(20deg) translateZ(-10px) translateY(-50px);
    str += 'transform: ';
    str +=  'perspective(500px) translateY(-70px) rotateX(30deg) rotateZ(45deg)';
    target.setAttribute('style', str);
    //canvas.style.transform(str);
    log("transformCanvas")
  }


  
const setTileHighlightColors = () => {
  let borderColor = settings.highlight.borderColor;
  borderColor = colorNameToHex(borderColor);
  borderColor = hexToRgbaStr(borderColor, settings.highlight.borderOpacity);

  let fillColor = settings.highlight.fillColor;
  fillColor = colorNameToHex(fillColor);
  fillColor = hexToRgbaStr(fillColor, settings.highlight.fillOpacity);

  settings.highlight.border = borderColor;
  settings.highlight.fill = fillColor;
} 

const degreesToRadians = degrees => { return degrees * Math.PI / 180; }
const radiansToDegrees = radians => { return radians * 180 / Math.PI; }


//https://stackoverflow.com/a/9083076
const romanize = num => {
  if (isNaN(num)) { return NaN; }
  if (num === 0) {return 'N'}
      
  let digits = String(+num).split(""),
      key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
             "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
             "","I","II","III","IV","V","VI","VII","VIII","IX"],
      roman = "",
      i = 3;
  while (i--)
      roman = (key[+digits.pop() + (i * 10)] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}


  
const changeCursor = cursor => {
  //game.cursor = cursor;
  document.body.style.cursor = `url('${cursor}'),auto`;
}
  

//check if mouse is inside or outside the grid/map
const mouseIsInsideGrid = () => {
  const x = settings.mouse.x;
  const y = settings.mouse.y;
  const grid = settings.grid.pos;

  if (x > grid.x1 && x < grid.x2 && y > grid.y1 && y < grid.y2) {
    return true
  } else {
    return false
  }
}


const togglePause = () => {
  settings.paused = !settings.paused;
  const label = document.getElementById('pause-label');
  if (settings.paused) {
    label.style.display = 'flex';
  } else {
    label.style.display = 'none';
  }
}




