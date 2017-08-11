# jest-tc-reporter

A fork of [jest-teamcity-reporter](https://github.com/winterbe/jest-teamcity-reporter).

## Usage

First, install the package from NPM: `npm install --save-dev jest-tc-reporter`

The reporter integrates with Jest in form of a [testResultsProcessor](https://facebook.github.io/jest/docs/configuration.html#testresultsprocessor-string). Put this into your projects `package.json`:

```
"jest": {
    "testResultsProcessor": "jest-tc-reporter"
}
```

Reporter will kick in if `TEAMCITY_VERSION` environment variable is not empty.

## License

MIT
© [Benjamin Winterberg](https://twitter.com/winterbe_)
© Donatas Petrauskas
