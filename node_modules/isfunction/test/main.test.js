if (typeof require !== 'undefined') {
	var isFunction = require('../lib/main.js');
	var expect = require('expect.js');
}


describe('isFunction', function () {

	it('should return true if a function', function (done) {

		var randomFn = function (argument) {},
			randomObj = {},
			randomStr = 'blah';


		expect(isFunction(randomFn)).to.be.ok();
		expect(isFunction(randomObj)).to.not.be.ok();
		expect(isFunction(randomStr)).to.not.be.ok();

		done();

	});

});