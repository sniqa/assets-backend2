import { create_log, LOGS_EVENT } from "controllers/log/log.ts";
import { modify_ip } from "controllers/network/ip_address.ts";
import { find } from "curd";
import {
  DeviceSchema,
  deviceSchemaMap,
  DevicesModel,
  IpAddressModel,
  LogSchema,
  NetworkTypesModel,
  ObjectId,
} from "mongo";
import {
  ErrCode,
  faildRes,
  hasKeys,
  ipIsV4Format,
  macIsFormat,
  macToFormatMac,
  successRes,
  whereWasChanged,
} from "utils";
import { ClientConfig } from "ws";

// create
export const create_device = async (
  client: ClientConfig,
  info: Omit<DeviceSchema, "_id">,
) => {
  // 判断mac格式并转成统一格式
  if (info.mac) {
    info.mac = macToFormatMac(info.mac);

    if (!macIsFormat(info.mac)) {
      return faildRes(ErrCode.ILLEGAL_MAC_FORMAT);
    }

    const isReapt = await DevicesModel.findOne({ mac: info.mac });

    if (isReapt) {
      return faildRes(ErrCode.MAC_REPEAT);
    }
  }

  //   判断ip格式是否正确
  if (info.ip_address) {
    if (!ipIsV4Format(info.ip_address)) {
      return faildRes(ErrCode.ILLEGAL_IP_FORMAT);
    }

    const isReapt = await DevicesModel.findOne({ ip_address: info.ip_address });

    if (isReapt) {
      return faildRes(ErrCode.IP_REPEAT);
    }
  }

  if (info.ip_address && info.network_type) {
    // const res = await IpAddressModel.findAndModify(
    //   {
    //     network_type: info.network_type,
    //     ip_address: info.ip_address,
    //   },
    //   {
    //     update: {
    //       $set: { is_used: true, username: info.user },
    //     },
    //   },
    // );

    await modify_ip(client, {
      network_type: info.network_type,
      ip_address: info.ip_address,
      is_used: true,
      username: info.user,
    });

    const result = await NetworkTypesModel.findAndModify(
      {
        network_type: info.network_type,
      },
      {
        update: {
          $set: {
            unused_number: await IpAddressModel.countDocuments({
              network_type: info.network_type,
              is_used: false,
            }),
            used_number: await IpAddressModel.countDocuments({
              network_type: info.network_type,
              is_used: true,
            }),
          },
        },
      },
    );
  }

  const res = await DevicesModel.insertOne(info);

  create_log({
    who: client.addr.hostname,
    state: true,
    event: LOGS_EVENT.CREATE,
    message: `创建设备: [${info.mac || ""}]`,
  });

  return successRes({ _id: res });
};

// find
export const find_devices = async (
  client: ClientConfig,
  data: Partial<DeviceSchema>,
) =>
  await find({
    collection: DevicesModel,
    query: data,
  });

// delete
export const delete_device = async (
  client: ClientConfig,
  data: Partial<DeviceSchema>,
) => {
  if (!hasKeys(data, "_id")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  // 回收Ip，删去使用人
  if (data.ip_address && data.network_type) {
    await modify_ip(client, {
      network_type: data.network_type,
      ip_address: data.ip_address,
      is_used: false,
      username: "",
    });
    // const res = await IpAddressModel.findAndModify(
    //   {
    //     network_type: data.network_type,
    //     ip_address: data.ip_address,
    //   },
    //   {
    //     update: {
    //       $set: { is_used: false, username: "" },
    //     },
    //   },
    // );

    // 更新网络类型
    const result = await NetworkTypesModel.findAndModify(
      {
        network_type: data.network_type,
      },
      {
        update: {
          $set: {
            unused_number: await IpAddressModel.countDocuments({
              network_type: data.network_type,
              is_used: false,
            }),
            used_number: await IpAddressModel.countDocuments({
              network_type: data.network_type,
              is_used: true,
            }),
          },
        },
      },
    );
  }

  const log = {};

  const res = await DevicesModel.deleteOne({ _id: new ObjectId(data._id) });

  return res > 0
    ? (
      create_log({ ...log, state: true }), successRes(res)
    )
    : (
      create_log({ ...log, state: false }),
        faildRes(ErrCode.DEVICE_DELETE_ERROR)
    );
};

// update
export const modify_device = async (
  client: ClientConfig,
  data: Partial<DeviceSchema>,
) => {
  if (!hasKeys(data, "_id")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const { _id, ...resInfo } = data;

  const objectId = new ObjectId(_id);

  // 原始设备数据
  const origin = await DevicesModel.findOne({ _id: objectId });

  // 判断mac是否发生变化及mac是否重复
  if (data.mac) {
    if (data.mac != origin?.mac) {
      const isRepeat = await DevicesModel.findOne({ mac: data.mac });

      if (isRepeat) return faildRes(ErrCode.MAC_REPEAT);
    }
  }

  if (data.network_type === origin?.network_type) {
    // 网络类型未变化
    if (data.ip_address != origin?.ip_address) {
      // 取消原有的ip及使用人占用
      await modify_ip(client, {
        network_type: origin?.network_type || "",
        ip_address: origin?.ip_address || "",
        is_used: false,
        username: "",
      });

      // 更新现有的ip及使用人
      await modify_ip(client, {
        network_type: data?.network_type || "",
        ip_address: data?.ip_address || "",
        is_used: true,
        username: data.user,
      });
    }
  } else {
    // 网络类型发生变化

    // 取消原有的ip及使用人占用
    await modify_ip(client, {
      network_type: origin?.network_type || "",
      ip_address: origin?.ip_address || "",
      is_used: false,
      username: "",
    });

    // 更新现有的ip及使用人
    await modify_ip(client, {
      network_type: data?.network_type || "",
      ip_address: data?.ip_address || "",
      is_used: true,
      username: data.user,
    });
  }

  // 更新旧有的网络类型数据
  const res1 = await NetworkTypesModel.findAndModify(
    {
      network_type: origin?.network_type,
    },
    {
      update: {
        $set: {
          unused_number: await IpAddressModel.countDocuments({
            network_type: origin?.network_type,
            is_used: false,
          }),
          used_number: await IpAddressModel.countDocuments({
            network_type: origin?.network_type,
            is_used: true,
          }),
        },
      },
    },
  );

  // 更新现有的网络类型数据
  const res2 = await NetworkTypesModel.findAndModify(
    {
      network_type: data.network_type,
    },
    {
      update: {
        $set: {
          unused_number: await IpAddressModel.countDocuments({
            network_type: data.network_type,
            is_used: false,
          }),
          used_number: await IpAddressModel.countDocuments({
            network_type: data.network_type,
            is_used: true,
          }),
        },
      },
    },
  );

  const res = await DevicesModel.findAndModify(
    { _id: objectId },
    {
      update: {
        $set: resInfo,
      },
    },
  );

  const [before_update, after_update] = whereWasChanged(
    data,
    origin || {},
    deviceSchemaMap,
  );

  const log: Partial<LogSchema> = {
    who: client.addr.hostname,
    for_who: data.mac || "",
    event: LOGS_EVENT.UPDATE,
    message: `变更设备: ${data.mac || ""}`,
    before_update,
    after_update,
  };

  return res
    ? (create_log({ ...log, state: true }), successRes(res))
    : (create_log({ ...log, state: false }), faildRes(ErrCode.UPDATE_ERROR));
};

export const upload_devices = async (
  client: ClientConfig,
  filepath: string,
) => {};
