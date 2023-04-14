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

import {parseGZIP} from "../../src/index.js";
import * as assert from 'assert';
import * as chai from 'chai';

let expect = chai.expect;

describe('unit Tests', function() {
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
            "time": 1669799589768,
            "type": "usage",
            "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
        });
    });
    // with target test
    // csv test
    // error test
});
