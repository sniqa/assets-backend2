import { Collection, UpdateFilter } from "../mongo/mod.ts";
import { ErrCode, faildRes, hasKeys, idToObjectId, successRes } from "utils";

interface UpdateQuery {
  _id: string;
}

interface UpdateInfo<T> {
  collection: Collection<T>;
  query: Partial<T>;
  params_verify?: string[];
}

export const update = async <T>(info: UpdateInfo<T>) => {
  const { collection, query, params_verify = [] } = info;

  if (!hasKeys(query, ...params_verify)) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const { _id, ...res } = idToObjectId(query);

  const result = await collection.findAndModify(
    {
      _id,
    },
    {
      update: { $set: res } as UpdateFilter<T>,
    },
  );

  return successRes(result);
};
