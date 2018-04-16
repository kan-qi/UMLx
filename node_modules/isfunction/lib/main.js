// if (typeof require !== 'undefined') {}

var isFunction = function (functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = isFunction;
}