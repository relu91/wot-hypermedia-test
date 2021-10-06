
WoTHelpers.fetch("http://localhost:8080/testingactions").then( async td => {
    const thing = await WoT.consume(td);
    
    if (!td.actions.longRunning || td.actions.longRunning.output.model.href !== "http://localhost:8888/model.tm.json") { 
        console.log("Long Running action is synchronous");
        await thing.invokeAction("longRunning");
        return;
    }
    
    console.log("Long Running action is asynchronous");

    const actionInstance = await (await thing.invokeAction("longRunning")).value();
    console.log("Action invoked",actionInstance.id);

    const actionThingHandler = await WoT.consume(actionInstance);
    console.log("Monitoring", actionInstance.id);
    
    const interval = setInterval(async () => {
        try {
            const status = await (await actionThingHandler.readProperty("status")).value();
            console.log("Status", status);
            
            if (status.status === "completed" || status.status === "cancelled") {
                console.log("Action has stopped:", status.status);
                clearInterval(interval);
            }

            if(Math.random() < 0.1){
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