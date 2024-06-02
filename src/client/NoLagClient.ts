import { CONSTANT, FConnection } from "../shared/constants";
import {
  EConnectionStatus,
  EEncoding,
  EEnvironment,
  ESeparator,
} from "../shared/enum";
import { ETransportCommand } from "../shared/enum/ETransportCommand";
import {
  IConnectOptions,
  IErrorMessage,
  IResponse,
} from "../shared/interfaces";
import { uint8ArrayToString } from "../shared/utils/Encodings";
import { Commands } from "../shared/utils/TransportCommands";
import { NqlTransport } from "../shared/utils/transport_v2";

interface INoLagClient {
  connect(): Promise<NoLagClient>;
  setReConnect(): void;
  onOpen(callback: FConnection): void;
  onReceiveMessage(callback: FConnection): void;
  onClose(callback: FConnection): void;
  onError(callback: FConnection): void;
}

export class NoLagClient implements INoLagClient {
  private host: string;
  private authToken: string;
  public wsInstance: any | null = null;
  private protocol: string;
  private url: string;
  private deviceConnectionId: string | undefined = undefined;
  private environment: EEnvironment | undefined;
  public deviceTokenId: string | null = null;
  //  check connection
  private defaultCheckConnectionInterval = 100;
  private defaultCheckConnectionTimeout = 10000;
  private checkConnectionInterval: number;
  private checkConnectionTimeout: number;
  private reConnect: boolean = false;

  // callback function used to return the connection result
  private callbackOnOpen: FConnection = () => {};
  private callbackOnReceive: FConnection = () => {};
  private callbackOnClose: FConnection = () => {};
  private callbackOnError: FConnection = () => {};

  // status of current socket connection
  public connectionStatus: EConnectionStatus = EConnectionStatus.Idle;
  private buffer: ArrayBuffer[] = [];
  private backpressureSendInterval = 0;
  private senderInterval: any = 0;

  constructor(authToken: string, connectOptions?: IConnectOptions) {
    this.authToken = authToken ?? "";
    this.host = connectOptions?.host ?? CONSTANT.DefaultWsHost;
    this.protocol = connectOptions?.protocol ?? CONSTANT.DefaultWsProtocol;
    this.url = CONSTANT.DefaultWsUrl;
    this.checkConnectionInterval =
      connectOptions?.checkConnectionInterval ??
      this.defaultCheckConnectionInterval;
    this.checkConnectionTimeout =
      connectOptions?.checkConnectionTimeout ??
      this.defaultCheckConnectionTimeout;
    this.startSender();
  }

  startSender() {
    this.senderInterval = setInterval(() => {
      // get the first message in the buffer
      const sendTransport = this.buffer.shift();
      if (!sendTransport) return;
      if (!this.wsInstance) return;
      // send the first message in the buffer
      this.wsInstance.send(sendTransport);
    }, this.backpressureSendInterval);
  }

  // to elevate the backpressure we increase the send interval
  slowDownSender(backpressureInterval: number) {
    clearInterval(this.senderInterval);
    this.backpressureSendInterval = backpressureInterval;
    this.startSender();
  }

  addToBuffer(buffer: ArrayBuffer) {
    this.buffer.push(buffer);
  }

  setReConnect(reConnect?: boolean) {
    if (reConnect) this.reConnect = reConnect;
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
  connect(): Promise<NoLagClient> {
    this.connectionStatus = EConnectionStatus.Idle;
    this.isBrowser() ? this.browserInstance() : this.nodeInstance();
    return new Promise((resolve, reject) => {
      const checkConnection = setInterval(() => {
        if (this.connectionStatus === EConnectionStatus.Connected) {
          resolve(this);
          clearInterval(checkConnection);
        }
      }, this.checkConnectionInterval);
      setTimeout(() => {
        if (this.connectionStatus === EConnectionStatus.Idle) {
          reject(true);
          clearInterval(checkConnection);
        }
      }, this.checkConnectionTimeout);
    });
  }

  disconnect() {
    if (this.wsInstance && this.wsInstance.close) {
      this.wsInstance.close();
    }
  }

  /**
   * Initiate browser WebSocket instance and set it to
   * wsInstance
   */
  browserInstance() {
    this.environment = EEnvironment.Browser;

    // prevent the re-initiation of a socket connection when the
    // reconnect function calls this method again
    if (this.connectionStatus === EConnectionStatus.Connected) {
      return;
    }

    this.wsInstance = null;
    // connect to server via ws
    this.wsInstance = new WebSocket(
      `${this.protocol}://${this.host}${this.url}`,
    );
    this.wsInstance.binaryType = EEncoding.Arraybuffer;

    // set of events
    // when a successful connection is made with he server
    this.wsInstance.onopen = (event: any) => {
      this._onOpen(event);
    };

    this.wsInstance.onclose = (event: any) => {
      this._onClose(event);
    };

    this.wsInstance.onerror = (event: any) => {
      this._onError(event);
    };

    this.wsInstance.onmessage = (event: any) => {
      this._onReceive(event);
    };
  }

  /**
   * Node WebSocket connection with package "ws"
   */
  nodeInstance() {
    import("ws").then((loadedWebSocketNode) => {
      const WebSocketNode = loadedWebSocketNode.default;

      this.environment = EEnvironment.Nodejs;

      // prevent the re-initiation of a socket connection when the
      // reconnect function calls this method again
      if (this.connectionStatus === EConnectionStatus.Connected) {
        return;
      }

      this.wsInstance = new WebSocketNode(
        `${this.protocol}://${this.host}${this.url}`,
      );

      this.wsInstance.on("open", (event: any) => {
        this._onOpen(event);
      });
      this.wsInstance.on("message", (event: any) => {
        this._onReceive(event);
      });
      this.wsInstance.on("close", (event: any) => {
        this._onError(event);
      });
    });
  }

  authenticate() {
    this.connectionStatus = EConnectionStatus.Connecting;

    const { authToken } = this;
    const commands = Commands.init().setCommand(
      ETransportCommand.Authenticate,
      authToken,
    );

    if (this.reConnect) {
      commands.setCommand(ETransportCommand.Reconnect);
    }

    this.send(NqlTransport.encode(commands));
  }

  public onOpen(callback: FConnection) {
    this.callbackOnOpen = callback;
  }

  public onReceiveMessage(callback: FConnection) {
    this.callbackOnReceive = callback;
  }

  public onClose(callback: FConnection) {
    this.callbackOnClose = callback;
  }

  public onError(callback: FConnection) {
    this.callbackOnError = callback;
  }

  private _onOpen(event: any) {
    this.connectionStatus === EConnectionStatus.Idle;
    this.callbackOnOpen(undefined, event);
  }

  private getAlertMessage(payload: Uint8Array): IErrorMessage {
    const removedNegativeSeparator = payload.slice(1, payload.length);
    const codeSplit = removedNegativeSeparator.findIndex(
      (i) => i == ESeparator.BellAlert,
    );
    const code = removedNegativeSeparator.slice(0, codeSplit);
    const message = removedNegativeSeparator.slice(
      codeSplit + 1,
      removedNegativeSeparator.length,
    );
    return {
      code: Number(uint8ArrayToString(code)),
      msg: uint8ArrayToString(message),
    };
  }

  private getGroupSeparatorIndex(payload: Uint8Array): number {
    return payload.findIndex((i) => i == ESeparator.Group);
  }

  private getGroups(payload: Uint8Array): any {
    const sliceIndex = this.getGroupSeparatorIndex(payload);

    // extract topic and identifier records
    const topicAndIdentifiers = payload.slice(0, sliceIndex);

    // extact data
    const data = payload.slice(sliceIndex + 1, payload.length);
    return {
      topicAndIdentifiers,
      data,
    };
  }

  private getRecordSeparatorIndex(payload: Uint8Array): number {
    return payload.findIndex((i) => i == ESeparator.Record);
  }

  private getRecords(payload: Uint8Array): any {
    const sliceIndex = this.getRecordSeparatorIndex(payload);

    // extract topic name
    const topicName = uint8ArrayToString(payload.slice(0, sliceIndex));

    // extract NQL identifiers
    const nqlIdentifiers = uint8ArrayToString(
      payload.slice(sliceIndex + 1, payload.length),
    )
      .split("\u000b")
      .filter((i) => i !== "");

    return {
      topicName,
      nqlIdentifiers,
    };
  }

  private decode(payload: Uint8Array): IResponse {
    const { topicAndIdentifiers, data } = this.getGroups(payload);
    const { topicName, nqlIdentifiers } = this.getRecords(topicAndIdentifiers);

    return {
      data,
      topicName,
      nqlIdentifiers,
    };
  }

  private async _onReceive(event: any) {
    let data = null;
    switch (this.environment) {
      case EEnvironment.Browser:
        const arrayBuffer = await event.data;
        data = arrayBuffer;
        break;

      case EEnvironment.Nodejs:
        data = event;
        break;
    }

    if (!data?.[0]) {
      return;
    }

    const decodedData = NqlTransport.decode(data);

    if (
      decodedData[] === EConnectionStatus.Connecting &&
      this.connectionStatus === EConnectionStatus.Idle
    ) {
      this.authenticate();
      return;
    }
    if (
      Number(`${data[0]}${data[1]}`) === EConnectionStatus.Connected &&
      this.connectionStatus === EConnectionStatus.Connecting
    ) {
      this.connectionStatus = EConnectionStatus.Connected;
      this.deviceTokenId = uint8ArrayToString(data.slice(2, data.length));
      return;
    }
    if (Number(`${data[0]}`) === ESeparator.NegativeAck) {
      this.connectionStatus = EConnectionStatus.Connected;
      this.callbackOnError(this.getAlertMessage(data), undefined);
      return;
    }

    this.callbackOnReceive(undefined, this.decode(data));
  }

  private _onClose(event: any) {
    this.connectionStatus = EConnectionStatus.Disconnected;
    this.callbackOnClose(event, undefined);
  }

  private _onError(event: any) {
    this.connectionStatus = EConnectionStatus.Disconnected;
    this.callbackOnError(event, undefined);
  }

  public send(transport: ArrayBuffer) {
    this.addToBuffer(transport);
  }

  public heartbeat() {
    if (this.wsInstance) {
      this.wsInstance.send(new ArrayBuffer(0));
    }
  }
}
