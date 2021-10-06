# WoT hyper media proposal 3 - testing

This repository contains some scripts to play with the [new proposal]() for WoT asynchronous actions.

Scripts are divided into two folders one for greenfield devices and the other for brownfiled devices. 

# Running
Sadly I am using the current dev version of [node-wot]() plus minor fixes that should be published soon. 

Therefore, to proper running this script locally you have to clone [node-wot]() and use `packages/cli/dist/cli.js` 
script.

Example:
```
$ cd node-wot
$ npm install
$ cd packages/cli/dist
$ node cli.js ../path-to-this-repo/greenfield/consumer
```
