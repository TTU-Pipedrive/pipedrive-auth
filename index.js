let express = require('express');
let Pipedrive = require('pipedrive');

let app = express();

let redirect_uri =
  process.env.REDIRECT_URI ||
  'http://localhost:8888/callback'

app.get('/login', function (req, res) {
  console.log('login initialized');
  Pipedrive.OAuthAuthenticate(
    process.env.PIPEDRIVE_CLIENT_ID,
    redirect_uri,
    res
  )
});

app.get('/callback', function (req, res) {
  Pipedrive.OAuthAuthenticateCallback(
    req,
    res,
    redirect_uri,
    process.env.PIPEDRIVE_CLIENT_ID,
    process.env.PIPEDRIVE_CLIENT_SECRET
  );
});

app.get('/app', function (req, res) {
  let access_token = req.query.access_token || null;
  console.log('access_token: ', access_token);

  let pipedrive = new Pipedrive.Client(access_token, {strictMode: true});

  pipedrive.Deals.getAll({}, function (err, deals) {
    if (err) throw err;
    for (var i = 0; i < deals.length; i++) {
      console.log(deals[i].title + ' (worth ' + deals[i].value + ' ' + deals[i].currency + ')');
    }
  });
});


let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)