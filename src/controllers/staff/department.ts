import { create, find, remove } from "curd";
import {
  departmentMap,
  DepartmentModel,
  DepartmentSchema,
  LOGS_EVENT,
  LogSchema,
  ObjectId,
  UpdateFilter,
} from "../../mongo/mod.ts";
import { ErrCode, faildRes, hasKeys, successRes, whereWasChanged } from "utils";
import { create_log } from "controllers/log/log.ts";
import { ClientConfig } from "ws";

// 创建
export const create_department = async (
  client: ClientConfig,
  data: Omit<DepartmentSchema, "_id">,
) => {
  const res = await create({
    collection: DepartmentModel,
    query: data,
    params_verify: ["department_name"],
  });

  const log: Partial<LogSchema> = {
    who: client.addr.hostname,
    for_who: data.department_name,
    event: LOGS_EVENT.CREATE,
    message: `创建部门: ${data.department_name}`,
  };

  return res
    ? (
      successRes(res), create_log({ ...log, state: true })
    )
    : (
      faildRes(ErrCode.DEPARTMENT_CREATE_ERROR),
        create_log({ ...log, state: false })
    );
};

// 查询
export const find_departments = async (
  client: ClientConfig,
  data: Partial<DepartmentSchema>,
) =>
  await find({
    collection: DepartmentModel,
    query: data,
  });

// 删除
export const delete_department = async (
  client: ClientConfig,
  data: Partial<DepartmentSchema>,
) => {
  if (!hasKeys(data, "_id")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const res = await DepartmentModel.deleteOne(data);

  const log: Partial<LogSchema> = {
    who: client.addr.hostname,
    for_who: data.department_name || "",
    event: LOGS_EVENT.DELETE,
    message: `删除部门: ${data.department_name || ""}`,
  };

  return res > 0
    ? (
      successRes(true), create_log({ ...log, state: true })
    )
    : (
      successRes(ErrCode.DEPARTMENT_DELETE_ERROR),
        create_log({ ...log, state: false })
    );
};

// 变更
export const modify_department = async (
  client: ClientConfig,
  data: Partial<DepartmentSchema>,
) => {
  if (!hasKeys(data, "_id")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const { _id, ...res } = data;

  const oldData = await DepartmentModel.findAndModify(
    {
      _id: new ObjectId(data._id),
    },
    {
      update: { $set: res } as UpdateFilter<DepartmentSchema>,
    },
  );

  const log: Partial<LogSchema> = {
    who: client.addr.hostname,
    for_who: data.department_name || "",
    event: LOGS_EVENT.UPDATE,
    message: `更新部门: ${data.department_name || ""}`,
  };

  if (oldData) {
    const [before_update, after_update] = whereWasChanged(
      res,
      oldData,
      departmentMap,
    );

    create_log({ ...log, state: true, before_update, after_update });

    return successRes(data);
  }

  create_log({ ...log, state: false });

  return faildRes(ErrCode.DEPARTMENT_UPDATE_ERROR);
};
