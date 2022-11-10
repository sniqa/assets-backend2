import { create_topology_history } from "./topology_history.ts";
import { ObjectId, TopologyDetailModel, TopologyDetailSchema } from "mongo";
import { ClientConfig } from "ws";
import { getCurrentTime, successRes } from "utils";

// 查找
export const find_topology_details = async (
  client: ClientConfig,
  query: string[],
) => {
  const ids = query.map((id) => new ObjectId(id));

  const res = await TopologyDetailModel.find({
    _id: {
      $in: ids,
    },
  }).toArray();

  return successRes(res);
};

//
export const create_topology_detail = async (
  client: ClientConfig,
  query: Omit<TopologyDetailSchema, "_id">,
) => {
};

enum ModifyTopologyDetailState {
  None = "none",
  Update = "update",
  Delete = "delete",
  Add = "add",
}

interface ModifyTopologyDetailQuery extends Partial<TopologyDetailSchema> {
  state: ModifyTopologyDetailState;
}

interface ModifyTopologyDetailQuerys {
  topology_id: string;
  data: ModifyTopologyDetailQuery[];
}

// 更新
export const modify_topology_detail = async (
  client: ClientConfig,
  querys: ModifyTopologyDetailQuerys,
) => {
  const { topology_id, data } = querys;

  const newQuery = await Promise.all(data.map(async (query) => {
    if (
      query.state ===
        (ModifyTopologyDetailState.Add || ModifyTopologyDetailState.Update)
    ) {
      const { timestamp } = getCurrentTime();
      const { _id, state, ...info } = query;
      return await TopologyDetailModel.insertOne(
        { ...info, timestamp } as Omit<TopologyDetailSchema, "_id">,
      ).then((res) => res.toString());
    } else {
      return (query._id as ObjectId).toString();
    }
  }));

  await create_topology_history(client, {
    timestamp: getCurrentTime().timestamp,
    topology_id,
    detail_ids: newQuery,
  });
};

// 删除
export const delete_topology_detail = async (client: ClientConfig) => {};
