changeDateFormat = function(date){
    if (date) {
        var date = new Date(date),
        month = date.getMonth() + 1,
        year  = date.getFullYear(),
        date = date.getDate();
        return month + '/' + date + '/' + year;
    }
}

getNumber = function(num) {
	if(num){
		if(num % 1 != 0){
			num = parseInt(num);
		}
		var filler = [];
		for(var i=1; i<=num; i++){
		    filler.push(i);
		}
	  	return filler;
	}
}

checkHalfStar = function(num){
	if(num != 5){
  		if(num % 1 != 0){
    		return true;
  		}
	}
}

printEmptyStar = function(num){
	if(num % 1 != 0){     
	  	num = parseInt(5 - num);
	}else{
	  	num = 5 - num; 
	}
	if(!num){
	  	return [];
	}else{
		let filler = [];
		for(var i=1; i<=num; i++){
		    filler.push(i);
		}
	  	return filler; 
	}
}