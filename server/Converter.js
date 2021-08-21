module.exports.toAbsoluteInt = function(float = 0.0) {
	return Math.round(float * 32.0);
}

module.exports.to360Fraction = function(float = 0.0) {
	return Math.floor((float / 360) * 256);
}