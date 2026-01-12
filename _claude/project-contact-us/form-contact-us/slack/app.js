const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var multer = require('multer');
var multipart = multer();

app.use(express.static(__dirname + '/public'));
app.get('/',function(req,res,next) {
    res.sendFile('/public/index.html', {root: __dirname});
});

app.post('/contactus/slack', multipart.fields([]), function(req, res)  {

    console.log(req.body.InputEmail);
    var Slack = require('slack-node');

    webhookUri = "https://hooks.slack.com/services/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";

    slack = new Slack();
    slack.setWebhook(webhookUri);

    slack.webhook({
      channel: "#contactus",
        username: "Ankita",
        text: "Contact Us message from Ontomatica:\nName: " + req.body.InputName + "\nEmail: "+ req.body.InputEmail +"\nInputPhone: "+ req.body.InputPhone + "\nMessage: "+ req.body.InputMessage +"\n"
    }, function(err, response) {
    //console.log(response);
    });
});

app.listen(8081);
console.log('8081');
