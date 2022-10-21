import {
  IpAddressSchema,
  LOGS_EVENT,
  NetworkTypeSchema,
  NetworkTypesModel,
} from "mongo";
import {
  defaultPageLength,
  ErrCode,
  faildRes,
  getCurrentTime,
  hasKeys,
  idToObjectId,
  ipFromLong,
  ipIsV4Format,
  ipToLong,
  successRes,
} from "utils";
import { DevicesModel, IpAddressModel } from "mongo";
import { ClientConfig } from "ws";
import { create_log } from "controllers/log/log.ts";

// 从网络类型中获取IP段和网络类型属性
const generateNetworkTypeInfo = (
  data: Partial<NetworkTypeSchema>,
): [Partial<NetworkTypeSchema>, Partial<IpAddressSchema>[]] => {
  if (!data.ip_address_start && !data.ip_address_end) {
    return [
      {
        total_number: 0,
        unused_number: 0,
        used_number: 0,
        ...data,
      },
      [],
    ];
  }

  const ipAddressStartLong = ipToLong(data.ip_address_start as string);
  const ipAddressEnd = ipToLong(data.ip_address_end as string);
  const ipNumber = ipAddressEnd - ipAddressStartLong + 1; //网络类型ip个数

  const { current_time } = getCurrentTime();

  const ipRange: Partial<IpAddressSchema>[] = Array.from(
    { length: ipNumber },
    (_, i) => ({
      ip_address: ipFromLong(ipAddressStartLong + i),
      network_type: data.network_name || "",
      is_used: false,
      enable_time: current_time,
    }),
  );

  return [
    {
      total_number: ipNumber,
      unused_number: ipNumber,
      used_number: 0,
      ...data,
    },
    ipRange,
  ];
};

// 创建ip段
const createIpAddressRange = async (data: IpAddressSchema[]) => {
  const res = await IpAddressModel.insertMany(data);

  return res.insertedCount > 0
    ? successRes(res)
    : faildRes(ErrCode.INSERT_IP_RANGE_ERROR);
};

// 创建网络类型
export const create_network_type = async (
  client: ClientConfig,
  data: Partial<NetworkTypeSchema>,
) => {
  if (!hasKeys(data, "network_name")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  // 验证ip格式
  if (data.ip_address_start && data.ip_address_end) {
    if (
      ![data.ip_address_start, data.ip_address_end].every((ip) =>
        ipIsV4Format(ip as string)
      )
    ) {
      return faildRes(ErrCode.ILLEGAL_IP_FORMAT);
    }
  }

  // 是否重复的网络类型
  const reaptNetType = await NetworkTypesModel.findOne({
    network_name: data.network_name,
  });

  if (reaptNetType) {
    return faildRes(ErrCode.NETWORK_TYPE_EXISTS);
  }

  // 计算该网络类型的属性
  const [networkTypeInfo, ipRange] = generateNetworkTypeInfo(data);

  if (ipRange.length > 0) {
    const ips = await createIpAddressRange(ipRange as IpAddressSchema[]);

    if (!ips.success) {
      return faildRes(ErrCode.INSERT_IP_RANGE_ERROR);
    }
  }

  const res = await NetworkTypesModel.insertOne(
    networkTypeInfo as NetworkTypeSchema,
  );

  return res
    ? (successRes({ _id: res, ...networkTypeInfo }),
      create_log({
        who: client.addr.hostname,
        for_who: data.network_name,
        state: true,
        event: LOGS_EVENT.CREATE,
        message: `创建网络类型: ${data.network_name}`,
      }))
    : (faildRes(ErrCode.INSERT_NETWORK_TYPE_ERROR),
      create_log({
        who: client.addr.hostname,
        for_who: data.network_name,
        state: false,
        event: LOGS_EVENT.CREATE,
        message: `创建网络类型: ${data.network_name}`,
      }));
};

// 查询网络类型
export const find_network_types = async (
  client: ClientConfig,
  filter: Partial<NetworkTypeSchema>,
  //   defaultPage = defaultPageLength,
) => {
  //   const { page, length } = defaultPage;

  const res = await NetworkTypesModel.find(filter)
    .sort({ _id: -1 })
    .toArray();

  //   {
  //     skip: page * length,
  //     limit: length,
  //   }

  return successRes(res);
};

// 删除网络类型
export const delete_network_type = async (
  client: ClientConfig,
  data: Partial<NetworkTypeSchema>,
) => {
  idToObjectId(data);

  // 删除ip
  const result = await IpAddressModel.deleteMany({
    network_type: data.network_name,
  });

  // 将已分配的ip进行清空
  const r = await DevicesModel.updateMany(
    { network_type: data.network_name },
    {
      $set: { network_type: "", ip_address: "" },
    },
  );

  // 删除网络类型
  const res = await NetworkTypesModel.deleteOne(data);

  return res > 0
    ? (successRes(res),
      create_log({
        who: client.addr.hostname,
        for_who: "",
      }))
    : (faildRes(ErrCode.DELETE_NETWORK_TYPE_ERROR), create_log({}));
};
