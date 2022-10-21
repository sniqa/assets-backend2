import { ObjectId } from "mongo";

export const DEVICE_BASE_COLLECTION_NAME = "devices_base";

export interface DeviceBaseSchema {
  _id: ObjectId;
  device_model: string; //设备型号
  device_type: string; //设备类型
  category: string;
  manufacture_date: string; //出厂日期
  shelf_life: string; //保质期
}

export const deviceBaseSchemaMap: Omit<DeviceBaseSchema, "_id"> = {
  device_model: "设备型号",
  device_type: "设备类型",
  category: "设备分类",
  manufacture_date: "出厂日期",
  shelf_life: "保质期",
};
