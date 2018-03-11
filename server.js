let express = require('express')
let request = require('request')
let querystring = require('querystring')

let app = express()

let redirect_uri =
  process.env.REDIRECT_URI ||
  'http://localhost:8888/callback'

app.get('/login', function (req, res) {
  res.redirect('https://oauth.pipedrive.com/oauth/authorize?' +
    querystring.stringify({
      client_id: process.env.PIPEDRIVE_CLIENT_ID,
      redirect_uri,
    }))
})

app.get('/callback', function (req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://oauth.pipedrive.com/oauth/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.PIPEDRIVE_CLIENT_ID + ':' + process.env.PIPEDRIVE_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function (error, response, body) {
    const access_token = body.access_token
    console.log('access token received', access_token);
    res.redirect('http://localhost:8888' + '?access_token=' + access_token)
  })
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)