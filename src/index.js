/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

// @INCLUDE_IN_API_DOCS

/**
 * A module that can transform raw analytics dump files.
 *
 * @module analyticsParser
 */

import util from 'util';
import child_process from 'child_process';
const exec = util.promisify(child_process.exec);
import * as fs from "fs";
import * as path from "path";

function silentlyDelete(filePath) {
    return new Promise((resolve)=>{
        fs.unlink(filePath, function(err){
            if(err) {
                console.log(err);
            }
            resolve();
        });
    });
}

function _validateSchemaVersion1(object) {
    // the array always ends with a special object {endTime}
    if(!object.endTime && object.schemaVersion !== 1){
        throw new Error("Only schema version 1 is supported, but received schema version " + object.schemaVersion);
    }
}

function _flattenValueCountsArray(valueCountArray, timeArray, startTimeUTC, otherFields) {
    // value count array is of form [0,1, {value1: count1, v2:23 ..}] . if just a number it just indicates a count
    let flattenedArray = [];
    for(let i=0; i<timeArray.length; i++) {
        const timeDriftInMs = timeArray[i] * 1000,
            currentTime = startTimeUTC + timeDriftInMs;
        let valueCount = valueCountArray[i];
        valueCount = valueCount === null ? 1 : valueCount;
        if(typeof valueCount === 'number') {
            flattenedArray.push({
                ...otherFields,
                timeUTC: currentTime,
                count: valueCount
            });
        } else if (typeof valueCount === 'object' && valueCount !== null ) { // typeof null is object in js :o
            let values = Object.keys(valueCount);
            for(let value of values){
                flattenedArray.push({
                    ...otherFields,
                    timeUTC: currentTime,
                    value,
                    count: valueCount[value]
                });
            }
        } else {
            throw new Error("Invalid valueCount entry: ", valueCount);
        }
    }
    return flattenedArray;
}

function _flattenEvents(events, startTimeUTC, otherFields) {
    let allEventsArray = [];
    if(!events){
        return allEventsArray;
    }
    let eventTypes = Object.keys(events);
    for(let type of eventTypes){
        let categories = Object.keys(events[type]);
        for(let category of categories){
            let subCategories = Object.keys(events[type][category]);
            for(let subCategory of subCategories) {
                const timeArray = events[type][category][subCategory].time,
                    valueCountsArray = events[type][category][subCategory].valueCount;
                const flattenedEvents = _flattenValueCountsArray(valueCountsArray, timeArray, startTimeUTC, {
                    ...otherFields, type, category, subCategory
                });
                allEventsArray = allEventsArray.concat(flattenedEvents);
            }
        }
    }
    return allEventsArray;
}

/**
 * Converts the given JSON analytics dump file int a processed JSON representation and returns it.
 * Will optionally write the json file to disk if targetFilePath is specified below. Note that the file name should be
 * exactly of the form `brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz` containing a single file
 * `brackets-prod.2022-11-30-9-13-17-656.v1.json`. If you want to parse arbitrary JSON, use the `parseJSON`
 * method instead.
 *
 * The processed JSON format is an array of sample item below:
 * '''js
 * {
 *     "category": "languageServerProtocol",
 *     "count": 1,
 *     "value": 1, // value is optional, if present, the count specified the number of times the value happened.
 *     "geoLocation": {
 *         "city": "Gurugram (Sector 44)",
 *         "continent": "Asia",
 *         "country": "India",
 *         "isInEuropeanUnion": false
 *     },
 *     "sessionID": "cmn92zuk0i",
 *     "subCategory": "codeHintsphp",
 *     "time": 1669799589768,
 *     "type": "usage",
 *     "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
 * }
 * '''
 * @example <caption>To parse the extracted json analytics dump file:</caption>
 *  // To extract the expanded analytics dump to a json file
 *  let expandedJSON = await parseGZIP('path/to/someText.json', "target/path/to/expanded.json");
 *  // if you do not want to expand to a json file and only want the parsed array, omit the second parameter.
 *  let expandedJSON = await parseGZIP('path/to/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz');
 *
 * @param {string} JSONFilePath
 * @param {string} [targetFilePath] Optional path, if specified will write to file as well.
 * @returns {Promise<Object>} Promised that resolves to an object representing analytics data as described above.
 * @type {function}
 */

export async function parseJSON(JSONFilePath, targetFilePath) {
    let json = JSON.parse(fs.readFileSync(JSONFilePath, {encoding: 'utf8', flag: 'r'}));
    let expandedEvents = [];
    _validateSchemaVersion1(json);
    for(let data of json.clientAnalytics){
        _validateSchemaVersion1(data);
        const uuid = data.uuid,
            sessionID = data.sessionID,
            geoLocation = data.geoLocation,
            startTimeUTC = data.unixTimestampUTC;
        let events = _flattenEvents(data.events, startTimeUTC, {
            uuid, sessionID, geoLocation
        });
        expandedEvents.push(...events);
    }
    if(targetFilePath){
        fs.writeFileSync(targetFilePath, JSON.stringify(expandedEvents));
    }
    return expandedEvents;
}

/**
 * Converts the given Gzip analytics dump file int a processed JSON representation and returns it.
 * Will optionally write the json file to disk if targetFilePath is specified below. Note that the file name should be
 * exactly of the form `brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz` containing a single file
 * `brackets-prod.2022-11-30-9-13-17-656.v1.json`. If you want to parse arbitrary JSON, use the `parseJSON`
 * method instead.
 *
 * The processed JSON format is an array of sample item below:
 * '''js
 * {
 *     "category": "languageServerProtocol",
 *     "count": 1,
 *     "value": 1, // value is optional, if present, the count specified the number of times the value happened.
 *     "geoLocation": {
 *         "city": "Gurugram (Sector 44)",
 *         "continent": "Asia",
 *         "country": "India",
 *         "isInEuropeanUnion": false
 *     },
 *     "sessionID": "cmn92zuk0i",
 *     "subCategory": "codeHintsphp",
 *     "time": 1669799589768,
 *     "type": "usage",
 *     "uuid": "208c5676-746f-4493-80ed-d919775a2f1d"
 * }
 * '''
 * @example <caption>To parse the GZipped analytics dump file:</caption>
 *  // To extract to a json file, give the gzip file path. Note that the file name should be
 *  // exactly of the form `brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz` containing a single file
 *  // `brackets-prod.2022-11-30-9-13-17-656.v1.json`. If you want to parse arbitrary JSON, use the `parseJSON`
 *  // method instead.
 *  let expandedJSON = await parseGZIP('path/to/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz',
 *     "target/path/to/expanded.json");
 *  // if you do not want to expand to a json file and only want the parsed array, omit the second parameter.
 *  let expandedJSON = await parseGZIP('path/to/brackets-prod.2022-11-30-9-13-17-656.v1.json.tar.gz');
 *
 * @param {string} gzipFilePath
 * @param {string} [targetFilePath] Optional path, if specified will write to file as well.
 * @returns {Promise<Object>} Promised that resolves to an object representing analytics data as described above.
 * @type {function}
 */
export async function parseGZIP(gzipFilePath, targetFilePath) {
    let jsonPath = gzipFilePath.replace(".tar.gz", "");
    try{
        await exec(`tar -xvf ${gzipFilePath} -C ${path.dirname(gzipFilePath)}`);
        let json = await parseJSON(jsonPath, targetFilePath);
        await silentlyDelete(jsonPath);
        return json;
    } catch (e) {
        // cleanup
        await silentlyDelete(jsonPath);
        throw e;
    }
}
