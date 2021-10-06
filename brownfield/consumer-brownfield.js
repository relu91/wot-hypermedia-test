
const pointer = require('jsonpointer');

WoTHelpers.fetch("http://localhost:8080/testingactions").then(async td => {
    const thing = await WoT.consume(td);

    if (!td.actions.longRunning || td.actions.longRunning.output.model.href !== "http://localhost:3000/model-brown.tm.json") {
        console.log("Long Running action is synchronous");
        await thing.invokeAction("longRunning");
        return;
    }

    console.log("Long Running action is asynchronous");
    
    if(!td.actions.longRunning.output.model.mappings) {
        console.log("Long Running action has not mappings -> is a green field device skipping");
        console.log("See example: consumer.js");
        return;
    }


    const actionInstance = await (await thing.invokeAction("longRunning")).value();
    console.log("Action invoked", actionInstance.id);

    //Create a "Action Description" from actionInstance and tm
    const tm = await WoTHelpers.fetch(td.actions.longRunning.output.model.href);
    let tmString = JSON.stringify(tm);

    const mappings = td.actions.longRunning.output.model.mappings;
    for (const p in td.actions.longRunning.output.model.mappings) {
        const variable = mappings[p];
        const value = pointer.get(actionInstance, p);
        const exp = new RegExp(`{{${variable}}}`, 'g');

        tmString = tmString.replace(exp, value);

    }
    
    const actionDescriptor = JSON.parse(tmString);
    tm['@type'] = 'Thing'; // workaround for node-wot

    const actionThingHandler = await WoT.consume(actionDescriptor);

    const interval = setInterval(async () => {
        try {
            const status = await (await actionThingHandler.readProperty("status")).value();
            console.log("Status", status);

            if (status.status === "completed" || status.status === "cancelled") {
                console.log("Action has stopped:", status.status);
                clearInterval(interval);
            }

            if (Math.random() < 0.1) {
                // cancel with action with 10% probability
                console.log("Cancelling action");
                await actionThingHandler.invokeAction("cancel");
            }

        } catch (error) {
            console.log("Can't read", error);
        }

    }, 1000);

}).catch(e => {
    console.log(e);
});