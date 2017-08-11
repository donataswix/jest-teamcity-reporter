const shell = require('shelljs');

describe('Jest TeamCity Reporter', () => {
    it('should not report anything if environment variable is not provided', () => {
        expect(getTestsOutput()).toBe('');
    });

    it('should report suite in a team city format', () => {
        const [
            suiteStart,
            testStarted,
            testFinished,
            suiteFinished
        ] = getTestsOutput('10.1').split('\n');

        expect(suiteStart).toEqual(`##teamcity[testSuiteStarted name='src/example.spec.js']`);
        expect(testStarted).toEqual(`##teamcity[testStarted name='Suite A passing test']`);
        expect(testFinished).toMatch(/^##teamcity\[testFinished name='Suite A passing test' duration='\d+'\]/);
        expect(suiteFinished).toEqual(`##teamcity[testSuiteFinished name='src/example.spec.js']`);
    });

    function getTestsOutput(teamcityVersion) {
        const env = teamcityVersion ? `TEAMCITY_VERSION=${teamcityVersion} ` : '';
        const {stdout} = shell.exec(
            env + './node_modules/.bin/jest -i --testResultsProcessor ./src/index.js src/example.spec.js',
            {silent: true}
        );
        return stdout;
    }
});
