const planetNames1 = [ // Prefix 
    'Alto','Anad','Anta','Atla','Bei','Carn','Cas','Ce','Che','Dam','Drac','Dyn','Eil','Ele','Exa','Fos','Goi','Jei','Ko','Mont','Mos','Nou','Oab','Pro','Psyc','Sak','Scau','Se','Strau','Sum','Ta','Taj','Tas','Trep', 'Vas', 'Vasc','Vio','Vir', 'Thet', 'Dit', 'Ol', 'Chey', 'Bor', 'Sigis', 'Mino', 'Ursa', 'Cro', 'Bal', 'Kio' , 'Arma', 'Syba', 'Kro', 'Tro', 'Dar'
]

const planetNames2 = [ // Suffix 
    'ano','aphon','aren','aria','atar','ator','cia','deo','dine','dryl','fire','fyr','ilon','ina','iv','jak','lia','morth','munus','myre','nides','os','res','ress','ria','ron','sive','tov','tres','tress','uano','uter','vania','vadus','ydus','zuno', 'is' ,'ia','nope', 'eon', 'rov', 'taur', 'etia', 'va', 'os', 'mir', 'geddon'
]
//'grad'



const romanNumerals = [
	'I','II','III','IV','V','VI','VII','IX','X','XI','XII', 
]


const greekLetters = [
    'Alpha','Beta','Gamma','Delta','Zeta','Theta','Iota','Epsilon',
]

const systemSuffix = [
	'Primus','Secundus','Tertius','Decimus','Octavus','Septimus','Prime',
]

const getPlanetName = () => {
    const part1 = selectFrom(planetNames1);
    const part2 = selectFrom(planetNames2);

    let name = part1+part2;


    if (chance(35)) {
        name += ' ' + romanize(ranNum(1,10));
    }

    return name;

}

