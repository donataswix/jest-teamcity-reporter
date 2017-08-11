var report = require('./reporter');

module.exports = function teamcityReporter(result) {
    if (process.env.TEAMCITY_VERSION) {
        report(console.log.bind(console), result);
    }
    return result;
}
