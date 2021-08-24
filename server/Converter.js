/*
	============- Converter.js -============
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

module.exports.toAbsoluteInt = function(float = 0.0) {
	return Math.floor(float * 32.0);
}

module.exports.to360Fraction = function(float = 0.0) {
	if (float < 0) {
		return Math.abs(Math.max(Math.floor((map(float, 0, -360, 360, 0) / 360) * 256) - 1, 0));	
	} else if (float > 0) {
		return Math.max(Math.floor((float / 360) * 256) - 1, 0);
	}
	//return Math.max(Math.floor((float / 360) * 256), 0) - 1;
}

function map(input, inputMin, inputMax, outputMin, outputMax) {
	const newv = (input - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin;

	if (outputMin < outputMax) return constrain(newv, outputMin, outputMax);
	else return constrain(newv, outputMax, outputMin);
}

function constrain(input, low, high) {
	return Math.max(Math.min(input, high), low);
}