"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = exports.Tunnel = void 0;
const Topic_1 = require("../shared/models/Topic");
const enum_1 = require("../shared/enum");
const ETransportCommand_1 = require("../shared/enum/ETransportCommand");
const TransportCommands_1 = require("../shared/utils/TransportCommands");
const transport_1 = require("../shared/utils/transport");
const NoLagClient_1 = require("./NoLagClient");
/**
 * To get access NoLag message broker you need access to a Tunnel
 * This class initiates a Tunnel connection and gives you the ability to subscribe to a
 * Topic instance and publish to a topic
 */
class Tunnel {
    constructor(authToken, options, connectOptions) {
        var _a;
        // topics
        this.topics = {};
        this.defaultCheckConnectionInterval = 10000;
        this.heartBeatInterval = 20000;
        this.visibilityState = enum_1.EVisibilityState.Visible;
        this.callbackOnDisconnect = () => { };
        this.callbackOnReconnect = () => { };
        this.callbackOnReceivedError = () => { };
        this.checkConnectionInterval =
            (_a = connectOptions === null || connectOptions === void 0 ? void 0 : connectOptions.checkConnectionInterval) !== null && _a !== void 0 ? _a : this.defaultCheckConnectionInterval;
        this.connectOptions = connectOptions !== null && connectOptions !== void 0 ? connectOptions : undefined;
        this.authToken = authToken;
        // initiate NoLag client connection
        this.noLagClient = new NoLagClient_1.NoLagClient(this.authToken, this.connectOptions);
        this.onClose();
        this.onError();
        this.onReceiveMessage();
        // disconnect from NoLag when you move away from the screen
        if (options === null || options === void 0 ? void 0 : options.disconnectOnNoVisibility) {
            this.onVisibilityChange();
        }
    }
    get deviceTokenId() {
        var _a;
        return (_a = this.noLagClient) === null || _a === void 0 ? void 0 : _a.deviceTokenId;
    }
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.noLagClient) {
                this.noLagClient.heartbeat();
            }
        }, this.heartBeatInterval);
    }
    stopHeartbeat() {
        clearInterval(this.heartbeatTimer);
    }
    // connect to NoLag with Tunnel credentials
    async initiate(reconnect) {
        if (this.noLagClient) {
            this.noLagClient.setReConnect(reconnect);
            await this.noLagClient.connect();
            this.startHeartbeat();
        }
        return this;
    }
    onVisibilityChange() {
        if (document.addEventListener) {
            document.addEventListener("visibilitychange", async () => {
                var _a;
                this.visibilityState = document.visibilityState;
                switch (this.visibilityState) {
                    case enum_1.EVisibilityState.Hidden:
                        (_a = this.noLagClient) === null || _a === void 0 ? void 0 : _a.disconnect();
                        this.stopHeartbeat();
                        break;
                    case enum_1.EVisibilityState.Visible:
                        await this.initiate(true);
                        break;
                }
            });
        }
    }
    onReceiveMessage() {
        var _a;
        if (this.noLagClient) {
            (_a = this.noLagClient) === null || _a === void 0 ? void 0 : _a.onReceiveMessage((err, data) => {
                var _a;
                const { topicName, identifiers } = data;
                if (this.noLagClient && !this.topics[topicName]) {
                    this.topics[topicName] = new Topic_1.Topic(this.noLagClient, topicName, {
                        OR: identifiers,
                    });
                }
                if (topicName && this.topics[topicName]) {
                    (_a = this.topics[topicName]) === null || _a === void 0 ? void 0 : _a._onReceiveMessage(data);
                }
                if (typeof this.callbackOnReceive === "function") {
                    this.callbackOnReceive(data);
                }
            });
        }
    }
    reconnect() {
        this.stopHeartbeat();
        setTimeout(async () => {
            // this.reconnectAttempts++;
            await this.initiate(true);
            if (typeof this.callbackOnReconnect === "function") {
                this.callbackOnReconnect();
            }
        }, this.checkConnectionInterval);
    }
    canReconnect() {
        return this.visibilityState !== enum_1.EVisibilityState.Hidden;
    }
    doReconnect() {
        if (this.canReconnect()) {
            this.reconnect();
        }
        else {
            this.stopHeartbeat();
            if (typeof this.callbackOnDisconnect === "function") {
                this.callbackOnDisconnect("connection retry timeout.");
            }
        }
    }
    onClose() {
        if (this.noLagClient) {
            this.noLagClient.onClose((err, data) => {
                this.doReconnect();
                if (typeof this.callbackOnReceivedError === "function") {
                    this.callbackOnReceivedError(err);
                }
            });
        }
    }
    onError() {
        if (this.noLagClient) {
            this.noLagClient.onError((err, data) => {
                if (typeof this.callbackOnReceivedError === "function") {
                    this.callbackOnReceivedError(err);
                }
            });
        }
    }
    onReceive(callback) {
        this.callbackOnReceive = callback;
    }
    disconnect() {
        var _a;
        this.visibilityState = enum_1.EVisibilityState.Hidden;
        (_a = this.noLagClient) === null || _a === void 0 ? void 0 : _a.disconnect();
    }
    onDisconnect(callback) {
        this.callbackOnDisconnect = callback;
    }
    onReconnect(callback) {
        this.callbackOnReconnect = callback;
    }
    onErrors(callback) {
        this.callbackOnReceivedError = callback;
    }
    getTopic(topicName) {
        // if you are trying to get the specific topic but its not been set
        // set it now
        if (!this.topics[topicName] && this.noLagClient) {
            this.topics[topicName] = new Topic_1.Topic(this.noLagClient, topicName, {});
        }
        return this.topics[topicName];
    }
    unsubscribe(topicName) {
        var _a;
        if (this.topics[topicName]) {
            (_a = this.topics[topicName]) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            delete this.topics[topicName];
            return true;
        }
        return false;
    }
    subscribe(topicName, identifiers = {}) {
        if (this.noLagClient) {
            if (this.topics[topicName]) {
                return this.topics[topicName];
            }
            else {
                this.topics[topicName] = new Topic_1.Topic(this.noLagClient, topicName, identifiers);
                return this.topics[topicName];
            }
        }
    }
    publish(topicName, data, identifiers = []) {
        if (this.noLagClient && this.noLagClient.send) {
            this.stopHeartbeat();
            const commands = (0, TransportCommands_1.transportCommands)()
                .setCommand(ETransportCommand_1.ETransportCommand.Topic, topicName);
            if ((identifiers === null || identifiers === void 0 ? void 0 : identifiers.length) > 0)
                commands.setCommand(ETransportCommand_1.ETransportCommand.Identifier, identifiers);
            const encodedBuffer = transport_1.NqlTransport.encode(commands, data);
            this.noLagClient.send(encodedBuffer);
            this.startHeartbeat();
        }
    }
    get status() {
        var _a, _b;
        return (_b = (_a = this.noLagClient) === null || _a === void 0 ? void 0 : _a.connectionStatus) !== null && _b !== void 0 ? _b : null;
    }
}
exports.Tunnel = Tunnel;
const WebSocketClient = async (authToken, options, connectOptions) => {
    const instance = new Tunnel(authToken, options, connectOptions);
    return instance.initiate();
};
exports.WebSocketClient = WebSocketClient;
//# sourceMappingURL=index.js.map