import { ObjectId } from "mongo";

export const TOPOLOGY_COLLECTION_NAME = "topologys";

export interface TopologySchema {
  _id: ObjectId;
  title: string;
  description: string;
  timestamp: number;
  history_id: string; //历史版本
}

export const TOPOLOGY_HISTORY_COLLECTION_NAME = "topology_historys";

export interface TopologyHistorySchema {
  _id: ObjectId;
  topology_id: string;
  timestamp: number;
  detail_ids: string[]; //指向详细数据的id
}

export const TOPOLOGY_DETAIL_COLLECTION_NAME = "topology_details";

export interface TopologyDetailSchema {
  _id: ObjectId;
  timestamp: number;
  title: string;
  image: string;
}
