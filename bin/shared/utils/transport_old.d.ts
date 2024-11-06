import { EAction } from "../enum";
export declare const toUnitSeparator: (unitArray: string[]) => Uint8Array;
export declare const toUint8Array: (uint8Array: Uint8Array, str: string, offset: number) => Uint8Array;
export declare const topicPayload: (topicName: string, action?: EAction) => Uint8Array;
export declare const nqlPayload: (identifiers: Uint8Array, action?: EAction) => Uint8Array;
export declare const toTransportSeparator: (recordArray: Uint8Array[], separator: number) => Uint8Array;
export declare const arrayOfString: (identifiers?: string[]) => Uint8Array;
export declare const toRecordSeparator: (recordArray: Uint8Array[]) => Uint8Array;
export declare const stringToUint8Array: (str: string) => Uint8Array;
export declare const toGroupSeparator: (records: Uint8Array, data: ArrayBuffer) => ArrayBufferLike;
export declare const generateTransport: (data: ArrayBuffer, topicName: string, identifiers: string[]) => ArrayBufferLike;
