var genTools = {
	
	ranNum: function(min,max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	
	selectFrom: function(arr) {
		return arr[genTools.ranNum(0, arr.length-1)];
	},	
	
	reverseString: function(str) {
		return str.split("").reverse().join("");
	},	

	chance: function(chancePercent) {
		if (genTools.ranNum(1,100) <= chancePercent){
			return true;
		} else {
			return false;
		}
	},	

	shuffleArr: function(arr) {
		for (let i = arr.length; i; i--) {
			let j = Math.floor(Math.random() * i);
			[arr[i - 1], arr[j]] = [arr[j], arr[i - 1]];
		}		
	},		
	
	shuffleStr: function (str) {
		var charArr = [], newStr = "";
		for (i = 0; i < str.length; i++) { 
			var chara = str.charAt(i);
			charArr.push(chara);			
		}	
		genTools.shuffleArr(charArr);	
		for (i = 0; i < charArr.length; i++) { 
			newStr += charArr[i];	
		}
		return newStr;
	},

	capitalize: function(str) {
		//log(str);
		//str = str.trim();
		str = str.charAt(0).toUpperCase() + str.substr(1);
		return str;
	
	},
	
	toTitleCase: function(str) {
		var words = str.split(" ");
		for (let i = 0; i < words.length; i++) {
		  words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1);
		}
		return words.join(" ");
	},
	
    selectFromArrs: function(arrayOfArrays) {
		var app = genTools,  megaArray = [];
		for (let i = 0; i < arrayOfArrays.length; i++) {
			megaArray = megaArray.concat(arrayOfArrays[i]);
		}
        return app.selectFrom(megaArray)
    }
}

const ranNum = genTools.ranNum;
const selectFrom = genTools.selectFrom;
const chance = genTools.chance;
const shuffleArr = genTools.shuffleArr;
const capitalize = genTools.capitalize;
const toTitleCase = genTools.toTitleCase;
const selectFromArrs = genTools.selectFromArrs;

