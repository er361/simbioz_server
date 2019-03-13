var express = require('express');
app = express();
port = process.env.PORT || 80;

var util = require('@google/maps/lib/util');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCIP1QtcSZrTW0MWH6P36WWlW7O74l4pjI',
    Promise: Promise
});

app.get('/route/:origin/:destination', function (req, res) {
    console.log(req.params);

    googleMapsClient.directions(
        {
            origin: req.params.origin,
            destination: req.params.destination
        }
    ).asPromise()
        .then((response) => {
            let path = response.json.routes;
            let encodedPoints = path[0].overview_polyline.points;

            MongoClient.connect(url, function (err, client) {

                if (err)
                    console.log(err);

                const db = client.db('local');
                let paths = db.collection('paths');

                paths.insertOne({
                    encodedPoints: encodedPoints
                }, (err, mRes) => {
                    if (!err){
                        res.send('ok')
                    }
                });
                client.close();
            })
        }).catch((err) => {
            res.send(err)
    });
});
app.get('/routes',function (req, res) {
    MongoClient.connect(url, function (err, client) {

        if (err)
            console.log(err);

        const db = client.db('local');
        let paths = db.collection('paths');
        let all = paths.find().toArray();

        res.header('Access-Control-Allow-Origin','*');

        all.then(mres => res.send(mres));

        client.close();
    })
});

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);