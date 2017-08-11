const reporter = require('./reporter');

describe('Report', () => {
    const report = results => {
        const log = [];
        reporter(text => log.push(text), results);
        return log;
    };

    describe('Test Cases', () => {
        it('should log nothing if there are no results', () => {
            expect(report()).toEqual([]);
            expect(report(buildResult().get())).toEqual([]);
        });

        it('should log suite start and finish indicators', () => {
            const testFilePath = '/User/xxx/Projects/jest-tc-reporter/src/example.spec.js';
            const suite = buildSuite().withTestFilePath(testFilePath).get();
            const result = buildResult().withSuites([suite]).get();

            expect(
                report(result)
            ).toEqual([
                "##teamcity[testSuiteStarted name='src/example.spec.js']",
                "##teamcity[testSuiteFinished name='src/example.spec.js']",
            ]);
        });

        it('should log successful test', () => {
            const test = buildTestResult().withFullName('test A').isPassed().hasTakenTime(5).get();
            const suite = buildSuite().withResults([test]).get();
            const result = buildResult().withSuites([suite]).get();

            expect(
                report(result).slice(1, 3)
            ).toEqual([
                "##teamcity[testStarted name='test A']",
                "##teamcity[testFinished name='test A' duration='5']"
            ]);
        });

        it('should log skipped test', () => {
            const test = buildTestResult().withFullName('test B').isSkipped().get();
            const suite = buildSuite().withResults([test]).get();
            const result = buildResult().withSuites([suite]).get();

            expect(
                report(result).slice(1, 2)
            ).toEqual([
                "##teamcity[testIgnored name='test B']",
            ]);
        });

        it('should log failed test', () => {
            const test = buildTestResult().withFullName('test C')
                .isFailed(['Exception', 'Something went wrong'])
                .hasTakenTime(3)
                .get();
            const suite = buildSuite().withResults([test]).get();
            const result = buildResult().withSuites([suite]).get();

            expect(
                report(result).slice(1, 4)
            ).toEqual([
                "##teamcity[testStarted name='test C']",
                "##teamcity[testFailed name='test C' message='FAILED' details='Exception|nSomething went wrong']",
                "##teamcity[testFinished name='test C' duration='3']"
            ]);
        });
    });

    describe('Coverage', () => {
        it('should not log coverage if not available', () => {
            expect(report(buildResult().get())).toEqual([]);
        });

        it('should print coverage summary block wrappers', () => {
            const log = report(buildResult().withCoverage({lines: buildCoverage(1, 1)}).get());
            expect(log[0]).toEqual("##teamcity[blockOpened name='Code Coverage Summary']");
            expect(log[log.length - 1]).toEqual("##teamcity[blockClosed name='Code Coverage Summary']");
        });

        it('should report line coverage', () => {
            expect(
                report(
                    buildResult().withCoverage({lines: buildCoverage(100, 50)}).get()
                ).slice(1, 4)
            ).toEqual([
                "##teamcity[buildStatisticValue key='CodeCoverageL' value='" + 50 + "']",
                "##teamcity[buildStatisticValue key='CodeCoverageAbsLCovered' value='" + 50 + "']",
                "##teamcity[buildStatisticValue key='CodeCoverageAbsLTotal' value='" + 100 + "']"
            ]);
        });

        it('should report statment coverage', () => {
            expect(
                report(
                    buildResult().withCoverage({statements: buildCoverage(60, 15)}).get()
                ).slice(1, 4)
            ).toEqual([
                "##teamcity[buildStatisticValue key='CodeCoverageS' value='" + 25 + "']",
                "##teamcity[buildStatisticValue key='CodeCoverageAbsSCovered' value='" + 15 + "']",
                "##teamcity[buildStatisticValue key='CodeCoverageAbsSTotal' value='" + 60 + "']"
            ]);
        });

        it('should report branch coverage', () => {
            expect(
                report(
                    buildResult().withCoverage({branches: buildCoverage(10, 2)}).get()
                ).slice(1, 4)
            ).toEqual([
                "##teamcity[buildStatisticValue key='CodeCoverageR' value='" + 20 + "']",
                "##teamcity[buildStatisticValue key='CodeCoverageAbsRCovered' value='" + 2 + "']",
                "##teamcity[buildStatisticValue key='CodeCoverageAbsRTotal' value='" + 10 + "']"
            ]);
        });
    });
});

function buildCoverage(total, covered) {
    return {
        total,
        covered,
        pct: Math.round((covered / total) * 100)
    };
}

function buildResult() {
    const result = {
        testResults: []
    };

    return {
        withSuites(testResults) {
            result.testResults = testResults;
            return this;
        },
        withCoverage(coverage) {
            result.coverageMap = {
                getCoverageSummary() {
                    return {data: coverage};
                }
            };
            return this;
        },
        get() {
            return result;
        }
    };
}

function buildSuite() {
    const testResult = {
        testFilePath: '',
        testResults: []
    };

    return {
        withTestFilePath(filePath) {
            testResult.testFilePath = filePath;
            return this;
        },
        withResults(testResults) {
            testResult.testResults = testResults;
            return this;
        },
        get() {
            return testResult;
        }
    };
}

function buildTestResult() {
    const result = {
        failureMessages: []
    };

    return {
        withFullName(name) {
            result.fullName = name;
            return this;
        },
        hasTakenTime(ms) {
            result.duration = ms;
            return this;
        },
        isSkipped() {
            result.status = 'pending';
            return this;
        },
        isPassed() {
            result.status = 'passed';
            return this;
        },
        isFailed(messages) {
            result.failureMessages = messages;
            result.status = 'failed';
            return this;
        },
        get() {
            return result;
        }
    };
}
