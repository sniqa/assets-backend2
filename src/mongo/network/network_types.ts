import { ObjectId } from "mongo";

export const NETWORK_TYPES_COLLECTION_NAME = "network_types";

export interface NetworkTypeSchema {
  _id: ObjectId;
  network_type_name: string;
  ip_address_start: string;
  ip_address_end: string;
  netmask: string;
  gateway: string;
  dns: string[];
  used_number: number;
  unused_number: number;
  total_number: number;
  remark: string;
}
