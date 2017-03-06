const companyTaskDispatcher = require('./modules/companyTaskDispatcher');
const downloadPage = require('./modules/downloadPage');
const configurations = require('./modules/configurations');
const pageCrawler = require('./modules/pageCrawler');
const model = require('nodejs-angelco-database');
module.exports = () => {
    return new Promise((resolve, reject) => {
        var company = {};
        company.jobs = [];
        var taskId;
        return companyTaskDispatcher.getTaskCompany()
            .then(result => {
                if (result != undefined) {
                    taskId = result.taskId;
                    company.id = result.companyNumericId;
                    return downloadPage(configurations.startupUri + result.companyNumericId);
                } else {
                    reject('bad proxy now0');
                }
            })
            .then(result => {
                return pageCrawler(result, function () {
                    var result = {};
                    var companyName;
                    companyName = document.getElementsByClassName('u-fontWeight500 s-vgBottom0_5')[0];
                    if (companyName != undefined) {
                        result.name = companyName.textContent.trim();
                    }
                    var site = document.getElementsByClassName('company_url')[0];
                    if (site) {
                        result.site = site.href;
                    }
                    var button = document.getElementsByClassName('details-button')[0];
                    if (button) {
                        var buttonA = button.getElementsByTagName('a')[0];
                        if (buttonA != 'undefined') {
                            result.jobsLink = buttonA.href.split('?')[0].replace(/(?:\r\n|\r|\n)/g, ' ');
                        }
                    }
                    var team = [];
                    var employee = document.querySelectorAll('[data-role=employee]')[0];
                    if (employee != undefined) {
                        var roles = employee.getElementsByClassName('role');
                        if (roles != undefined) {
                            for (var r = 0; r < roles.length; r++) {
                                var role = roles[r];
                                if (role) {
                                    var roleTitle = role.getElementsByClassName('role_title')[0];
                                    if (roleTitle) {
                                        var title = roleTitle.textContent;
                                        if (title) {
                                            title = title.split('?')[0].replace(/(?:\r\n|\r|\n)/g, ' ');
                                            if ((title.toLowerCase().indexOf(' pm ') + 1) ||
                                                (title.toLowerCase() === 'cto') ||
                                                (title.toLowerCase().indexOf('project manager') + 1)) {
                                                var nameelement = role.getElementsByClassName('name')[0];
                                                if (nameelement != undefined) {
                                                    var personName = nameelement.textContent.replace(/(?:\r\n|\r|\n)/g, ' ');
                                                    if (personName != undefined) {
                                                        team.push({
                                                            name: personName,
                                                            position: title
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    result.team = team;

                    return result;
                });
            })
            .then(result => {
                console.log(result);
                company.name = result.name;
                company.site = result.site;

                for (var t = 0; t < result.team; t++) {
                    company.founders.push(result[t]);
                }

                var link = result.jobsLink;
                if (link.startsWith('javascript:void')) {
                    throw new Error('No jobs');
                } else {
                    return downloadPage(link);
                }
            })
            .then(result => {
                return pageCrawler(result, function () {
                    var result = {};
                    var jobList = document.getElementsByClassName('job-listing-role');
                    var list;
                    var jobLinks = [];
                    for (var i = 0; i < jobList.length; i++) {
                        if (jobList[i].getElementsByClassName('group')[0].textContent.trim() == "Software Engineering") {
                            list = jobList[i];
                        }
                    }
                    if (list) {
                        var elements = list.getElementsByClassName('listing-title');
                        for (var i = 0; i < elements.length; i++) {
                            jobLinks.push(elements[i].getElementsByTagName('a')[0].href);
                        }
                    }
                    var teamMembers = [];
                    var members = document.getElementsByClassName('team-members')[0];
                    if (members) {
                        var team = members.getElementsByClassName('card');
                        for (var i = 0; i < team.length; i++) {
                            var name = team[i].getElementsByClassName('object-list-title')[0].getElementsByTagName('a')[0].text;
                            if (team[i].getElementsByClassName('object-list-subtitle')[0]) {
                                var position = team[i].getElementsByClassName('object-list-subtitle')[0].textContent.trim().replace(/(?:\r\n|\r|\n)/g, ' ');
                            }

                            teamMembers.push({
                                name: name,
                                position: position
                            });
                        }
                    }
                    result.jobLinks = jobLinks;
                    result.founders = teamMembers;
                    return result;
                });
            })
            .then(result => {
                for (var f = 0; f < result.founders; f++) {
                    company.founders.push(result.founders[f]);
                }
                var links = result.jobLinks;
                var promises = [];
                for (var i = 0; i < links.length; i++) {
                    ((i) => {
                        promises.push(() => {
                            return new Promise((resolve, reject) => {
                                return downloadPage(links[i])
                                    .then(result => {
                                        return pageCrawler(result, function () {
                                            var result = {};
                                            var textTitle = document.getElementsByClassName('u-colorGray3')[0];
                                            if (textTitle) {
                                                var textTitleSplit = textTitle.textContent.split('at')[0];
                                                {
                                                    if (textTitleSplit) {
                                                        result.jobTitle = textTitleSplit.replace(/(?:\r\n|\r|\n)/g, ' ');
                                                    }
                                                }
                                            }
                                            var textDescription = document.getElementsByClassName('job-description')[0];
                                            if (textDescription) {
                                                var textDescriptionTextContent = textDescription.textContent;
                                                if (textDescriptionTextContent) {
                                                    result.jobDescription = textDescriptionTextContent.trim().replace(/(?:\r\n|\r|\n)/g, ' ');
                                                }
                                            }
                                            var pageElement = document.getElementsByClassName('s-vgBottom0_5')[0];
                                            if (pageElement) {
                                                if (pageElement.textContent == "Skills") {
                                                    var textSkills = document.getElementsByClassName('s-vgBottom2')[0];
                                                    if (textSkills) {
                                                        var textSkillsTextContent = textSkills.textContent;
                                                        if (textSkillsTextContent) {
                                                            result.skills = textSkillsTextContent.trim().replace(/(?:\r\n|\r|\n)/g, ' ');
                                                        }
                                                    }
                                                    var textCompensation = document.getElementsByClassName('s-vgBottom2')[1];
                                                    if (textCompensation) {
                                                        var textCompensationTextContentm = textCompensation.textContent;
                                                        if (textCompensationTextContentm) {
                                                            result.compensation = textCompensationTextContentm.trim().replace(/(?:\r\n|\r|\n)/g, ' ');
                                                        }
                                                    }
                                                } else {
                                                    var textCompensation = document.getElementsByClassName('s-vgBottom2')[0];
                                                    if (textCompensation) {
                                                        var textCompensationTextContentm = textCompensation.textContent;
                                                        if (textCompensationTextContentm) {
                                                            result.compensation = textCompensationTextContentm.trim().replace(/(?:\r\n|\r|\n)/g, ' ');
                                                        }
                                                    }
                                                }
                                            }
                                            return result;
                                        });
                                    })
                                    .then(result => {
                                        company.jobs.push({
                                            jobTitle: result.jobTitle,
                                            jobDescription: result.jobDescription,
                                            skills: result.skills,
                                            compensation: result.compensation
                                        });
                                        console.log(company.jobs.length);
                                    })
                                    .then(() => {
                                        return new Promise((resolve, reject) => {
                                            console.log('start timeout');
                                            setTimeout(() => {
                                                resolve();
                                            }, 10000);
                                        });
                                    })
                                    .then(() => {
                                        resolve(company);
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        reject(error);
                                    });
                            })
                        });
                    })(i);
                }
                promises.push(() => {
                    var companyId = company.id;
                    console.log(company.jobs.length);
                    model.company.Save(company)
                        .then((result) => {
                            if (result != undefined) {
                                var id = result._id;
                                return model.taskCompany.AddCompanyId(companyId, id);
                            } else {
                                model.company.Get({
                                    id: companyId
                                })
                                    .then(result => {
                                        var company = result[0];
                                        if (company) {
                                            var id = result[0]._id;
                                        }
                                        return model.taskCompany.AddCompanyId(companyId, id);
                                    });
                            }
                        })
                        .catch(error => {
                            reject(error);
                        });

                });
                var p = -1;
                var promisesCount = promises.length;
                var run = () => {
                    p++;
                    if (p < promisesCount) {
                        if (typeof (promises[p]) == 'function') {
                            promises[p]()
                                .then(() => {
                                    run();
                                })
                                .catch(() => {
                                    run();
                                });
                        }
                    } else {
                        resolve();

                    }
                };
                run();
            })
            .catch(error => {
                reject(error);
            });
    });
};
