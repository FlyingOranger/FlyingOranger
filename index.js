"use strict"

var gui = require('./lib/gui_controller'),
    crawlManager = require('./lib/crawl_manager.js'),
    processListeners = require('./lib/process_listeners');


processListeners();
gui.create();
crawlManager();

