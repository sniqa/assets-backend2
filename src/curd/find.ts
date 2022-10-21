import { Collection } from "mongo";
import { ErrCode, faildRes, hasKeys, idToObjectId, successRes } from "utils";

interface FindInfo<T> {
  collection: Collection<T>;
  query?: Partial<T>;
  params_verify?: string[];
  sort?: number;
}

interface FindOptions {
  page: number;
  pageLength: number;
}

// 创建
export const find = async <T>(
  info: FindInfo<T>,
  options: FindOptions = { page: 0, pageLength: 0 },
) => {
  const { collection, query = {}, params_verify = [], sort = -1 } = info;
  const { page, pageLength } = options;

  if (!hasKeys(query, ...params_verify)) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const objectIdQuery = idToObjectId(query);

  const res = collection
    .find(objectIdQuery)
    .sort({ _id: sort })
    .skip(page * pageLength)
    .limit(pageLength);

  return successRes(await res.toArray());
};
