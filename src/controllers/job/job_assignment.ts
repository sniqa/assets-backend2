import { ClientConfig } from "ws";
import {
  JobAssignmentMap,
  JobAssignmentModel,
  JobAssignmentSchema,
  JobPassState,
} from "mongo";
import {
  ErrCode,
  faildRes,
  getCurrentTime,
  hasKeys,
  successRes,
  whereWasChanged,
} from "utils";

// 查找
export const find_job_assignments_with_ip = async (
  client: ClientConfig,
  query: Partial<JobAssignmentSchema>,
) => {
  const res = await JobAssignmentModel.find({
    ip_address: client.addr.hostname,
  }).toArray();

  return successRes(res);
};

// 创建
export const create_job_assignment = async (
  client: ClientConfig,
  query: Omit<JobAssignmentSchema, "_id">,
) => {
  console.log(query, "query");

  const { timestamp } = getCurrentTime();

  const ip = client.addr.hostname;

  const res = await JobAssignmentModel.insertOne({
    ...query,
    timestamp,
    ip_address: ip,
    passed_state: JobPassState.Pengding,
  });

  return successRes(await JobAssignmentModel.findOne({ _id: res }));
};

// 删除
export const delete_job_assignment = async (
  client: ClientConfig,
  query: Partial<JobAssignmentSchema>,
) => {
  const res = await JobAssignmentModel.delete(query);

  return successRes(res);
};

// 更新
export const modify_job_assignment = async (
  client: ClientConfig,
  query: Partial<JobAssignmentSchema>,
) => {
  if (hasKeys(query, "_id")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const { _id, ...info } = query;

  const res = await JobAssignmentModel.findAndModify({ _id }, {
    update: {
      $set: info,
    },
    new: true,
  });

  return successRes(res);
};
