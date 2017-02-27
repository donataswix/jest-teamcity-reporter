var pathSep = require('path').sep;

function teamcityReporter(result) {
    if (process.argv.filter(it => it === '--teamcity').length > 0 ||
        process.env.TEAMCITY_VERSION)
    {
        result.testResults.forEach(it => logTestSuite(it));
        // if (result.coverageMap) {
        //     logCoverage(result.coverageMap.getCoverageSummary());
        // }
    }
    return result;
}

function logCoverage(summary) {
    const data = summary && summary.data || {};
    const lines = data.lines;
    const branches = data.branches;
    const statements = data.statements;
    if (lines || branches || statements) {
        console.log("##teamcity[blockOpened name='Code Coverage Summary']");
        if (lines) {
            console.log("##teamcity[buildStatisticValue key='CodeCoverageL' value='" + lines.pct + "']");
        }
        if (statements) {
            console.log("##teamcity[buildStatisticValue key='CodeCoverageS' value='" + statements.pct + "']");
        }
        if (branches) {
            console.log("##teamcity[buildStatisticValue key='CodeCoverageB' value='" + branches.pct + "']");
        }
        console.log("##teamcity[blockClosed name='Code Coverage Summary']");
    }
    if (branches) {
        if (branches.pct >= 80) {
            console.log("##teamcity[buildStatus status='SUCCESS' text='👍 coverage']");
        }
        else if (branches.pct >= 70) {
            console.log("##teamcity[buildStatus status='SUCCESS' text='👌 coverage']");
        }
        else {
            console.log("##teamcity[buildStatus status='SUCCESS' text='👎 coverage']");
        }
    }
}

function logTestSuite(suite) {
    const split = suite.testFilePath.split(pathSep);
    const name = escape(split[split.length - 2] + '/' + split[split.length - 1]);

    console.log("##teamcity[testSuiteStarted name='%s']", name);

    suite.testResults.forEach(it => logTestResult(suite, it));

    console.log("##teamcity[testSuiteFinished name='%s']", name);
}

function logTestResult(suite, testResult) {
    if (testResult.status === 'pending') {
        logIgnoredTest(testResult);
    } else {
        logRunningTest(testResult);
    }
}

function logRunningTest(testResult) {
    const name = escape(testResult.fullName);
    const duration = testResult.duration | 0;
    console.log("##teamcity[testStarted name='%s']", name);
    if (testResult.status === 'failed') {
        const details = testResult.failureMessages.length > 0
              ? testResult.failureMessages[0]
            : 'No details available';
        console.log("##teamcity[testFailed name='%s' message='FAILED' details='%s']", name, escape(details));
    }
    console.log("##teamcity[testFinished name='%s' duration='%s']", name, duration);
}

function logIgnoredTest(testResult) {
    const name = escape(testResult.fullName);
    console.log("##teamcity[testIgnored name='%s']", name);
}


function escape(message) {
    if (message === null || message === undefined) {
        return '';
    }

    return message.toString()
        .replace(/\|/g, '||')
        .replace(/'/g, "|'")
        .replace(/\n/g, '|n')
        .replace(/\r/g, '|r')
        .replace(/\u0085/g, '|x')
        .replace(/\u2028/g, '|l')
        .replace(/\u2029/g, '|p')
        .replace(/\[/g, '|[')
        .replace(/]/g, '|]');
}

module.exports = teamcityReporter;
