const companyTaskDispatcher = require('../');

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
