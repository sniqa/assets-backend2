import { Collection, ObjectId } from "mongo";
import { successRes } from "utils";

interface RemoveInfo {
  collection: Collection<any>;
  ids?: ObjectId[];
  params_verify?: string[];
}

// 删除多个
export const remove = async <T>(info: RemoveInfo) => {
  const { collection, ids = [] } = info;

  const res = await collection.deleteMany({
    _id: {
      $in: ids,
    },
  });

  return successRes({ deleteCount: res });
};

// // 删除单个
// export const delete_one = async (collection: Collection<any>) => {
//   const res = await collection.deleteOne({});
// };
