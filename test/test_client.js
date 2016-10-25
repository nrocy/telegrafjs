'use strict';

/*
* Copyright 2016 Chris Kirkos
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

const assert = require('assert');
const telegraf = require('telegrafjs');
const Measurement = telegraf.Measurement;
const Int = telegraf.Int;
const Float = telegraf.Float;
const TelegrafUDPClient = telegraf.TelegrafUDPClient;
const TelegrafTCPClient = telegraf.TelegrafTCPClient;

var counter = 0;
function makeTestMeasurement() {
    counter++;
    let integer_field = counter;
    let m1 = new Measurement(
        "metric-name",
        {tag1: "tagval1"},
        {
            integer_field: new Int(integer_field), float_field: new Float(10.1),
            boolean_field: true, string_field: "yoohoo"
        }
    );
    return m1;
}

function connectSendClose() {
    for(let client of [new TelegrafUDPClient(), new TelegrafTCPClient()]) {
        let m1 = makeTestMeasurement();
        client.connect()
        .then(() => {
            console.log("connected");
            return client.sendMeasurement(m1);
        })
        .then(res => {
            console.log("Success");
            return client.close();
        })
        .then(() => {
            console.log("Done");
        })
        .catch(err => {
            console.error(err);
            console.error(err.stack);
            assert(false, err);
        });
    }
}

function sendWithoutConnectingFirst() {
    let tcpclient = new TelegrafTCPClient();
    tcpclient.sendMeasurement(makeTestMeasurement())
    .then(() => {
        tcpclient.close();
    });

    let udpclient = new TelegrafUDPClient();
    udpclient.sendMeasurement(makeTestMeasurement())
    .then(() => {
        console.log("Sent");
        udpclient.close();
    });
}

connectSendClose();
sendWithoutConnectingFirst();
