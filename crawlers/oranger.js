module.exports = function(messageData, helper){

    if (messageData.data.children.length > 0){
        
        var lastName = helper.get('last_name');
        var latestMessage = messageData.data.children[0].data;
        
        if (latestMessage.name !== lastName){
            
            helper.set('last_name', latestMessage.name);
            
            if (latestMessage.subject !== "post reply" &&
                latestMessage.subject !== "comment reply")
                helper.notify("New Message!", "https://www.reddit.com/message/unread/");
            
            else 
                helper.notify(latestMessage.subject, "https://www.reddit.com/message/unread/");
            
        }
    }
};