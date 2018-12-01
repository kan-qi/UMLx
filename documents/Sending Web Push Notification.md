# Sending Web Push Notification

## Required Package
- [web-push](https://www.npmjs.com/package/web-push)

## Background
### Problem
In UMLx project, doing the analysis of a project is considered time consuming and CPU intensive, which means when doing the computation work, the request maybe timedout after certain amount of time and then the user will not be able to be informed when task is finished
### Solution
Using a web-push library to allow server to send a push-notification to user indicating the status of task
## Example
Install the library and generate keys

```shell
$ npm install web-push
$ ./node_modules/.bin/web-push generate-vapid-keys

=======================================

Public Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```


- app.post('/subscribe', (req, res) => {}): handle /subscribe rest call to get broswer 'location'. User appToken is used as unique key for each endpoint, saved in a dictionary {appToken : subscription_obj} 

- sendPush(): The actual function which send the push-notification to the browser.

- app.post('/compute', (req, res) => {}): some computation task

```javascript
// app.js
const webpush = require('web-push');

const publicVapidKey = xxxx;
const privateVapidKey = xxxx;

const app = express();

app.use(require('body-parser').json());
let endpoints = {};
app.post('/subscribe', (req, res) => {
    const token = req.cookies.appToken;
    const subscription = req.body;
    if(subscription) {
        endpoints[token] = subscription;
        console.l('server received subsription endpoint');
    } else {
        console.l("server didn't receive corrent endpoint");
    }
    res.status(201).json({});
});

function sendPush(subscription, push_title) {
    const payload = JSON.stringify({title: push_title});
    console.log("DEBUGGGG: ready to send notification");
    if(subscription) {
        webpush.sendNotification(subscription, payload).catch(error => {
            console.error(error.stack);
        });
    } else {
        console.l("sendPush(): subscription endpoint not find, printing endpoints");
        console.l(endpoints);
    }
}

app.post('/compute', (req, res) => {
    	compute(req);
    	const token = req.cookies.appToken;
    	const subscription = tokens[token];
    	sendPush(subscription, 'Computation Finished');
    });
```

Say we have a webpage where is going to upload new projects, the HTML and JS as shown below.

- startEvalPush(): function that triggers front-end browser to send the 'endpoint' to server so that the endpoint will be saved in server with corresponding key.

```html
<html>
  <head>
    <title>Push Demo</title>
    <script type="application/javascript" src="/script.js"></script>
  </head>

  <body>
    Service Worker Demo
    <botton onclick = 'startEvalPush()'>Submit Project</button>
  </body>
</html>
```

```javascript
// worker.js
console.log('Loaded service worker!');

self.addEventListener('push', ev => {
    const data = ev.data.json();
    console.log('Got push', data);
    self.registration.showNotification(data.title, {
        body: 'Message from UMLx Server'
    });
});
```

```javascript
// script.js
// module push notification
const publicVapidKey = 'BM2EKwsY9E_5r5ewHVlZ1hSwpSfRpvqQm0DPT3C60WQ3md98O0_Tb7c56yFfzFlFyaKqNVfYe1Vv2sul6m4Myt0';

async function startEvalPush() {
    console.log("startEvalPush");
    if ('serviceWorker' in navigator) {
        console.log('Registering service worker');
        await sendPushNotification().then().catch(error => console.error(error));
    } else {
        console.log("No service Worker found");
    }
    return true;
}

// Boilerplate borrowed from https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function sendPushNotification() {
    console.log('Registering service worker');
    const registration = await navigator.serviceWorker.register('./js/worker.js');
    if(registration) {
        console.log('Registered service worker');
    }

    console.log('Registering push');
    const subscription = await registration.pushManager.
    subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    console.log('Registered push');
    console.log('Sending push');
    await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'content-type': 'application/json'
        }
    });
}
```
