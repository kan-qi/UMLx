# Multiprocessing Worker Pattern

## Required Package
- [child_process](https://nodejs.org/api/child_process.html)

## Background
### Problem
In UMLx project, doing the analysis of a project is considered time consuming and CPU intensive, which means when doing the computation work, the server will be blocked and will not be able to handle any new request, even for those light weight tasks such as res.redirect(), so user will have to sit and wait until all the computation has been finished
### Solution
Once the server received a new request of computational expensive tasks, fork a new process (a new nodejs instance) to do the calculation, so that the parent process can be ready to execute following instructions
## Example

In our nodejs service script, say app.js we have a function to do CPU Intensive tasks.

- pack_data(): parse the req object, extract necessary data to be used for computation
- fibo(): the function that actually finish the comoputation tasks, tasks considerable time to return
- res.redirect(): redirect user to certain page
- sendNotification(): function to send a push-notification to browser

```javascript
// app.js
function pack_data(req) {
	return req['body']['fibo_size'];
}

app.get('/compute', function(req, res){
	let packed_data = pack_data(req);
	let result = fibo(packed_data['fibo_size']);
	sendNotification('finished compute');
	res.redirect('xxx')
})
```

Now create a new script file called worker.js

```javascript
# worker.js
process.on("message", packed_obj => {
	let n = packed_obj['fibo_size'];
	let result = fibo(n);
	process.send(JSON.stringify(result));
})
```
After worker node is created, it will listen until received a message, containing required data in computation, and send the result back to parent process after the task is finished

Edit the app.js

```javascript
// app.js
const { fork } = require('child_process');
function pack_data(req) {
	return req['body']['fibo_size']
}

app.get('/compute', function(req, res){
	let packed_data = pack_data(req);
	const worker = fork('./worker.js',
        [],
        {
            execArgv: []
        });
    // add listener before sending message to child process
    worker.on("message", (return_obj) => {
    	let return_obj = JSON.parse(return_obj);
    	let result = return_obj['result'];
    	res.redirect('xxx');
    	worker.kill()
    	sendNotification('computation finished')
    });
    worker.send(JSON.stringify(packed_data));
    sendNotification('task is executing in the backend, please wait...')
})
```

