module.exports = function( kittenData, helper){

    if ( kittenData.data.children.length > 0){
        
        var lastPosts = helper.get('last-posts');
        if (lastPosts == null)
            lastPosts = [];
        
        var findLatestPost = function( kData ){
            
            for (var post of kData.data.children){
                post = post.data;
                if (post.score >= 50){
                    
                    if (lastPosts.indexOf(post.name) < 0){
                        
                        // found our new high post
                        //console.log("Found new high post ", post.name, post.url);
                        lastPosts.unshift(post.name);
                        lastPosts.length = 4;
                        
                        helper.set('last-posts', lastPosts);
                        helper.notify("New Kitten!", post.url);
                    }
                    
                    return;
                }
            }
            
            helper.more(findLatestPost);
        };
        
        findLatestPost(kittenData);
    }
}