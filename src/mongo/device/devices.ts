import { ObjectId } from "mongo";

export const DEVICE_COLLECTION_NAME = "devices";

export interface DeviceSchema {
  _id: ObjectId;
  user: string;
  location: string;
  network_type: string;
  network_name: string;
  ip_address: string;
  mac: string;
  device_model: string;
  device_category: string;
  system_version: string;
  disk_sn: string;
  remark: string;
}

export const deviceSchemaMap: Omit<DeviceSchema, "_id"> = {
  user: "使用人",
  location: "物理位置",
  network_type: "网络类型",
  network_name: "网络名称",
  ip_address: "IP地址",
  mac: "MAC",
  device_model: "设备型号",
  device_category: "设备类别",
  system_version: "系统版本",
  disk_sn: "磁盘SN",
  remark: "备注",
};
