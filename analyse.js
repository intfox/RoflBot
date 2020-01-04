let https = require ('https');
let URL = require('url').URL

const secretConfig = require('./secrets.json')

const subscription_key = secretConfig.azure.key
const endpoint = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics'

let path = '/text/analytics/v2.1/sentiment';

let response_handler = function (response, callback) {
    let body = '';
    response.on('data', function (d) {
        body += d;
    });
    response.on('end', function () {
        callback(JSON.parse(body))
    });
    response.on('error', function (e) {
        console.error('Error: ' + e.message);
    });
};

let get_sentiments = function (documents) {
    let body = JSON.stringify(documents);

    let request_params = {
        method: 'POST',
        hostname: (new URL(endpoint)).hostname,
        path: path,
        headers: {
            'Ocp-Apim-Subscription-Key': subscription_key,
        }
    };

    return new Promise( resolve => {
        let req = https.request(request_params, (resp) => response_handler(resp, resolve));
        req.write(body)
        req.end();
    })
}

function sentiments(message) {
    let documents = {
        'documents': [
            { 'id': '1', 'language': 'ru', 'text': message}
        ]
    };
    return get_sentiments(documents).then(value => {
        return value.documents[0].score
    })
}

module.exports.sentiments = sentiments