import { ObjectId } from "mongo";

export const IP_ADDRESS_COLLECTION_NAME = "ip_address";

export interface IpAddressSchema {
  _id: ObjectId;
  network_type: string;
  user: string;
  enable_time: string;
  device_model: string;
  ip_address: string;
  is_used: boolean;
}

export const ipAddressMap = {
  network_type: `网络类型`,
  user: `使用人`,
  device_model: "设备类型",
  ip_address: `ip地址`,
  is_used: `是否使用`,
};
