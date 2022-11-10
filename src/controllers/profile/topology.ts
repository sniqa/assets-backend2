import { TopologyModel, TopologySchema } from "mongo";
import { ClientConfig } from "ws";
import {
  ErrCode,
  faildRes,
  getCurrentTime,
  hasKeys,
  successRes,
  whereWasChanged,
} from "utils";

// 查找
export const find_topology = async (
  client: ClientConfig,
  query: Partial<TopologySchema>,
) => {
  const res = await TopologyModel.find(query).toArray();

  return successRes(res);
};

// 创建
export const create_topology = async (
  client: ClientConfig,
  query: Omit<TopologySchema, "_id">,
) => {
  const { timestamp } = getCurrentTime();

  const res = await TopologyModel.insertOne({ ...query, timestamp });

  return successRes({ _id: res });
};

// 更新
export const modify_topology = async (
  client: ClientConfig,
  query: Partial<TopologySchema>,
) => {
  const { _id, ...info } = query;

  const { timestamp } = getCurrentTime();

  const res = await TopologyModel.findAndModify({
    _id,
  }, {
    update: { $set: { ...info, timestamp } },
    new: true,
  });

  return res ? successRes(res) : faildRes({ errcode: 1203, errmsg: `更新失败` });
};

// 删除
export const delete_topology = async (
  client: ClientConfig,
  query: Partial<TopologySchema>,
) => {
  const res = await TopologyModel.deleteOne({ _id: query._id });

  return res > 0
    ? successRes(res)
    : faildRes({ errcode: 1204, errmsg: `删除失败` });
};
