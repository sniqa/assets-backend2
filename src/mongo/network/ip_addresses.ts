import { ObjectId } from "mongo";

export const IP_ADDRESS_COLLECTION_NAME = "ip_address";

export interface IpAddressSchema {
  _id: ObjectId;
  network_type: string;
  username: string;
  enable_time: string;
  ip_address: string;
  is_used: boolean;
}
