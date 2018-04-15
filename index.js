"use strict";
let express = require('express');
let Pipedrive = require('pipedrive');

let app = express();
let accessToken
const callbackUri =
    process.env.REDIRECT_URI ||
    'http://localhost:8888/callback'

app.get('/login', async (req, res) => {
    console.log('login initialized');
    // console.log(process.env.PIPEDRIVE_CLIENT_SECRET);
    // console.log(process.env.PIPEDRIVE_CLIENT_ID);
    Pipedrive.OAuthAuthenticate(
        process.env.PIPEDRIVE_CLIENT_ID,
        callbackUri,
        res,
    )
})

app.get('/callback', async (req, res) => {
    let body = await Pipedrive.OAuthAuthenticateCallback(
        req,
        res,
        callbackUri,
        process.env.PIPEDRIVE_CLIENT_ID,
        'f053d4404357b5b3fe4bc1a3dc63af089d4be423',
    )
    accessToken = body.access_token
    // res.header('X-User-Context', accessToken)
    // console.log(accessToken);
    const redirectUrl = 'http://localhost:8888/deals'//?accessToken='+accessToken
    res.redirect(redirectUrl)
})

app.get('/deals', function (req, res) {
    console.log('accessToken: ', accessToken);
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});

    pipedrive.Deals.getAll({}, function (err, deals) {
        if (err) throw err;
        for (var i = 0; i < deals.length; i++) {
            console.log(deals[i].title + ' (worth ' + deals[i].value + ' ' + deals[i].currency + ')');
        }
        res.send(deals)
    });
});

app.get('/timeline/deals', function (req, res) {
    console.log('accessToken: ', accessToken);
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});

    pipedrive.Deals.getTimeline({
        start_date:'2018-04-09',
        interval:'day',
        amount:3,
        field_key:'add_time'
    }, function (err, deals) {
        if (err) throw err;
        for (var i = 0; i < deals.length; i++) {
            console.log(deals[i].title + ' (worth ' + deals[i].value + ' ' + deals[i].currency + ')');
        }
        res.send(deals)
    });
});

app.get('/deals/:id', function (req, res) {
    const dealId = req.params.id;
    console.log('accessToken: ', accessToken);
    console.log(dealId);
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Deals.get(dealId, function (err, deal) {
        if (err) throw err;
        console.log(deal.title);
        res.send(deal)
    })
})

app.get('/find/deal', function (req, res) {
    // accessToken = req.query.accessToken;
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Deals.find({term: 'SuperMegaDeal'}, function (err, deal) {
        if (err) throw err;
        console.log(deal.title);
        res.send(deal)
    })
})

app.get('/edit/deal', function (req, res) {
    // accessToken = req.query.accessToken;
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Deals.update(2, {title: 'New Title 2'}, function (err, deal) {
        if (err) throw err;
        console.log(deal.title);
        res.send(deal)
    })
})

app.get('/new/deal', function (req, res) {
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Deals.add({title: 'New deal 6'}, function (err, deal) {
        if (err) throw err;
        console.log("deal created " + deal.id);
        res.send(deal)
    })
})

app.get('/del/deal', function (req, res) {
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Deals.remove(2, function (err, deal) {
        if (err) throw err;
        console.log("deal was removed " + deal);
        res.send(deal)
    })
})

app.get('/delmany/deal', function (req, res) {//TODO
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Deals.removeMany([22, 23], function (err, deal) {
        if (err) throw err;
        console.log("deals were removed " + deal);
        res.send(deal)
    })
})

app.get('/merge/persons', function (req, res) {//TODO
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Persons.merge(22, 23, function (err, person) {
        if (err) throw err;
        console.log("persons were merged " + person);
        res.send(person)
    })
})

app.get('/duplicate/deals', function (req, res) {//TODO do this functionality exists at all?
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.Deals.get(24, function (err, deal) {
        if (err) throw err;
        deal.duplicate(function (err, deal) {
            if (err) throw err;
            console.log("person was duplicated " + deal);
            res.send(deal)
        })
    })
})

app.get("/search", function (req, res) {
    let pipedrive = new Pipedrive.Client(accessToken, {oauth: true});
    pipedrive.SearchResults.field({
        term: "1",
        exact_match: true,
        field_key: "org_id",
        field_type: "dealField",
        return_item_ids: true
    }, function (err, deal) {
        if (err) throw err;
        console.log(deal);
        res.send(deal)
    });
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`)
app.listen(port)