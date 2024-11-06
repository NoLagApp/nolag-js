import { AxiosInstance } from "axios";
import { ITopicQuery, ITopicModel, IPaginated } from "../../../shared/interfaces";
export interface ITunnelTopic {
    /**
     * Create new Tunnel Topic
     * @param payload
     */
    createTopic(payload: ITopicModel): Promise<ITopicModel>;
    /**
     * Retrieve Tunnel Topic using ID
     * @param query
     */
    getTopicById(topicId: string): Promise<ITopicModel>;
    /**
     * List all Tunnel Topics
     * @param query
     */
    listTopics(query?: ITopicQuery): Promise<IPaginated<ITopicModel>>;
    /**
     * Update a Tunnel Topic
     * @param topicId
     * @param payload
     */
    updateTopic(topicId: string, payload: ITopicModel): Promise<ITopicModel>;
    /**
     * Delete a Tunnel Topic
     * @param topicId
     */
    deleteTopic(topicId: string): Promise<ITopicModel>;
}
export declare class TunnelTopic implements ITunnelTopic {
    private routeNamespace;
    private parentRouteNamespace;
    private tunnelId;
    private request;
    constructor(parentRouteNamespace: string, tunnelId: string, request: AxiosInstance);
    createTopic(payload: ITopicModel): Promise<ITopicModel>;
    getTopicById(topicId: string): Promise<ITopicModel>;
    listTopics(query?: ITopicQuery): Promise<IPaginated<ITopicModel>>;
    updateTopic(topicId: string, payload: ITopicModel): Promise<ITopicModel>;
    deleteTopic(topicId: string): Promise<ITopicModel>;
}
