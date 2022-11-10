import { TopologyHistoryModel, TopologyHistorySchema } from "mongo";
import { ClientConfig } from "ws";
import { ErrCode, faildRes, getCurrentTime, hasKeys, successRes } from "utils";
import { modify_topology } from "controllers/profile/topology.ts";

// 查找
export const find_topology_history = async (
  client: ClientConfig,
  query: Partial<TopologyHistorySchema>,
) => {
  const res = await TopologyHistoryModel.find(query).toArray();
  return successRes(res);
};

//创建
export const create_topology_history = async (
  client: ClientConfig,
  query: Omit<TopologyHistorySchema, "_id">,
) => {
  if (hasKeys(query, "topology_id")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const { timestamp } = getCurrentTime();

  const res = await TopologyHistoryModel.insertOne({ ...query, timestamp });

  //更新topology,使之指向最新版本
  modify_topology(client, { history_id: res.toString() });

  return successRes({ _id: res });
};

// 删除
export const delete_topology_history = async (
  client: ClientConfig,
  query: Partial<TopologyHistorySchema>,
) => {
  const res = await TopologyHistoryModel.deleteOne({ _id: query._id });

  return res > 0
    ? successRes(res)
    : faildRes({ errcode: 1204, errmsg: `删除失败` });
};
