# analyticsParser
A module that can transform raw analytics dump files.

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

## Getting Started
### Install this library
```bash
npm install @aicore/analytics-parser
```
### Import the library
```js
import {parseGZIP} from '@aicore/analytics-parser';
```
### Get the analytics dumps
The analytics logs will be structured in the storage bucket as follows:
1. Each analytics app will have a root folder under which the analytics data is collected. (Eg. `brackets-prod`).
2. Within each app folder, the raw analytics dump files can be located easily with the date.
   Eg. `brackets-prod/2022/10/11/*` will have all analytics data for that day.
3. Download the analytics gzip files for the dates that you desire. https://cyberduck.io/ is a good utility
   for this in windows and mac.

### Extract the Gzip files
```bash
# unzip all files recursively. will create *.json like file names
find . -name "*.tar.gz" -exec sh -c 'tar xf {} -C $(dirname {})' \;
```

You will now see a lot of json files in the downloaded folder.

### Parse the extracted JSON file
To parse the extracted JSON file using the `parseExtractedFile` API:

```javascript
// Give the gzip input file path. Note that the file name should be
// exactly of the form `brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz` containing a single file
// `brackets-prod.2022-11-30-9-13-17-656.v1.json`.
let expandedJSON = await parseExtractedFile('path/to/brackets-prod.2022-11-30-9-13-17-656.v1.json');
```

#### Understanding return data type of `parseExtractedFile` API
The returned `expandedJSON` object is an array of event point objects as below.
Each event point object has the following fields:

1. (`type`, `category`, `subCategory`): These three strings identifies the **event** and are guaranteed to be present.
Eg. `(type: platform, category: startup, subCategory: time)`,
`(type: platform, category: language, subCategory: en-us)`, `(type: UI, category: click, subCategory: closeBtn)`
2. `uuid`: Unique user ID that persists across sessions.
3. `sessionID`: A session ID that gets reset on every session. For Eg. Browser Tab close resets `sessionID`.
4. `clientTimeUTC`: A unix timestamp signalling the exact time(accurate to 3 seconds) at which the said event occurred
according to the clients clock. This is the preferred time to use for the event. Note that the client clock may be wrong
or misleading as this is client specified data. So cross-reference it to be within 30 minutes of `serverTimeUTC`.
5. `serverTimeUTC`: A unix timestamp signalling the exact time(accurate to within 10 minutes) at which the said event
occurred according to the servers clock. Use this only to cross-reference with `clientTimeUTC`.
6. `count`: The number of times the **event** occurred in the time. Guaranteed to be present.
7. `value`: Value is an optional string usually representing a number. if present, the `count` specified the number
of times the `value` happened. This is only present in certain events that tracks values.
Eg. If we are tracking `JS file open` latencies, `(value: 250, count 2)` means that we got 2 `JS file open` events
each with latency of 250 units. 
8. `geoLocation`: Of the user raising the event.

```js
[{
    "type": "usage",
    "category": "languageServerProtocol",
    "subCategory": "codeHintsphp",
    "count": 1,
    "value": "250", // value is optional, if present, the count specified the number of times the value happened.
    "geoLocation": {
        "city": "Gurugram (Sector 44)",
        "continent": "Asia",
        "country": "India",
        "isInEuropeanUnion": false
    },
    "sessionID": "cmn92zuk0i",
    "clientTimeUTC": 1669799589768,
    "serverTimeUTC": 1669799580000,
    "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
},...]
```


## The Analytics Zip file
The analytics zip file name is of the format `brackets-prod.YYYY-MM-DD-H-M-S-ms.v1.json.tar.gz`. It has a single JSON
file when extracted with name of form `brackets-prod.YYYY-MM-DD-H-M-S-ms.v1.json`(referred here on as extracted JSON).
The first part of the name contains the app name(Eg. `brackets-prod`) for which the dump corresponds to and the
second part is the timestamp(accurate to milliseconds) at which the dump was collected at the server.

To learn more about the raw extracted JSON format, see this [wiki](https://github.com/aicore/Core-Analytics-Server/blob/main/docs/architecture.md#client-schema).
But knowing the raw format is not necessary for this library. The purpose of this library is to convert this raw JSON to
a much more human-readable JSON format via the `parseGZIP` API outlined below.

### Parse the Analytics gzip dump file without extracting

If there are large number of files and you cannot extract the whole
zipped folder due to space constraints, you can use this API to parse the GZipped analytics dump as is using the `parseGZIP` API.

This is a tradeoff between speed and size required as the parseGZip API doesnt need the full contents to be extracted saving space.

```javascript
// Give the gzip input file path. Note that the file name should be
// exactly of the form `brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz` containing a single file
// `brackets-prod.2022-11-30-9-13-17-656.v1.json`.
let expandedJSON = await parseGZIP('path/to/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz');
```

## Detailed API docs
[See this link for detailed API docs.](https://github.com/aicore/analytics-parser/blob/main/docs/generatedApiDocs/index-API.md)

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
