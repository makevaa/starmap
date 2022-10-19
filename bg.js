const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const drawBgColor = () => {
    let color = settings.bg.color;
    let tSize = settings.bg.tileSize;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, settings.bg.w*tSize, settings.bg.h*tSize);
}


const drawDotStars = () => {
    const size = settings.bg.tileSize;
    let sizeMultiplier = 1;
    let color = settings.bg.dotStar.color;
    let r = 255, g = 255, b = 255

    for (let i = 0; i < settings.bg.dotStar.amount; i++) {
        let x = ranNum(0,settings.bg.w);
        let y = ranNum(0,settings.bg.h);
        let opa = Math.random();
        if (opa < 0.2) { opa = 0.2}
   
        //if (chance(1)) {  r = ranNum(100,255) }
        //if (chance(1)) {  g = ranNum(100,255) }
        //if (chance(1)) {  b = ranNum(100,255) }
        if (chance(0)) {  sizeMultiplier = 1.5 }

        color = `rgba(${r},${g},${b},${opa})`
        ctx.fillStyle = color;
        ctx.fillRect(x*size, y*size, size*sizeMultiplier, size*sizeMultiplier);
    }  
}



const drawCircles = () => {
    let amount = settings.bg.circles.amount;
    let sizeMin = settings.bg.circles.sizeMin;
    let sizeMax = settings.bg.circles.sizeMax;
    let opa = settings.bg.circles.opacity;
    let tSize = settings.bg.tileSize;
    let lineWidth = settings.bg.circles.lineWidth + tSize - 1;

    //const colors = ['red','lime','blue','orange']
    const colors = settings.bg.circles.colors;
  
    for (let i = 0; i < amount; i++) {
        let rad = ranNum(sizeMin ,sizeMax)
        let x = ranNum(0-rad*0.4, settings.bg.w+rad*0.4) * tSize;
        let y = ranNum(0, settings.bg.h) * tSize;

        let color = selectFrom(colors);  
        color = colorNameToHex(color);
        color = hexToRgbaStr(color, opa);
        let fill = false;
        fill = (chance(0))
        circle(ctx, x, y, rad, color, fill, lineWidth);
    }
}

const drawLayerCircles = () => {
    const amount = settings.bg.layerCircles.amount;
    const layerAmountMin = settings.bg.layerCircles.layersMin;
    const layerAmountMax = settings.bg.layerCircles.layersMax;
    const radMin = settings.bg.layerCircles.radMin;
    const radMax = settings.bg.layerCircles.radMax;
    const opa = settings.bg.layerCircles.opacity;
    const lineWidth = settings.bg.layerCircles.lineWidth;
    const colors = settings.bg.layerCircles.colors;

    const tSize = settings.bg.tileSize;

    for (let i = 0; i < amount; i++) {
        const rad = ranNum(radMin, radMax); 
        const origX = ranNum(rad, settings.bg.w-rad) * tSize;
        const origY = ranNum(rad, settings.bg.h-rad) * tSize;

        let color = selectFrom(colors);  
        color = colorNameToHex(color);
        color = hexToRgbaStr(color, opa);
        let fill = false;
        //fill = chance(50)
        const layerAmount = ranNum(layerAmountMin, layerAmountMax); 

        for (let j = 0; j < layerAmount; j++) {
            let x = origX, y = origY
            const layerRad =  rad - ( (rad/layerAmount) * j )

            if (j > 0) {
                const rem = (rad-layerRad)/2 
                x = ranNum( origX-rem, origX+rem ) ;
                y = ranNum( origY-rem, origY+rem );
            }
            circle(ctx, x, y, layerRad, color, fill, lineWidth);
        }  
    }
}

const drawLayerStars = () => {
    let amount = 1;
    let layerAmount = 5;
    let radMin = 100;
    let radMax = 100;
    let opa = 0.002;
    let tSize = settings.bg.tileSize;
    let lineWidth = tSize + 1;

    let colors = ['red','green','blue','orange']

    colors = ['dodgerblue','lightcoral','steelblue','MidnightBlue','DarkSlateBlue', 'lavender']
    //const colors = ['red']
  
    for (let i = 0; i < amount; i++) {
        let rad = ranNum(radMin, radMax); 
        let x = ranNum(0,settings.bg.w)*tSize;
        let y = ranNum(0,settings.bg.h)*tSize;

        let color = selectFrom(colors);  
        color = colorNameToHex(color);
        color = hexToRgbaStr(color, opa);
        let whiteColor  = colorNameToHex('white');
        whiteColor= hexToRgbaStr(whiteColor,opa);
        let fill = true;
        
        //log( `rad: ${rad}` )
        for (let j = 0; j < layerAmount; j++) {
            //let linear =  rad - ( (rad/layerAmount) * j ) //linear
            let layerRad = (rad - ( (rad/layerAmount) * j ) ) * Math.log(j)
       
     
            let debug =  (rad/layerAmount) * j + (Math.log(0.1) ) 
            debug = (Math.log(0.1)) * (j*10) 
            if ( j > layerAmount - ( Math.round(layerAmount / 4) ) ) {
                color = whiteColor;
            }
            circle(ctx, x, y, layerRad, color, fill, lineWidth, 0.5);
        }
    }
}

const drawMist = () => {
    let amount = settings.bg.mist.amount;
    let radMin = settings.bg.mist.radMin;
    let radMax = settings.bg.mist.radMax;
    let opa = settings.bg.mist.opacity;
    //let color = settings.bg.mist.color;
    //color = colorNameToHex(color);
    //color = hexToRgbaStr(color, opa);
    let tSize = settings.bg.tileSize;

    let processedColors = []//for multicolor
    for (let i = 0; i < settings.bg.mist.colors.length; i++) {
        let tempColor = settings.bg.mist.colors[i];
        //if color is a name string instead of hex value, convert to hex
        if ( !tempColor.includes('#')) { tempColor = colorNameToHex(tempColor); }
       
   
        tempColor = hexToRgbaStr(tempColor, opa);
        processedColors.push(tempColor)
    }

    const themeColor1 = selectFrom(processedColors);
    processedColors = processedColors.filter(e => e !== themeColor1); //remove picked color
    const themeColor2 = selectFrom(processedColors);
    processedColors = processedColors.filter(e => e !== themeColor2);
    const themeColor3 = selectFrom(processedColors);
    const colorTheme = [themeColor1, themeColor2, themeColor3]
    

    for (let i = 0; i < amount; i++) {
        let rad = ranNum(radMin,radMax);
        //let x = ranNum(0-radMin*0.4,settings.bg.w+radMin*0.4)*tSize;
        //let y = ranNum(0-radMin*0.4,settings.bg.h+radMin*0.4)*tSize;
        let x = ranNum(0-rad*0.5,settings.bg.w+rad*0.5)*tSize;
        let y = ranNum(0-rad*0.5,settings.bg.h+rad*0.5)*tSize;
        //let x = ranNum(0, settings.bg.w) * tSize;
        //let y = ranNum(0 ,settings.bg.h) * tSize;

        if (settings.bg.mist.multiColor) { 
            color = colorTheme[0];
            
            if (chance(50)) { 
                color = colorTheme[ranNum(1,colorTheme.length-1)]  
            }
        };
        //log("mist color index: " + color);
        //log("mist color index: " +  colorTheme.indexOf(color));

      
        circle(ctx, x, y, rad, color, true, 1);
    }
}

const drawVignette = () => {
    const amount = settings.bg.vignette.amount;
    const radMin = settings.bg.vignette.radMin;
    const radMax = settings.bg.vignette.radMax;
    const color = settings.bg.vignette.color;
    const margin = settings.bg.vignette.margin;
    let rad, x, y;

    for (let i = 0; i < amount; i++) {
        //top
        rad = ranNum(radMin,radMax);
        x = ranNum(margin, settings.bg.w-margin);
        circle(ctx, x, 0, rad, color, true, 1);

        //bottom
        rad = ranNum(radMin,radMax)
        x = ranNum(margin, settings.bg.w-margin);
        //circle(ctx, x, settings.bg.h, rad, color, true, 1);
    }

    for (let i = 0; i < amount / 2; i++) {
        //left
        rad = ranNum(radMin,radMax);
        y = ranNum(margin/2, settings.bg.h-(margin/2));
        circle(ctx, 0, y, rad, color, true, 1);

        //right
        rad = ranNum(radMin,radMax)
        y = ranNum(margin/2, settings.bg.h-(margin/2));
        circle(ctx, settings.bg.w, y, rad, color, true, 1);
    }
}



const drawLines = () => {
    const amount = settings.bg.lines.amount;
    const lenMin = settings.bg.lines.lenMin;
    const lenMax = settings.bg.lines.lenMax;
    const opa = settings.bg.lines.opacity;
    const lineWidth = settings.bg.lines.lineWidth;

    let color = settings.bg.lines.color;
    color = colorNameToHex(color);
    color = hexToRgbaStr(color, opa);

    let processedColors = []
    for (let i = 0; i < settings.bg.lines.colors.length; i++) {
        let tempColor = settings.bg.lines.colors[i];
        tempColor = colorNameToHex(tempColor);
        tempColor = hexToRgbaStr(tempColor, opa);
        processedColors.push(tempColor)
    }

    const timer = ms => new Promise(res => setTimeout(res, ms))
    async function load() { // We need to wrap the loop into an async function for this to work
        for (let i = 0; i < amount; i++) {
            const len = ranNum(lenMin, lenMax);
            const startX = ranNum(0,settings.bg.w);
            const startY = ranNum(0,settings.bg.h);
            const endX = ranNum( startX-len, startX+len)
            const endY = ranNum( startY-len, startY+len)
            if (settings.bg.lines.multiColor) { color = selectFrom(processedColors)};
            line(ctx, startX, startY, endX, endY, color, lineWidth);
            await timer(10); // then the created Promise can be awaited
        }
    }
    load();
}

const createBg = () => {
    drawBgColor();
    drawLayerStars();
    drawMist();
    drawDotStars();
    if (settings.bg.vignette.draw) { drawVignette(); }
    //drawLines(); 
    //drawCircles();
    //drawLayerCircles();
}

const saveBg = () => {
    const img = new Image();
    img.src = canvas.toDataURL();
    bgUrl = img;
}

const drawBgImage = () => {
    ctx.drawImage(bgUrl,0,0);
}