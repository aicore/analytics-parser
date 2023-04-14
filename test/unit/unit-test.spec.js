// Testing framework: Mocha , assertion style: chai
// See https://mochajs.org/#getting-started on how to write tests
// Use chai for BDD style assertions (expect, should etc..). See move here: https://www.chaijs.com/guide/styles/#expect

// Mocks and spies: sinon
// if you want to mock/spy on fn() for unit tests, use sinon. refer docs: https://sinonjs.org/

// Note on coverage suite used here:
// we use c8 for coverage https://github.com/bcoe/c8. Its reporting is based on nyc, so detailed docs can be found
// here: https://github.com/istanbuljs/nyc ; We didn't use nyc as it do not yet have ES module support
// see: https://github.com/digitalbazaar/bedrock-test/issues/16 . c8 is drop replacement for nyc coverage reporting tool
/*global describe, it*/

import {parseGZIP, parseJSON} from "../../src/index.js";
import * as assert from 'assert';
import * as chai from 'chai';
import fs from "fs";

let expect = chai.expect;

describe('unit Tests', function() {
    function cleanup(filePath) {
        return new Promise((resolve)=>{
            fs.unlink(filePath, function(err){
                if(err) {
                    console.log(err);
                }
                resolve();
            });
        });
    }

    it('should process gzip file', async function() {
        let expanded = await parseGZIP('test/unit/data/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz');
        expect(expanded.length).to.equal(5747);
        expect(expanded[0]).to.eql({
            "category": "languageServerProtocol",
            "count": 1,
            "geoLocation": {
                "city": "Gurugram (Sector 44)",
                "continent": "Asia",
                "country": "India",
                "isInEuropeanUnion": false
            },
            "sessionID": "cmn92zuk0i",
            "subCategory": "codeHintsphp",
            "timeUTC": 1669799589768,
            "type": "usage",
            "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
        });
    });

    it('should process gzip file and create json target file', async function() {
        let targetFile = 'test/unit/data/test.json';
        await parseGZIP('test/unit/data/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz', targetFile);
        let expanded = JSON.parse(fs.readFileSync(targetFile, {encoding: 'utf8', flag: 'r'}));
        expect(expanded.length).to.equal(5747);
        expect(expanded[0]).to.eql({
            "category": "languageServerProtocol",
            "count": 1,
            "geoLocation": {
                "city": "Gurugram (Sector 44)",
                "continent": "Asia",
                "country": "India",
                "isInEuropeanUnion": false
            },
            "sessionID": "cmn92zuk0i",
            "subCategory": "codeHintsphp",
            "timeUTC": 1669799589768,
            "type": "usage",
            "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
        });
        await cleanup(targetFile);
    });

    it('should process JSON file', async function() {
        let srcFile = 'test/unit/data/sample.v1.json';
        let expanded = await parseJSON(srcFile);
        expect(expanded.length).to.equal(5747);
        expect(expanded[0]).to.eql({
            "category": "languageServerProtocol",
            "count": 1,
            "geoLocation": {
                "city": "Gurugram (Sector 44)",
                "continent": "Asia",
                "country": "India",
                "isInEuropeanUnion": false
            },
            "sessionID": "cmn92zuk0i",
            "subCategory": "codeHintsphp",
            "timeUTC": 1669799589768,
            "type": "usage",
            "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
        });
    });

    it('should schema version2 error out', async function() {
        let srcFile = 'test/unit/data/sample.v2.json';
        let err;
        try{
            await parseJSON(srcFile);
        } catch (e) {
            err = e;
        }
        expect(err.message).to.equal("Only schema version 1 is supported, but received schema version 2");
    });

    it('should throw on invalid json', async function() {
        let srcFile = 'test/unit/data/invalid.test.json';
        let err;
        try{
            await parseJSON(srcFile);
        } catch (e) {
            err = e;
        }
        expect(err.message).to.exist;
    });

    it('should throw on invalid json GZIp', async function() {
        let srcFile = 'test/unit/data/invalid.json.tar.gz';
        let err;
        try{
            await parseGZIP(srcFile);
        } catch (e) {
            err = e;
        }
        expect(err.message).to.exist;
    });

    // csv test
    // error test
});
