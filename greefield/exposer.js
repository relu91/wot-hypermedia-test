const model = require('./expose.tm.json');
const actionModel = require('./model.tm.json');
model['@type'] = 'Thing';
actionModel['@type'] = 'Thing';
const actions = [];


WoT.produce(model).then(async exposer => {

    exposer.setActionHandler('longRunning', async () => {
        console.log('Spawn new action');
        const actionInstance = new Action(uniqueID());
        
        actions.push(actionInstance);
    
        actionModel['@id'] = `urn:dev:${actionInstance.id}`;
        actionModel['id'] = `urn:dev:${actionInstance.id}`;

        const actionThing = await WoT.produce(actionModel)
        
        actionThing.setPropertyReadHandler('status', async () => {
            return {
                id: `urn:dev:${actionInstance.id}`,
                status: actionInstance.status
            }
        });
        
        actionThing.setActionHandler('cancel', async () => {
            actionInstance.cancel();
        });

        await actionThing.expose();
        actionInstance.start();
        return actionThing.getThingDescription();
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
