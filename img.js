const imagesToPreload = {
    imgPath: "img/",
    list:[]
    /*
    list: [
        "City1_600.png",
        "Ice1_600.png",
        "Terran1_600.png",
        "render_planet_2.png",
        'render_planet_4.png',
        'Planet-2.png',
        'Planet-4.png',
        '1.png',
        '2.png',
        '3.png',
        '9.png',
        '12.png',
        'cross_skull.png'
    ]*/
}


function preloadImages(srcs) {
    function loadImage(src) {
        src = imagesToPreload.imgPath + src;
        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.onerror = img.onabort = function() {
                reject(src);
            };
            img.src = src;
        });
    }
    var promises = [];
    for (var i = 0; i < srcs.length; i++) {
        promises.push(loadImage(srcs[i]));
    }
    return Promise.all(promises);
}



