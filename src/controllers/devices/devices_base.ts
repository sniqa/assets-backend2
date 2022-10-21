import { create, find, remove, update } from "curd";
import {
  DeviceBaseModel,
  DeviceBaseSchema,
  deviceBaseSchemaMap,
  ObjectId,
  UpdateFilter,
} from "mongo";
import {
  ErrCode,
  faildRes,
  hasKeys,
  idToObjectId,
  successRes,
  whereWasChanged,
} from "utils";
import { create_log, create_logs, LOGS_EVENT } from "controllers/log/log.ts";
import { ClientConfig } from "ws";

// 创建设备
export const create_device_base = async (
  client: ClientConfig,
  data: Partial<DeviceBaseSchema>,
) => {
  const res = await create({
    collection: DeviceBaseModel,
    query: data,
    params_verify: ["device_model"],
  });

  create_log({
    who: client.addr.hostname,
    for_who: data.device_model || "",
    event: LOGS_EVENT.CREATE,
    state: res.success,
    message: `创建${deviceBaseSchemaMap["device_model"]}: ${data.device_model}`,
  });

  return res;
};

// 查找设备
export const find_device_base = async (client: ClientConfig, data: any) =>
  await find({
    collection: DeviceBaseModel,
    query: data,
  });

// 变更设备
export const modify_device_base = async (
  client: ClientConfig,
  query: Partial<DeviceBaseSchema>,
) => {
  const oldData = await update({
    collection: DeviceBaseModel,
    query,
    params_verify: ["_id"],
  });

  if (!oldData.success) {
    return faildRes({
      errcode: 893,
      errmsg: `更新失败`,
    });
  }

  const [before_update, after_update] = whereWasChanged(
    query,
    oldData,
    deviceBaseSchemaMap,
  );

  create_log({
    who: client.addr.hostname,
    for_who: query.device_model || "",
    event: LOGS_EVENT.UPDATE,
    message: "",
    before_update,
    after_update,
  });

  return successRes(true);
};

// 删除
export const delete_device_base = async (
  client: ClientConfig,
  ids: Array<string | number>,
) => {
  const objectIds = ids.map((id) => new ObjectId(id));

  const target = await DeviceBaseModel.find({
    _id: {
      $in: objectIds,
    },
  }).toArray();

  if (target.length <= 0) {
    return faildRes(ErrCode.ERROR_PARAMETER);
  }

  const r = target.map((t) => ({
    device_model: t.device_model,
    state: true,
    who: client.addr.hostname,
    event: LOGS_EVENT.DELETE,
    for_who: t.device_model,
    message: `删除设备型号: ${t.device_model}`,
  }));

  const res = await remove({
    collection: DeviceBaseModel,
    ids: objectIds,
  });

  res.success && create_logs(r);

  return successRes(res);
};
