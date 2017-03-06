var phantom = require('phantom');
module.exports = (html, js) => {
    return new Promise((resolve, reject) => {
        phantom.create()
            .then((phantomInstance) => {
                phantomInstance.createPage()
                    .then((page) => {
                        page.setContent(html, '');
                        page.open('')
                            .then((status) => {
                                page.evaluate(js).then(function(result) {
                                    phantomInstance.exit();
                                    resolve(result);
                                });
                            });
                    });
            });
    });
};