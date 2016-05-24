# FlyingOranger
An awesome desktop notification system for reddit. Fully customizable.

# Downloads
### [Windows](https://github.com/FlyingOranger/Windows_Installer/releases/download/v1.0/FlyingOranger_Installer.EXE)
### [Mac](https://github.com/FlyingOranger/Mac_Installer) ( needs help! )

# Create your own app!

1. Right click the task tray icon, go to apps, and then edit apps
2. In the directory that pops up, create a new JavaScript file wit the name of your App

### Example
The app file is constructed with the following properties
```javascript
// this example wants to notify us when there is a new top daily post
// to https://www.reddit.com/r/aww/top/?sort=top&t=day

module.exports = {

  // this is the path to what you're going to check on reddit
  path: "/r/aww/top/",

  // these are the queries that come after the '?' on the URL
  queries: {
    sort: "top",
    t: "day"
  },
  
  // this will add a checkbox in the task tray menu
  // so the user can decide what they want
  // default is false ( unchecked )
  settings: {
    "Week Instead of Day": false
  }
  
  // the rate at which we will check reddit, 30 seconds
  interval: 30,
  
  // the meat of the app, our function that gets called
  // with the data from our request to reddit
  cb: function( data, helper ){
  
    // You can see all the properties of the helper object and post object 
    // below this example
    
    // check the settings
    if ( helper.settings[ "Week Instead of Day" ] )
      module.exports.queries.t = "week"
    else
      module.exports.queries.t = "day"
    
    
    // onto the data we got from our request
    if ( data.length > 0 ){
      
      var oldPostId = helper.get("oldPostId"),
          newestPost = data[0];
          
      // if the new post's id isn't equal
      // we know we have a new post
      if ( newestPost.id !== oldPostId){
        
        // save the newest post's id for next time
        helper.set("oldPostId", newestPost.id);
        
        // we use the notify function to communicate
        // with our graphical interface
        helper.notify( "New top r/aww!", newestPost.url );
      
    } // end if

  } // end callback function

} // end module.exports
```

# Documentation
### Data
This is an array posts / comments.

The most important parts of the data object are: 
```
{
    id:         a unique id just for this post,
    score:      reddit's score for this post,
    is_self:    true / false,
    title:      the title of this post,
    url:        link of this post
}
```
There are more as well, just console.log(data) to see

### Helper 
The helper object contains information and functions to speed up development

#### `helper.first` 
Boolean that refers to if this is the first time that this notification app has been called.

#### `helper.settings[ "your setting name" ]`
Returns the value of the settings, be sure the "your setting name" matches exactly
        
#### `helper.set( dataName, dataToSave )`
Saves dataToSave inbetween requests, with the specified dataName

#### `helper.get( dataName )`
Returns the dataToSave inbetween requests from the specified dataName

#### `helper.more() `
Calls your function again, but with 100 more posts after the last previous post

#### `helper.notify( Title, Link, [ willFly ] )`
Sends a notification to the user

* `Title`:  is what is shown in flying banner along with notification in task bar
* `Link`:   is what is your browser opens to when the user clicks on the notification
If the link matches another link already in the task tray, then the banner is flown but not added to the tray (avoid duplicates)
* `willFly`: Optional, is a boolean saying whether or not to fly the banner.
Default is `true`

# License
In order to use Flying Oranger, you must meet the following requirements:

- Be awesome
- Be super awesome

Flying Oranger is Open Source and under the MIT License.

The MIT License (MIT)
Copyright (c) 2016 Joel Barna

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
