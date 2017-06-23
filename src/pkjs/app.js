var timeline = require('./timeline');
var keys = require('message_keys');
Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready!');
});

Date.prototype.toIsoString = function() {
    var tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}

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

function addReminder(text)
{
    var pin = {
        "id": "pin-" + genID(),
        "time": new Date().addHours(1).toISOString(),
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
     addReminder(dict['DATA']);
  }
});

