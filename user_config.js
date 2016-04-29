var myinfo = require('./mysecrets');

module.exports = {
    
    "client_id" : ""48Q_9ieHpRTDkA"",
    "client_secret": "",
    
    runOnStartUp: true,
    
    "scope": [
        "privatemessages"
    ],
    
    "crawlers": {
        
        "oranger": {
            "account": true,
            "path": "/message/unread"
        },
        
        "kitten pics":{
            "account": false,
            "path": "/r/aww/search",
            "queries": {
                
                "q": "kitten",
                "sort": "new",
                "restrict_sr": "on",
                "t": "all",
                "limit": 50
                
            }
        }
    }
}
