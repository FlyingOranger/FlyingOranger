"use strict"

var gui = require('./lib/gui_controller'),
    crawlManager = require('./lib/crawl_manager.js'),
    //startupManager = require('./lib/startup_manager'),
    processListeners = require('./lib/process_listeners');


processListeners();

startupManager();
gui.create();
setTimeout( () => gui.newMessage("Testing", "www.google.com"));
crawlManager();