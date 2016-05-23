"use strict"

var gui = require('./lib/gui_controller'),
    appManager = require('./lib/apps_manager.js'),
    processListeners = require('./lib/process_listeners');


processListeners();
gui.create();
appManager.startAll();