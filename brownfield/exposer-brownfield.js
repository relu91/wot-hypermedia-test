const model = require('./expose-brownfiled.tm.json');
const actionModel = require('./model-brown.tm.json');
model['@type'] = 'Thing';
actionModel['@type'] = 'Thing';

// Simulating brownfield service using express
const express = require('express')
const app = express()
const port = 3000

const actions = [];

app.post('/actions/:id/cancel', (req, res) => {
    const action = actions.find( action => action.id == req.params.id)
    if(!action) {
        res.status(404).send('Action not found')
        return;
    }
    action.cancel()
})

app.get('/actions/:id/status', (req, res) => {

    const action = actions.find(action => action.id == req.params.id)
    if (!action) {
        res.status(404).send('Action not found')
        return;
    }
    res.send({
        id: action.id,
        status: action.status
    })
})

// Serving also the model but in principle it could be hosted on a separate service
app.get('/model-brown.tm.json', (req, res) => {
    res.send(require('./model-brown.tm.json'))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

// Use node-wot to expose a valid front TD

WoT.produce(model).then(async exposer => {

    exposer.setActionHandler('longRunning', async () => {
        console.log('Spawn new action');
        const actionInstance = new Action(uniqueID());

        actions.push(actionInstance);

        actionInstance.start();
        return {
            id : ""+actionInstance.id,
            status: actionInstance.status
        };
    });

    await exposer.expose();
}).catch(err => {
    console.error(err);
});

class Action {
    constructor(id) {
        this.id = id;
        this.status = 'pending';
    }

    start() {
        this.status = 'running';
        this.stopping = setTimeout(() => {
            this.finish();
        }, 10000)

        this.running = setTimeout(() => {
            this.status = 'running';
        }, 1000)
    }

    cancel() {
        clearTimeout(this.running);
        clearTimeout(this.stopping);
        this.status = 'cancelled';
    }

    finish() {
        this.status = 'completed';
    }
}

function uniqueID() {
    return Math.floor(Math.random() * Date.now())
}
