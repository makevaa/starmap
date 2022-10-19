// controls.js

const setKeyboardControlListeners = () => {
    document.addEventListener('keydown', function(e) {

        switch (e.key) {
            case '1': openSidebarMenu(0); break;
            case '2': openSidebarMenu(1); break;
            case '3': openSidebarMenu(2); break;
            case 'p': togglePause(); break;
            case 'P': togglePause(); break;    
        }

        /*if(e.shiftKey) { }
        if(e.key === 'z' || e.key === 'Z' ) { }*/
        //log(e)
    });

    document.addEventListener('keyup', function(e) {
        /*if(e.key === "Shift") {} 
        if(e.key === 'z' || e.key === 'Z' ) {}*/
        //log(e)
    });
}
