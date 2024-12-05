"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoLagClient = void 0;
const constants_1 = require("../shared/constants");
const enum_1 = require("../shared/enum");
const ETransportCommand_1 = require("../shared/enum/ETransportCommand");
const TransportCommands_1 = require("../shared/utils/TransportCommands");
const transport_1 = require("../shared/utils/transport");
class NoLagClient {
    constructor(authToken, connectOptions) {
        var _a, _b, _c, _d;
        this.wsInstance = null;
        this.deviceConnectionId = undefined;
        this.deviceTokenId = null;
        //  check connection
        this.defaultCheckConnectionInterval = 100;
        this.defaultCheckConnectionTimeout = 10000;
        this.reConnect = false;
        // callback function used to return the connection result
        this.callbackOnOpen = () => { };
        this.callbackOnReceive = () => { };
        this.callbackOnClose = () => { };
        this.callbackOnError = () => { };
        // status of current socket connection
        this.connectionStatus = enum_1.EConnectionStatus.Idle;
        this.buffer = [];
        this.backpressureSendInterval = 0;
        this.senderInterval = 0;
        this.authToken = authToken !== null && authToken !== void 0 ? authToken : "";
        this.host = (_a = connectOptions === null || connectOptions === void 0 ? void 0 : connectOptions.host) !== null && _a !== void 0 ? _a : constants_1.CONSTANT.DefaultWsHost;
        this.protocol = (_b = connectOptions === null || connectOptions === void 0 ? void 0 : connectOptions.protocol) !== null && _b !== void 0 ? _b : constants_1.CONSTANT.DefaultWsProtocol;
        this.url = constants_1.CONSTANT.DefaultWsUrl;
        this.checkConnectionInterval =
            (_c = connectOptions === null || connectOptions === void 0 ? void 0 : connectOptions.checkConnectionInterval) !== null && _c !== void 0 ? _c : this.defaultCheckConnectionInterval;
        this.checkConnectionTimeout =
            (_d = connectOptions === null || connectOptions === void 0 ? void 0 : connectOptions.checkConnectionTimeout) !== null && _d !== void 0 ? _d : this.defaultCheckConnectionTimeout;
        this.startSender();
    }
    startSender() {
        this.senderInterval = setInterval(() => {
            // get the first message in the buffer
            const sendTransport = this.buffer.shift();
            if (!sendTransport)
                return;
            if (!this.wsInstance)
                return;
            // send the first message in the buffer
            this.wsInstance.send(sendTransport);
        }, this.backpressureSendInterval);
    }
    // to elevate the backpressure we increase the send interval
    slowDownSender(backpressureInterval) {
        clearInterval(this.senderInterval);
        this.backpressureSendInterval = backpressureInterval;
        this.startSender();
    }
    addToBuffer(buffer) {
        this.buffer.push(buffer);
    }
    setReConnect(reConnect) {
        if (reConnect)
            this.reConnect = reConnect;
    }
    // Check so see if we are in a browser or backend environment
    isBrowser() {
        let isNode = true;
        if (typeof process === "object") {
            if (typeof process.versions === "object") {
                if (typeof process.versions.node !== "undefined") {
                    isNode = false;
                }
            }
        }
        return isNode;
    }
    /**
     * Promise - Setup the connection process, code will detect if the code is being used in the front-end or backend
     * @param callbackMain used as a event trigger
     * @returns NoLagClient instance
     */
    connect() {
        this.connectionStatus = enum_1.EConnectionStatus.Idle;
        this.browserInstance();
        return new Promise((resolve, reject) => {
            const checkConnection = setInterval(() => {
                if (this.connectionStatus === enum_1.EConnectionStatus.Connected) {
                    resolve(this);
                    clearInterval(checkConnection);
                }
            }, this.checkConnectionInterval);
            setTimeout(() => {
                if (this.connectionStatus === enum_1.EConnectionStatus.Idle) {
                    reject(true);
                    clearInterval(checkConnection);
                }
            }, this.checkConnectionTimeout);
        });
    }
    disconnect() {
        if (this.wsInstance && this.wsInstance.close) {
            this.wsInstance.close();
            this.wsInstance = null;
        }
    }
    /**
     * Initiate browser WebSocket instance and set it to
     * wsInstance
     */
    browserInstance() {
        this.environment = enum_1.EEnvironment.Browser;
        // prevent the re-initiation of a socket connection when the
        // reconnect function calls this method again
        if (this.connectionStatus === enum_1.EConnectionStatus.Connected) {
            return;
        }
        this.wsInstance = null;
        // connect to server via ws
        this.wsInstance = new WebSocket(`${this.protocol}://${this.host}${this.url}`);
        this.wsInstance.binaryType = enum_1.EEncoding.Arraybuffer;
        // set of events
        // when a successful connection is made with he server
        this.wsInstance.onopen = (event) => {
            this._onOpen(event);
        };
        this.wsInstance.onclose = (event) => {
            this._onClose(event);
        };
        this.wsInstance.onerror = (event) => {
            this._onError(event);
        };
        this.wsInstance.onmessage = (event) => {
            this._onReceive(event);
        };
    }
    /**
     * Node WebSocket connection with package "ws"
     */
    nodeInstance() {
        // import("ws").then((loadedWebSocketNode) => {
        //   const WebSocketNode = loadedWebSocketNode.default;
        //
        //   this.environment = EEnvironment.Nodejs;
        //
        //   // prevent the re-initiation of a socket connection when the
        //   // reconnect function calls this method again
        //   if (this.connectionStatus === EConnectionStatus.Connected) {
        //     return;
        //   }
        //
        //   this.wsInstance = new WebSocketNode(
        //     `${this.protocol}://${this.host}${this.url}`,
        //   );
        //
        //   this.wsInstance.on("open", (event: any) => {
        //     this._onOpen(event);
        //   });
        //   this.wsInstance.on("message", (event: any) => {
        //     this._onReceive(event);
        //   });
        //   this.wsInstance.on("close", (event: any) => {
        //     this._onError(event);
        //   });
        // });
    }
    authenticate() {
        this.connectionStatus = enum_1.EConnectionStatus.Connecting;
        const { authToken } = this;
        const commands = (0, TransportCommands_1.transportCommands)().setCommand(ETransportCommand_1.ETransportCommand.Authenticate, authToken);
        if (this.reConnect) {
            commands.setCommand(ETransportCommand_1.ETransportCommand.Reconnect);
        }
        this.send(transport_1.NqlTransport.encode(commands));
    }
    onOpen(callback) {
        this.callbackOnOpen = callback;
    }
    onReceiveMessage(callback) {
        this.callbackOnReceive = callback;
    }
    onClose(callback) {
        this.callbackOnClose = callback;
    }
    onError(callback) {
        this.callbackOnError = callback;
    }
    _onOpen(event) {
        this.connectionStatus === enum_1.EConnectionStatus.Idle;
        this.callbackOnOpen(undefined, event);
    }
    async _onReceive(event) {
        let data = new ArrayBuffer(0);
        switch (this.environment) {
            case enum_1.EEnvironment.Browser:
                const arrayBuffer = await event.data;
                data = arrayBuffer;
                break;
            case enum_1.EEnvironment.Nodejs:
                data = event;
                break;
        }
        const decoded = transport_1.NqlTransport.decode(data);
        if (data.byteLength === 0) {
            return;
        }
        if (decoded.getCommand(ETransportCommand_1.ETransportCommand.InitConnection) &&
            this.connectionStatus === enum_1.EConnectionStatus.Idle) {
            this.authenticate();
            return;
        }
        if (decoded.getCommand(ETransportCommand_1.ETransportCommand.Acknowledge) &&
            this.connectionStatus === enum_1.EConnectionStatus.Connecting) {
            this.connectionStatus = enum_1.EConnectionStatus.Connected;
            this.deviceTokenId = decoded.getCommand(ETransportCommand_1.ETransportCommand.Acknowledge);
            return;
        }
        if (decoded.getCommand(ETransportCommand_1.ETransportCommand.Error)) {
            this.connectionStatus = enum_1.EConnectionStatus.Disconnected;
            this.callbackOnError(decoded.getCommand(ETransportCommand_1.ETransportCommand.Alert), undefined);
            return;
        }
        this.callbackOnReceive(undefined, {
            topicName: decoded.getCommand(ETransportCommand_1.ETransportCommand.Topic),
            presences: decoded.getCommand(ETransportCommand_1.ETransportCommand.Presence),
            identifiers: decoded.getCommand(ETransportCommand_1.ETransportCommand.Identifier),
            data: decoded.payload,
        });
    }
    _onClose(event) {
        this.connectionStatus = enum_1.EConnectionStatus.Disconnected;
        this.callbackOnClose(event, undefined);
    }
    _onError(event) {
        this.connectionStatus = enum_1.EConnectionStatus.Disconnected;
        this.callbackOnError(event, undefined);
    }
    send(transport) {
        this.addToBuffer(transport);
    }
    heartbeat() {
        if (this.wsInstance) {
            this.send(new ArrayBuffer(0));
        }
    }
}
exports.NoLagClient = NoLagClient;
//# sourceMappingURL=NoLagClient.js.map