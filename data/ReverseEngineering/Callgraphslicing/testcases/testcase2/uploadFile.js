function takeName() {}

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

function takeFileAttribute(){
this.write = function write(v) {}
}

function receiveFile(file){
  saveFile(file);
}

function saveFile(file) {
  eval('');
  var document = new Hello();
  document.write('hell');
  verifyFileFormat(fileName, function(){
	  takeFileAttribute();
	  takeName();
  });
  writeFile(file);
  alert(function(){
		printWebPage("successfully saved");
	});
  return countFileNumber() + 19;
}

function verifyFileFormat(fileName, func){
	func();
}

function alert(v){
	doCallback(v);
}

function doCallback(callback){
	callback();
}

function countFileNumber() {
  return 23;
}