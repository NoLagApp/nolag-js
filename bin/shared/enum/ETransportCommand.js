"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETransportCommandSeparator = exports.ETransportCommand = void 0;
/**
 * Used as a command to indicate to the Message Broker
 * that a device wants to add or delete a subscription to a topic,
 * or to add and delete identifiers set on a topic.
 */
var ETransportCommand;
(function (ETransportCommand) {
    // first connection was made
    ETransportCommand[ETransportCommand["InitConnection"] = 1] = "InitConnection";
    // first connection was made
    ETransportCommand[ETransportCommand["Authenticate"] = 15] = "Authenticate";
    // any acknowledgement
    ETransportCommand[ETransportCommand["Acknowledge"] = 6] = "Acknowledge";
    // trigger connection state hydration
    ETransportCommand[ETransportCommand["Reconnect"] = 22] = "Reconnect";
    // subscribe to topic
    ETransportCommand[ETransportCommand["Topic"] = 26] = "Topic";
    // list of NQL identifiers
    ETransportCommand[ETransportCommand["Identifier"] = 11] = "Identifier";
    // prefix error found
    ETransportCommand[ETransportCommand["Error"] = 21] = "Error";
    // Error message
    ETransportCommand[ETransportCommand["Alert"] = 7] = "Alert";
    // add action
    ETransportCommand[ETransportCommand["AddAction"] = 12] = "AddAction";
    // delete action
    ETransportCommand[ETransportCommand["DeleteAction"] = 16] = "DeleteAction";
    // Server details
    ETransportCommand[ETransportCommand["Server"] = 24] = "Server";
    // payload command separator
    ETransportCommand[ETransportCommand["Payload"] = 29] = "Payload";
    // set a custom data associated with this topic
    // this data will be sent to all devices subscribed to this topic/identifiers
    ETransportCommand[ETransportCommand["Presence"] = 14] = "Presence";
})(ETransportCommand || (exports.ETransportCommand = ETransportCommand = {}));
var ETransportCommandSeparator;
(function (ETransportCommandSeparator) {
    ETransportCommandSeparator[ETransportCommandSeparator["ArraySeparator"] = 31] = "ArraySeparator";
})(ETransportCommandSeparator || (exports.ETransportCommandSeparator = ETransportCommandSeparator = {}));
//# sourceMappingURL=ETransportCommand.js.map