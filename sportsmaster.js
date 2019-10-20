//Jacob Park
//Sports Master
//Spec: Uses Twilio to communicate between players of sports teams
var accountSid = 'ACbf44c98eabbf9f2c4df28d7d6ea6aa83'; // Your Account SID from www.twilio.com/console
var authToken = 'b16ed4e28b5100392d0522e5a828a571';   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

var teams = [];//array of team object

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

var inputs = req.body.Body.split(" ");
if(inputs[0] == "master")//master: master <winningTeam>
{
	var team0 = teams[0];
	var team1 = teams[1];
	if(inputs[1] == team0.teamName)//team 1 won
	{
		if(team0.wins == 1)//both teams get off
		{
			teams.shift();
			teams.shift();
		}
		else//switch second team to first team, then shift
		{
			teams[1] = teams[0];
			teams[1].wins = 1;
			teams.shift();
		}
	}
	else if(inputs[1] == team1.teamName)//team 2 won
	{
		if(team1.wins == 1)//both off
		{
			teams.shift();
			teams.shift();
		}
		else//shift, set the first team to wins = 1
		{
			teams.shift();
			teams[0].wins = 1;
		}
	}
	else
		console.log("error");

	for(var k = 0; k < teams[0].contactInfo.length; k++)
	{
		client.messages.create({
	    body: 'Team ' + teams[0].teamName + ', Your Team is Ready!',
	    to: teams[0].contactInfo[k],  // Text this number
	    from: '+17402004652' // From a valid Twilio number
		})
		.then((message) => console.log(message.sid));
	}
	for(var j = 0; j < teams[1].contactInfo.length; j++)
	{
		client.messages.create({
	    body: 'Team ' + teams[1].teamName + ', Your Team is Ready!',
	    to: teams[0].contactInfo[j],  // Text this number
	    from: '+17402004652' // From a valid Twilio number
		})
		.then((message) => console.log(message.sid));
	}
}
else
{
  var teamName = inputs[0];
  var number = req.body.From;
  var wins = 0;
  var joining = false;
  var thisTeam = new Object();
  for(var check1 = 0; check1 < teams.length; check1++)
  {
  	if(teamName == teams[check1].teamName)//they are joining a team
  	{
  		joining = true;
  		teams[check1].contactInfo.push(number);
  		console.log('JOIN');

		client.messages.create({
	    body: 'You have joined Team ' + teams[check1].teamName,
	    to: number,  // Text this number
	    from: '+17402004652' // From a valid Twilio number
		})
		.then((message) => console.log(message.sid));
  	}
  }
  if(joining == false)//creating a team
  {
	var contactInfo = [];
	contactInfo.push(req.body.From);
	thisTeam.teamName = teamName;
	thisTeam.contactInfo = contactInfo;
	thisTeam.wins = 0;
	teams.push(thisTeam);

	client.messages.create({
    body: 'Team ' + thisTeam.teamName + ', Your Team is Queued!',
    to: thisTeam.contactInfo[0],  // Text this number
    from: '+17402004652' // From a valid Twilio number
	})
	.then((message) => console.log(message.sid));
  }
}
  //for testing purposes
  for(var i = 0; i < teams.length; i++)
  {
  	console.log(teams[i].teamName);
  	console.log(teams[i].contactInfo);
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

http.createServer(app).listen(3000, () => {
  console.log('Express server listening on port 3000');
});