"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ETopicType = exports.EStatus = exports.EAccessPermission = exports.ESeparator = exports.EVisibilityState = exports.EEncoding = exports.EAction = exports.EEnvironment = exports.EConnectionStatus = void 0;
var EConnectionStatus;
(function (EConnectionStatus) {
    EConnectionStatus["Idle"] = "idle";
    EConnectionStatus["Connecting"] = "connecting";
    EConnectionStatus["Connected"] = "connected";
    EConnectionStatus["Disconnected"] = "disconnected";
})(EConnectionStatus || (exports.EConnectionStatus = EConnectionStatus = {}));
var EEnvironment;
(function (EEnvironment) {
    EEnvironment["Nodejs"] = "nodejs";
    EEnvironment["Browser"] = "browser";
})(EEnvironment || (exports.EEnvironment = EEnvironment = {}));
/**
 * Used as a command to indicate to the Message Broker that a device wants to add or delete a subscription to a topic, or to add and delete identifiers set on a topic.
 */
var EAction;
(function (EAction) {
    EAction["Add"] = "a";
    EAction["Delete"] = "d";
})(EAction || (exports.EAction = EAction = {}));
var EEncoding;
(function (EEncoding) {
    EEncoding["Arraybuffer"] = "arraybuffer";
})(EEncoding || (exports.EEncoding = EEncoding = {}));
var EVisibilityState;
(function (EVisibilityState) {
    EVisibilityState["Hidden"] = "hidden";
    EVisibilityState["Visible"] = "visible";
})(EVisibilityState || (exports.EVisibilityState = EVisibilityState = {}));
var ESeparator;
(function (ESeparator) {
    ESeparator[ESeparator["Group"] = 29] = "Group";
    ESeparator[ESeparator["Record"] = 30] = "Record";
    ESeparator[ESeparator["Unit"] = 31] = "Unit";
    ESeparator[ESeparator["Vertical"] = 11] = "Vertical";
    ESeparator[ESeparator["NegativeAck"] = 21] = "NegativeAck";
    ESeparator[ESeparator["BellAlert"] = 7] = "BellAlert";
    // send this when we try to reconnect to Message Broker
    ESeparator[ESeparator["SynchronousIdle"] = 22] = "SynchronousIdle";
})(ESeparator || (exports.ESeparator = ESeparator = {}));
/**
 * Used to specify which type of Pub/Sub access the associated Device Token has.
 */
var EAccessPermission;
(function (EAccessPermission) {
    EAccessPermission["Subscribe"] = "subscribe";
    EAccessPermission["Publish"] = "publish";
    EAccessPermission["PubSub"] = "pubSub";
})(EAccessPermission || (exports.EAccessPermission = EAccessPermission = {}));
/**
 * Set the status of a Topic. Active, the Topic can be used. Inactive, Topic can not be used.
 */
var EStatus;
(function (EStatus) {
    EStatus["Active"] = "active";
    EStatus["Inactive"] = "inactive";
})(EStatus || (exports.EStatus = EStatus = {}));
var ETopicType;
(function (ETopicType) {
    ETopicType["Standard"] = "standard";
    ETopicType["Api"] = "api";
})(ETopicType || (exports.ETopicType = ETopicType = {}));
//# sourceMappingURL=enum.js.map