var timeline = require('./timeline');
Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready!');
});

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}
function genID()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function addReminder(text,date)
{
    var pin = {
        "id": "pin-" + genID(),
        "time": new Date(date).toISOString(),
        "layout": {
          "type": "genericPin",
          "title": "Rappel " + text.substring(0,10),
          "body": text,
          "tinyIcon": "system://images/NOTIFICATION_REMINDER"
        }, "createNotification": {
                  "layout": {
                      "type": "genericNotification",
                      "title": "Rappel " + text.substring(0,10),
                      "body": text }
        }};
    console.log('Inserting pin in the future: ' + JSON.stringify(pin));
    timeline.insertUserPin(pin, function(responseText) { 
     var dict = {'ACTION': 0};
      Pebble.sendAppMessage(dict, function() {
}, function(e) {
  console.log('Message failed: ' + JSON.stringify(e));
});
    });
}

Pebble.addEventListener('appmessage', function(e) {
  // Get the dictionary from the message
  var dict = e.payload;
  console.log('Got message: ' + JSON.stringify(dict));
  
  if(dict['ACTION'] == 0){
     addReminder(dict['DATA'],dict["DATE"]);
  }
});

