const pathSep = require('path').sep;

module.exports = function tcReporter(log, result = {}) {
    if (result.testResults) {
        result.testResults.forEach(it => logTestSuite(it));
    }

    if (result.coverageMap) {
        logCoverage(result.coverageMap.getCoverageSummary());
    }

    function logTestSuite(suite) {
        const split = suite.testFilePath.split(pathSep);
        const name = escape(split[split.length - 2] + '/' + split[split.length - 1]);

        log(`##teamcity[testSuiteStarted name='${name}']`);

        suite.testResults.forEach(it => logTestResult(it));

        log(`##teamcity[testSuiteFinished name='${name}']`);
    }

    function logTestResult(testResult) {
        const name = escape(testResult.fullName);

        switch (testResult.status) {
          case 'pending':
              log(`##teamcity[testIgnored name='${name}']`);
              break;
          default: {
              const duration = testResult.duration | 0;
              log(`##teamcity[testStarted name='${name}']`);
              if (testResult.status === 'failed') {
                  const details = testResult.failureMessages.length > 0
                        ? testResult.failureMessages.join('\n')
                      : 'No details available';
                  log(`##teamcity[testFailed name='${name}' message='FAILED' details='${escape(details)}']`);
              }
              log(`##teamcity[testFinished name='${name}' duration='${duration}']`);
              break;
          }
        }
    }

    function logCoverage(summary) {
        const data = summary && summary.data || {};
        const lines = data.lines;
        const branches = data.branches;
        const statements = data.statements;
        if (lines || branches || statements) {
            log("##teamcity[blockOpened name='Code Coverage Summary']");
            if (lines) {
                log("##teamcity[buildStatisticValue key='CodeCoverageL' value='" + lines.pct + "']");
                log("##teamcity[buildStatisticValue key='CodeCoverageAbsLCovered' value='" + lines.covered + "']");
                log("##teamcity[buildStatisticValue key='CodeCoverageAbsLTotal' value='" + lines.total + "']");
            }
            if (statements) {
                log("##teamcity[buildStatisticValue key='CodeCoverageS' value='" + statements.pct + "']");
                log("##teamcity[buildStatisticValue key='CodeCoverageAbsSCovered' value='" + statements.covered + "']");
                log("##teamcity[buildStatisticValue key='CodeCoverageAbsSTotal' value='" + statements.total + "']");
            }
            if (branches) {
                log("##teamcity[buildStatisticValue key='CodeCoverageR' value='" + branches.pct + "']");
                log("##teamcity[buildStatisticValue key='CodeCoverageAbsRCovered' value='" + branches.covered + "']");
                log("##teamcity[buildStatisticValue key='CodeCoverageAbsRTotal' value='" + branches.total + "']");
            }
            log("##teamcity[blockClosed name='Code Coverage Summary']");
        }
    }
};

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
