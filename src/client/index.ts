import { FConnection, dataType } from "../shared/constants";
import {
  IConnectOptions,
  IErrorMessage,
  INqlIdentifiers,
  ITransport,
  ITunnelOptions,
} from "../shared/interfaces";

import { ITopic, Topic } from "../shared/models/Topic";

import { EVisibilityState } from "../shared/enum";
import { ETransportCommand } from "../shared/enum/ETransportCommand";
import { transportCommands } from "../shared/utils/TransportCommands";
import { NqlTransport } from "../shared/utils/transport";
import { NoLagClient } from "./NoLagClient";

export interface ITunnel {
  /**
   * Retrieve instanciated topic
   * @param topicName Topic name regisrered in NoLag Portal
   * @return Topic | undefined
   */
  getTopic(topicName: string): ITopic | undefined;
  /**
   * Delete instanciated topic
   * @param topicName Topic name regisrered in NoLag Portal
   * @return boolean
   */
  unsubscribe(topicName: string): boolean;
  /**
   * Set a new topic that is attached to tunnel
   * @param topicName Topic name regisrered in NoLag Portal
   * @param identifiers Set if reverse query identifiers which the topic will listen two
   */
  subscribe(
    topicName: string,
    identifiers?: INqlIdentifiers,
  ): ITopic | undefined;
  /**
   * Publish data before setting a Topic
   * @param topicName string - Topic name regisrered in NoLag Portal
   * @param data ArrayBuffer - Data to send to the Topic
   * @param identifiers string[] - Set if reverse query identifiers which the topic will listen two
   */
  publish(topicName: string, data: ArrayBuffer, identifiers?: string[]): void;
  onReceive(callbackFn: ((data: ITransport) => void) | undefined): void;
  /**
   * Disconnect from NoLag
   */
  disconnect(): void;
  /**
   * Triggered when device disconnects form Message Broker
   * @param callbackFn
   */
  onDisconnect(
    callbackFn: ((errorMessage: IErrorMessage) => void) | undefined,
  ): void;
  /**
   * Triggered when there is a reconnect attempt
   * @param callbackFn
   */
  onReconnect(callbackFn: ((data: ITransport) => void) | undefined): void;
  /**
   * Triggered when any errors are sent from the Message Broker
   * @param callbackFn
   */
  onErrors(
    callbackFn: ((errorMessage: IErrorMessage) => void) | undefined,
  ): void;
}

/**
 * To get access NoLag message broker you need access to a Tunnel
 * This class initiates a Tunnel connection and gives you the ability to subscribe to a
 * Topic instance and publish to a topic
 */
export class Tunnel implements ITunnel {
  // the WS connection to NoLag
  private noLagClient: NoLagClient | undefined;
  private connectOptions?: IConnectOptions;

  private authToken: string;

  // topics
  private topics: dataType<ITopic> = {};

  private heartbeatTimer: any;

  private defaultCheckConnectionInterval = 10000;
  private checkConnectionInterval: number;
  private heartBeatInterval: number = 20000;
  private visibilityState: string = EVisibilityState.Visible;

  private callbackOnReceive: ((data: ITransport) => void) | undefined;
  private callbackOnDisconnect: FConnection = () => {};
  private callbackOnReconnect: FConnection = () => {};
  private callbackOnReceivedError: FConnection = () => {};

  constructor(
    authToken: string,
    options?: ITunnelOptions,
    connectOptions?: IConnectOptions,
  ) {
    this.checkConnectionInterval =
      connectOptions?.checkConnectionInterval ??
      this.defaultCheckConnectionInterval;
    this.connectOptions = connectOptions ?? undefined;
    this.authToken = authToken;

    // initiate NoLag client connection
    this.noLagClient = new NoLagClient(this.authToken, this.connectOptions);

    this.onClose();
    this.onError();
    this.onReceiveMessage();

    // disconnect from NoLag when you move away from the screen
    if (options?.disconnectOnNoVisibility) {
      this.onVisibilityChange();
    }
  }

  public get deviceTokenId() {
    return this.noLagClient?.deviceTokenId;
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.noLagClient) {
        this.noLagClient.heartbeat();
      }
    }, this.heartBeatInterval);
  }

  private stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
  }

  // connect to NoLag with Tunnel credentials
  public async initiate(reconnect?: boolean) {
    if (this.noLagClient) {
      this.noLagClient.setReConnect(reconnect);
      await this.noLagClient.connect();
      this.startHeartbeat();
    }
    return this;
  }

  private onVisibilityChange() {
    if (document.addEventListener) {
      document.addEventListener("visibilitychange", async () => {
        this.visibilityState = document.visibilityState;
        switch (this.visibilityState) {
          case EVisibilityState.Hidden:
            this.noLagClient?.disconnect();
            this.stopHeartbeat();
            break;
          case EVisibilityState.Visible:
            await this.initiate(true);
            break;
        }
      });
    }
  }

  private onReceiveMessage() {
    if (this.noLagClient) {
      this.noLagClient?.onReceiveMessage((err: any, data: ITransport) => {
        const { topicName, identifiers } = data;
        if (this.noLagClient && !this.topics[topicName]) {
          this.topics[topicName] = new Topic(this.noLagClient, topicName, {
            OR: identifiers,
          });
        }
        if (topicName && this.topics[topicName]) {
          this.topics[topicName]?._onReceiveMessage(data);
        }
        if (typeof this.callbackOnReceive === "function") {
          this.callbackOnReceive(data);
        }
      });
    }
  }

  private reconnect(): void {
    this.stopHeartbeat();
    setTimeout(async () => {
      // this.reconnectAttempts++;
      await this.initiate(true);
      if (typeof this.callbackOnReconnect === "function") {
        this.callbackOnReconnect();
      }
    }, this.checkConnectionInterval);
  }

  private canReconnect(): boolean {
    return this.visibilityState !== EVisibilityState.Hidden;
  }

  private doReconnect(): void {
    if (this.canReconnect()) {
      this.reconnect();
    } else {
      this.stopHeartbeat();
      if (typeof this.callbackOnDisconnect === "function") {
        this.callbackOnDisconnect("connection retry timeout.");
      }
    }
  }

  private onClose() {
    if (this.noLagClient) {
      this.noLagClient.onClose((err: any, data: ITransport) => {
        this.doReconnect();
        if (typeof this.callbackOnReceivedError === "function") {
          this.callbackOnReceivedError(err);
        }
      });
    }
  }

  private onError() {
    if (this.noLagClient) {
      this.noLagClient.onError((err: IErrorMessage, data: ITransport) => {
        if (typeof this.callbackOnReceivedError === "function") {
          this.callbackOnReceivedError(err);
        }
      });
    }
  }

  public onReceive(callback: (data: ITransport) => void): void {
    this.callbackOnReceive = callback;
  }

  public disconnect(): void {
    this.visibilityState = EVisibilityState.Hidden;
    this.noLagClient?.disconnect();
  }

  public onDisconnect(callback: FConnection): void {
    this.callbackOnDisconnect = callback;
  }

  public onReconnect(callback: FConnection): void {
    this.callbackOnReconnect = callback;
  }

  public onErrors(callback: FConnection): void {
    this.callbackOnReceivedError = callback;
  }

  public getTopic(topicName: string): ITopic | undefined {
    // if you are trying to get the specific topic but its not been set
    // set it now
    if (!this.topics[topicName] && this.noLagClient) {
      this.topics[topicName] = new Topic(this.noLagClient, topicName, {});
    }

    return this.topics[topicName];
  }

  public unsubscribe(topicName: string): boolean {
    if (this.topics[topicName]) {
      this.topics[topicName]?.unsubscribe();
      delete this.topics[topicName];
      return true;
    }
    return false;
  }

  public subscribe(
    topicName: string,
    identifiers: INqlIdentifiers = {},
  ): ITopic | undefined {
    if (this.noLagClient) {
      if (this.topics[topicName]) {
        return this.topics[topicName];
      } else {
        this.topics[topicName] = new Topic(
          this.noLagClient,
          topicName,
          identifiers,
        );

        return this.topics[topicName];
      }
    }
  }

  public publish(
    topicName: string,
    data: ArrayBuffer,
    identifiers: string[] = [],
  ): void {
    if (this.noLagClient && this.noLagClient.send) {
      this.stopHeartbeat();
      const commands = transportCommands()
        .setCommand(ETransportCommand.Topic, topicName);

      if(identifiers?.length > 0)
        commands.setCommand(ETransportCommand.Identifier, identifiers);

      const encodedBuffer = NqlTransport.encode(commands, data);

      this.noLagClient.send(encodedBuffer);
      this.startHeartbeat();
    }
  }

  public get status() {
    return this.noLagClient?.connectionStatus ?? null;
  }
}

export const WebSocketClient = async (
  authToken: string,
  options?: ITunnelOptions,
  connectOptions?: IConnectOptions,
): Promise<ITunnel> => {
  const instance = new Tunnel(authToken, options, connectOptions);
  return instance.initiate();
};
