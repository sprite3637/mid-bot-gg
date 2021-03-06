var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var request = require('request')
var token = 'EAAYgeUGhR1sBALgPeJmXKsxerleZCal1rzI6Ec35uoG0n6UcyOo9ZAgD1cR3r3TbjOyGzVqag2Q9ZCSUSBB2PTFuesjIMZAe3rFkBUD6LqbKPZBnfwwBWxAsmZCjyXa27IHkTGLgIMERrPZBZBw2l4UIMBkKZCFZCGtDfH5ZCYQnVZBzewZDZD'
function sendTextMessage (sender, text) {
  messageData = {
    text: text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending message: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('success')
})
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'bot_check') {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong validation token')
  }
})
app.post('/webhook/', function (req, res) {
  var messaging_events = req.body.entry[0].messaging
  for (var i = 0; i < messaging_events.length; i++) {
    var event = req.body.entry[0].messaging[i]
    var sender = event.sender.id
    if (event.message && event.message.text) {
      var text = event.message.text.split(' ')
      if (text[0] === 'sum') {
        var answer = parseInt(text[1], 0) + parseInt(text[2], 0)
        sendTextMessage(sender, answer)
      } else if (text[0] === 'max') {
        answer = parseInt(text[1], 0) > parseInt(text[2], 0) ? parseInt(text[1], 0) : parseInt(text[2], 0)
        sendTextMessage(sender, answer)
      } else if (text[0] === 'min') {
        answer = parseInt(text[1], 0) < parseInt(text[2], 0) ? parseInt(text[1], 0) : parseInt(text[2], 0)
        sendTextMessage(sender, answer)
      } else if (text[0] === 'avg') {
        text.splice(0, 1)
        var result = text.reduce((prev, curr) => prev + parseInt(curr, 0), 0)
        console.log(result)
        answer = result / text.length
        sendTextMessage(sender, answer)
      }
    }
    res.sendStatus(200)
  }
})

app.set('port', (process.env.PORT || 5000))
app.listen(app.get('port'), function () {
  console.log('Example app listening on port' + app.get('port'))
})
