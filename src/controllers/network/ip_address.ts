import { find, update } from "curd";
import { IpAddressModel, IpAddressSchema } from "mongo";
import { ErrCode, faildRes, successRes } from "utils";
import { ClientConfig } from "ws";

// 查找ip
export const find_ips = async (client: ClientConfig, data: any) => {
  return await find({
    collection: IpAddressModel,
    query: data,
    sort: 1,
  });
};

// 更新ip
export const modify_ip = async () => {
  const res = await IpAddressModel.updateOne({});
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
