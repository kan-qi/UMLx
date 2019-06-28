function A() {}

var set = function(key, value) {
    if (typeof key === "object") {
        for (var field in key) {
            this._data[field] = key[field];
        }
    } else if (typeof key === "string") {
        if (value === null) {
            delete this._data[key];
        } else {
            this._data[key] = value;
        }
    } else {
        this._data = {};
    }
};

function Hello(){
this.write = function write(v) {}
}

function foo() {
  eval('');
  var document = new Hello();
  document.write('hell');
  store("hgiht");
  store("weight");
  deleteFile(3);
  i(function(){
	  Hello();
	  hello1();
  });
  hello(function(){
		hello1();
	});
  return bar() + 19;
}

function hello1(){
	display("hello");
}

function hello(v){
	doCallback(v);
}

function doCallback(callback){
	callback();
}

function i(v){
	v();
}


function bar() {
  return 23;
}

var baz = function aluis() {
  aluis();
};

foo();
this.bar();
new A();