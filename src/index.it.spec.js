const shell = require('shelljs');

describe('Jest TeamCity Reporter', () => {
    it('should not report anything if environment variable is not provided', () => {
        expect(getTestsOutput()).toBe('');
    });

    it('should report suite in a team city format', () => {
        const [
            suiteStart,
            test1Ignored,
            test2Started,
            test2Finished,
            test3Started,
            test3Failed,
            test3Finished,
            suiteFinished
        ] = getTestsOutput('10.1').split('\n');

        expect(suiteStart).toEqual(`##teamcity[testSuiteStarted name='src/example.spec.js']`);
        expect(test1Ignored).toEqual(`##teamcity[testIgnored name='Suite A ignored test']`);
        expect(test2Started).toEqual(`##teamcity[testStarted name='Suite A passing test']`);
        expect(test2Finished).toMatch(/^##teamcity\[testFinished name='Suite A passing test' duration='\d+'\]/);
        expect(test3Started).toEqual(`##teamcity[testStarted name='Suite B failing test']`);
        expect(test3Failed).toMatch(/^##teamcity\[testFailed name='Suite B failing test' message='FAILED' details=/);
        expect(test3Finished).toMatch(/^##teamcity\[testFinished name='Suite B failing test' duration='\d+'\]/);
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
