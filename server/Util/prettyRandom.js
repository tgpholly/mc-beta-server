/*
	===========- prettyRandom.js -==========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

let lastRandom = -1;

function pRandom(from = 0, to = 2147483647) {
	let thisRandom = Math.floor(map(Math.random(), 0, 1, from, to));
	if (thisRandom == lastRandom) thisRandom = pRandom(from, to);

	return thisRandom;
}

function map(input, inputMin, inputMax, outputMin, outputMax) {
	const newv = (input - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin;

	if (outputMin < outputMax) return constrain(newv, outputMin, outputMax);
	else return constrain(newv, outputMax, outputMin);
}

function constrain(input, low, high) {
	return Math.max(Math.min(input, high), low);
}

module.exports = pRandom;