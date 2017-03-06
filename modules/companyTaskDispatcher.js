const model = require('nodejs-angelco-database');
module.exports = {
    getTaskCompany: () => {
        return new Promise((resolve, reject) => {
            model.taskCompany.Get().then(result => {
                resolve(result);
            });
        });
    }
};