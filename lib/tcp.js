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

const client = require('./client');
const TelegrafClient = client.TelegrafClient;
const net = require('net');

class TelegrafTCPClient extends TelegrafClient {
    constructor(options) {
        options = options || {};
        super(options);
        this.host = options.host || '127.0.0.1';
        this.port = options.port || 8094;
        this.protocol = options.protocol || '4';
        this.delim = options.delim || '\n';
        this.socket = null;
    }

    connected() {
        let hasSocket = !!this.socket;
        let isOpenSocket = hasSocket && (!this.socket.destroyed);
        return hasSocket && isOpenSocket;
    }

    _connect(callback) {
        let sockOpts = {
            host: this.host,
            port: this.port
        };

        this.socket = net.createConnection(sockOpts);
        this.socket.on('connect', (res) => {
            this.logger.debug('TelegrafTCPClient connected');
            callback(null, res);
        });
        this.socket.on('error', (error) => {
            this.logger.debug('TelegrafTCPClient error ', error.toString());
            callback(error, null);
        });
        this.socket.on('close', (error) => {
            this.logger.debug('TelegrafTCPClient closed');
            this.socket = null;
        });
    }

    _send(data, callback) {
        this.socket.write(data, callback);
    }

    _close(callback) {
        this.socket.on('close', callback);
        this.socket.end();
    }
}

module.exports = {
    TelegrafTCPClient
};
