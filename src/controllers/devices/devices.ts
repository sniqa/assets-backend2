import { find } from "curd";
import {
  DeviceSchema,
  DevicesModel,
  IpAddressModel,
  NetworkTypesModel,
} from "mongo";
import {
  ErrCode,
  faildRes,
  hasKeys,
  idToObjectId,
  IP_REPEAT,
  ipIsV4Format,
  macIsFormat,
  macToFormatMac,
  successRes,
} from "utils";
import { create_log, LOGS_EVENT } from "controllers/log/log.ts";
import { ClientConfig } from "ws";

// create
export const create_device = async (
  client: ClientConfig,
  info: DeviceSchema,
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
      return faildRes(IP_REPEAT);
    }
  }

  if (info.ip_address && info.network_type) {
    const res = await IpAddressModel.findAndModify(
      {
        network_type: info.network_type,
        ip_address: info.ip_address,
      },
      {
        update: {
          $set: { is_used: true, username: info.user },
        },
      },
    );

    const result = await NetworkTypesModel.findAndModify(
      {
        network_name: info.network_type,
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
    const res = await IpAddressModel.findAndModify(
      {
        network_type: data.network_type,
        ip_address: data.ip_address,
      },
      {
        update: {
          $set: { is_used: false, username: "" },
        },
      },
    );

    // 更新网络类型
    const result = await NetworkTypesModel.findAndModify(
      {
        network_name: data.network_type,
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

  idToObjectId(data);

  const res = await DevicesModel.deleteOne({ _id: data._id });

  return successRes(res);
};

// update
export const modify_device = async (
  client: ClientConfig,
  data: Partial<DeviceSchema>,
) => {
  if (!hasKeys(data, "_id")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  idToObjectId(data);

  // 原始设备数据
  const origin = await DevicesModel.findOne({ _id: data._id });

  // 判断mac是否发生变化及mac是否重复
  if (data.mac) {
    if (data.mac != origin?.mac) {
      const isRepeat = await DevicesModel.findOne({ mac: data.mac });

      if (isRepeat) return faildRes(ErrCode.MAC_REPEAT);
    }
  }

  //判断网络类型和ip是否发送变化
  if (data.network_type) {
    // 仅仅是变换Ip
    if (data.network_type === origin?.network_type) {
      // 取消原有的ip及使用人占用
      const res = await IpAddressModel.findAndModify(
        {
          network_type: origin?.network_type,
          ip_address: origin?.ip_address,
        },
        {
          update: {
            $set: { is_used: false, username: "" },
          },
        },
      );

      // 更新现有的ip及使用人
      const result = await IpAddressModel.findAndModify(
        {
          network_type: data?.network_type,
          ip_address: data?.ip_address,
        },
        {
          update: {
            $set: { is_used: true, username: data.user },
          },
        },
      );
    } else {
      // 网络类型及Ip都改变

      // 取消原有的ip及使用人占用
      const res = await IpAddressModel.findAndModify(
        {
          network_type: origin?.network_type,
          ip_address: origin?.ip_address,
        },
        {
          update: {
            $set: { is_used: false, username: "" },
          },
        },
      );

      // 更新现有的ip及使用人
      const result = await IpAddressModel.findAndModify(
        {
          network_type: data?.network_type,
          ip_address: data?.ip_address,
        },
        {
          update: {
            $set: { is_used: true, username: data.user },
          },
        },
      );
    }
  }

  // 更新旧有网络类型数据
  const res1 = await NetworkTypesModel.findAndModify(
    {
      network_name: origin?.network_type,
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
      network_name: data.network_type,
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
    { _id: data._id },
    {
      update: {
        $set: data,
      },
    },
  );

  return successRes(res);
};
