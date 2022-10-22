import { find, update } from "curd";
import { IpAddressModel, IpAddressSchema } from "mongo";
import { ErrCode, faildRes, getCurrentTime, hasKeys, successRes } from "utils";
import { ClientConfig } from "ws";
import { create_log } from "controllers/log/log.ts";
import { LOGS_EVENT, LogSchema } from "mongo";

// 查找ip
export const find_ips = async (client: ClientConfig, data: any) => {
  return await find({
    collection: IpAddressModel,
    query: data,
    sort: 1,
  });
};

// 更新ip

export const modify_ip = async (
  client: ClientConfig,
  query: Partial<IpAddressSchema>,
) => {
  if (!hasKeys(query, "network_type", "ip_address")) {
    return faildRes(ErrCode.MISSING_PARAMETER);
  }

  const { current_time } = getCurrentTime();

  const res = await IpAddressModel.findAndModify({
    network_type: query.network_type,
    ip_address: query.ip_address,
  }, {
    update: {
      $set: {
        is_used: query.is_used,
        username: query.username,
        enable_time: current_time,
      },
    },
  });

  const log: Partial<LogSchema> = {
    who: client.addr.hostname,
    for_who: query.ip_address,
    event: LOGS_EVENT.UPDATE,
    message: `变更IP地址: ${query.ip_address}信息`,
  };

  return res
    ? (create_log({ ...log, state: true }), successRes(true))
    : (create_log({ ...log, state: false }), faildRes(ErrCode.IP_UPDATE_ERROR));
};

// 分配ip给人员
// export const assign_ip_to_person = async (client: ClientConfig, data: any) => {
//   console.log(data);

//   const res = await update({
//     collection: IpAddressModel,
//     query: data,
//     params_verify: ["ip_address", "username"],
//   });

//   console.log("res", res);

//   return successRes(res);
// };

// 分配IP给设备
// export const assign_ip_to_device = async (client: ClientConfig, data: any) => {
//   return await update({
//     collection: IpAddressModel,
//     query: { ...data, is_used: true },
//     params_verify: ["ip_address", "username"],
//   });
// };
