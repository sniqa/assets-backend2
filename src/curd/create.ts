import { Collection } from "mongo";
import { ErrCode, faildRes, hasKeys, REPEAT, successRes } from "utils";

interface CreateInfo<T> {
  collection: Collection<T>;
  query: Partial<T>;
  params_verify?: string[];
}

// 创建
export const create = async <T>(info: CreateInfo<T>) => {
  const { collection, query, params_verify = [] } = info;

  if (!hasKeys(query, ...params_verify)) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const repeat = await collection.findOne(query);

  if (repeat) {
    return faildRes(REPEAT);
  }

  const res = await collection.insertOne(query as Omit<T, "_id">);

  return successRes({ _id: res });
};
