var Worker = require('webworker-threads').Worker;
// var w = new Worker('worker.js'); // Standard API
var object = 0;


// You may also pass in a function:
var worker = new Worker(function(){
    postMessage("good.")
    this.onmessage = function(event) {
        self.close();
    };
});


worker.onmessage = function(event) {
    console.log(event.data);
};

worker.postMessage(object);



// var worker = new Worker('fibonacci.js');
//
// worker.onmessage = function(event) {
//     document.getElementById('result').textContent = event.data;
//     dump('Got: ' + event.data + '\n');
// };
//
// worker.onerror = function(error) {
//     dump('Worker error: ' + error.message + '\n');
//     throw error;
// };
//
// worker.postMessage('5');
