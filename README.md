# template-nodejs
A template project for nodejs. Has integrated linting, testing,
coverage, reporting, GitHub actions for publishing to npm repository, dependency updates and other goodies.

Easily use this template to quick start a production ready nodejs project template.

## Code Guardian
[![<app> build verification](https://github.com/aicore/analytics-parser/actions/workflows/build_verify.yml/badge.svg)](https://github.com/aicore/analytics-parser/actions/workflows/build_verify.yml)

<a href="https://sonarcloud.io/summary/new_code?id=aicore_analytics-parser&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed">
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=alert_status&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Sonar code quality check" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=security_rating&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Security rating" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=vulnerabilities&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="vulnerabilities" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=coverage&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Code Coverage" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=bugs&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Code Bugs" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=reliability_rating&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Reliability Rating" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=sqale_rating&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Maintainability Rating" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=ncloc&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Lines of Code" />
  <img src="https://sonarcloud.io/api/project_badges/measure?project=aicore_analytics-parser&metric=sqale_index&token=96d7cf61c987f81e0c2aa88021f6383f6f2db5ed" alt="Technical debt" />
</a>

## APIs

```js
// after npm install @aicore/analytics-parser
import {parseJSON, parseGZIP} from '@aicore/analytics-parser';
```

## parseJSON

Converts the given JSON analytics dump file int a processed JSON representation and returns it.
Will optionally write the json file to disk if targetFilePath is specified below.

#### The processed JSON format is an array of sample item below:

```js
[{
    "type": "usage",
    "category": "languageServerProtocol",
    "subCategory": "codeHintsphp",
    "count": 1,
    "value": 1, // value is optional, if present, the count specified the number of times the value happened.
    "geoLocation": {
        "city": "Gurugram (Sector 44)",
        "continent": "Asia",
        "country": "India",
        "isInEuropeanUnion": false
    },
    "sessionID": "cmn92zuk0i",
    "clientTimeUTC": 1669799589768, // this is the time as communicated by the client, but client clock may be wrong
    // server time is approximated time based on servers time. client time should be preferred, and
    // serverTimeUTC used to validate that the client is not wrong/lying about its time.
    "serverTimeUTC": 1669799580000,
    "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
}, ...]
```

Type: [function][1]

### Parameters

*   `JSONFilePath` **[string][2]**&#x20;
*   `targetFilePath` **[string][2]?** Optional path, if specified will write to file as well.

### Examples

To parse the extracted json analytics dump file:

```javascript
// To extract the expanded analytics dump to a json file
 let expandedJSON = await parseJSON('path/to/someText.json', "target/path/to/expanded.json");
 // if you do not want to expand to a json file and only want the parsed array, omit the second parameter.
 let expandedJSON = await parseJSON('path/to/someText.json');
```

Returns **[Promise][3]<[Object][4]>** Promised that resolves to an object representing analytics data as described above.

## parseGZIP

Converts the given Gzip analytics dump file int a processed JSON representation and returns it.
Will optionally write the json file to disk if targetFilePath is specified below. Note that the file name should be
exactly of the form `brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz` containing a single file
`brackets-prod.2022-11-30-9-13-17-656.v1.json`. If you want to parse arbitrary JSON, use the `parseJSON`
method instead.

#### The processed JSON format is an array of sample item below:

```js
[{
    "type": "usage",
    "category": "languageServerProtocol",
    "subCategory": "codeHintsphp",
    "count": 1,
    "value": 1, // value is optional, if present, the count specified the number of times the value happened.
    "geoLocation": {
        "city": "Gurugram (Sector 44)",
        "continent": "Asia",
        "country": "India",
        "isInEuropeanUnion": false
    },
    "sessionID": "cmn92zuk0i",
    "clientTimeUTC": 1669799589768, // this is the time as communicated by the client, but client clock may be wrong
    // server time is approximated time based on servers time. client time should be preferred, and
    // serverTimeUTC used to validate that the client is not wrong/lying about its time.
    "serverTimeUTC": 1669799580000,
    "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
},...]
```

Type: [function][1]

### Parameters

*   `gzipFilePath` **[string][2]**&#x20;
*   `targetFilePath` **[string][2]?** Optional path, if specified will write to file as well.

### Examples

To parse the GZipped analytics dump file:

```javascript
// To extract to a json file, give the gzip file path. Note that the file name should be
 // exactly of the form `brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz` containing a single file
 // `brackets-prod.2022-11-30-9-13-17-656.v1.json`. If you want to parse arbitrary JSON, use the `parseJSON`
 // method instead.
 let expandedJSON = await parseGZIP('path/to/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz',
    "target/path/to/expanded.json");
 // if you do not want to expand to a json file and only want the parsed array, omit the second parameter.
 let expandedJSON = await parseGZIP('path/to/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz');
```

Returns **[Promise][3]<[Object][4]>** Promised that resolves to an object representing analytics data as described above.

# Commands available

## Building
Since this is a pure JS template project, build command just runs test with coverage.
```shell
> npm install   // do this only once.
> npm run build
```

## Linting
To lint the files in the project, run the following command:
```shell
> npm run lint
```
To Automatically fix lint errors:
```shell
> npm run lint:fix
```

## Testing
To run all tests:
```shell
> npm run test
  Hello world Tests
    ✔ should return Hello World
    #indexOf()
      ✔ should return -1 when the value is not present
```

Additionally, to run unit/integration tests only, use the commands:
```shell
> npm run test:unit
> npm run test:integ
```

## Coverage Reports
To run all tests with coverage:

```shell
> npm run cover
  Hello world Tests
    ✔ should return Hello World
    #indexOf()
      ✔ should return -1 when the value is not present


  2 passing (6ms)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 index.js |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 5/5 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 5/5 )
================================================================================
Detailed unit test coverage report: file:///template-nodejs/coverage-unit/index.html
Detailed integration test coverage report: file:///template-nodejs/coverage-integration/index.html
```
After running coverage, detailed reports can be found in the coverage folder listed in the output of coverage command.
Open the file in browser to view detailed reports.

To run unit/integration tests only with coverage
```shell
> npm run cover:unit
> npm run cover:integ
```

Sample coverage report:
![image](https://user-images.githubusercontent.com/5336369/148687351-6d6c12a2-a232-433d-ab62-2cf5d39c96bd.png)

### Unit and Integration coverage configs
Unit and integration test coverage settings can be updated by configs `.nycrc.unit.json` and `.nycrc.integration.json`.

See https://github.com/istanbuljs/nyc for config options.

# Publishing packages to NPM

  ## Preparing for release
  Please run `npm run release` on the `main` branch and push the changes to main. The release command will bump the npm version.
  
  !NB: NPM publish will faill if there is another release with the same version.
  ## Publishing
To publish a package to npm, push contents to `npm` branch in 
this repository. 

## Publishing `@aicore/package*`
If you are looking to publish to package owned by core.ai, you will need access to the GitHub Organization secret `NPM_TOKEN`.

For repos managed by [aicore](https://github.com/aicore) org in GitHub, Please contact your Admin to get access to core.ai's NPM tokens.


## Publishing to your own npm account
Alternatively, if you want to publish the package to your own npm account, please follow these docs:
1. Create an automation access token by following this [link](https://docs.npmjs.com/creating-and-viewing-access-tokens).
2. Add NPM_TOKEN to your repository secret by following this [link](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow)

To edit the publishing workflow, please see file: `.github/workflows/npm-publish.yml`


# Dependency updates
  We use Rennovate for dependency updates: https://blog.logrocket.com/renovate-dependency-updates-on-steroids/
  * By default, dep updates happen on sunday every week.
  * The status of dependency updates can be viewed here if you have this repo permissions in github: https://app.renovatebot.com/dashboard#github/aicore/template-nodejs
  * To edit rennovate options, edit the rennovate.json file in root, see https://docs.renovatebot.com/configuration-options/
  Refer 
  
# Code Guardian
Several automated workflows that check code integrity are integrated into this template.
These include:
1. GitHub actions that runs build/test/coverage flows when a contributor raises a pull request
2. [Sonar cloud](https://sonarcloud.io/) integration using `.sonarcloud.properties`
   1. In sonar cloud, enable Automatic analysis from `Administration
      Analysis Method` for the first time ![image](https://user-images.githubusercontent.com/5336369/148695840-65585d04-5e59-450b-8794-54ca3c62b9fe.png)

## IDE setup
SonarLint is currently available as a free plugin for jetbrains, eclipse, vscode and visual studio IDEs.
Use sonarLint plugin for webstorm or any of the available
IDEs from this link before raising a pull request: https://www.sonarlint.org/ .

SonarLint static code analysis checker is not yet available as a Brackets
extension.

## Internals
### Testing framework: Mocha , assertion style: chai
 See https://mochajs.org/#getting-started on how to write tests
 Use chai for BDD style assertions (expect, should etc..). See move here: https://www.chaijs.com/guide/styles/#expect

### Mocks and spies:

 Since it is not that straight forward to mock es6 module imports, use the follow pull request as reference to mock
imported libs:
 

* sample pull request: https://github.com/aicore/libcache/pull/6/files
* [setting up mocks](https://github.com/aicore/libcache/blob/485b1b6244f7022eb0a83d9f72d897fe712badbe/test/unit/setup-mocks.js)
* [using the mocks](https://github.com/aicore/libcache/pull/6/files#diff-8ea7ccf28b28a0ae7b43e468abd3e9a8bb411bb329ad5cb45eb9a93709ed8dc5R2)
ensure to import `setup-mocks.js` as the first import of all files in tests.

#### using sinon lib if the above method doesn't fit your case
if you want to mock/spy on fn() for unit tests, use sinon. refer docs: https://sinonjs.org/

### Note on coverage suite used here:
we use c8 for coverage https://github.com/bcoe/c8. Its reporting is based on nyc, so detailed docs can be found
 here: https://github.com/istanbuljs/nyc ; We didn't use nyc as it do not yet have ES module support
 see: https://github.com/digitalbazaar/bedrock-test/issues/16 . c8 is drop replacement for nyc coverage reporting tool
