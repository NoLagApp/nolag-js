import { IDeviceListQuery, IDeviceTokenModel, IPaginated, IRequestParams } from "../../../shared/interfaces";
export interface ITunnelDevice {
    /**
     * Create new Tunnel device
     * @param payload
     */
    createDevice(payload: IDeviceTokenModel): Promise<IDeviceTokenModel>;
    /**
     * Retrieve Tunnel device using ID
     * @param query
     */
    getDeviceById(deviceTokenId: string): Promise<IDeviceTokenModel>;
    /**
     * List all Tunnel devices
     * @param query
     */
    listDevices(query?: IDeviceListQuery): Promise<IPaginated<IDeviceTokenModel>>;
    /**
     * Update a Tunnel device
     * @param deviceTokenId
     * @param payload
     */
    updateDevice(deviceTokenId: string, payload: IDeviceTokenModel): Promise<IDeviceTokenModel>;
    /**
     * Delete a Tunnel device
     * @param deviceTokenId
     */
    deleteDevice(deviceTokenId: string): Promise<IDeviceTokenModel>;
}
export declare class TunnelDevice implements ITunnelDevice {
    private routeNamespace;
    private parentRouteNamespace;
    private tunnelId;
    private requestParams;
    constructor(parentRouteNamespace: string, tunnelId: string, requestParams: IRequestParams);
    createDevice(payload: IDeviceTokenModel): Promise<IDeviceTokenModel>;
    getDeviceById(deviceTokenId: string): Promise<IDeviceTokenModel>;
    listDevices(query?: IDeviceListQuery): Promise<IPaginated<IDeviceTokenModel>>;
    updateDevice(deviceTokenId: string, payload: IDeviceTokenModel): Promise<IDeviceTokenModel>;
    deleteDevice(deviceTokenId: string): Promise<IDeviceTokenModel>;
}
//# sourceMappingURL=TunnelDevice.d.ts.map