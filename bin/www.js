const companyTaskDispatcher = require('../');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.set('port', (process.env.PORT || 5000));
app.get('/', function (request, response) {
    const result = 'App is running';
    response.send(result);
});
app.listen(app.get('port'), () => {
    console.log('App is running, server is listening on port', app.get('port'));
});

Array.prototype.next = function () {
    var i = ++this.current;
    if (i >= this.length) {
        this.current = 0;
    }
    return this[this.current];
};
Array.prototype.current = -1;

let start = () => {
    setTimeout(() => {
        companyTaskDispatcher()
            .then(result => {
                start();
            })
            .catch(error => {
                console.log(error);
                start();
            });
    }, 3 * 60 * 1000);
};
start();