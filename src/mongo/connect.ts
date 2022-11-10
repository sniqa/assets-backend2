import { MONGO_CONNECT_URL, MONGO_DB_NAME } from "./config.ts";
import {
  DEPARTMENT_COLLECTION_NAME,
  DepartmentSchema,
  DEVICE_BASE_COLLECTION_NAME,
  DEVICE_COLLECTION_NAME,
  DeviceBaseSchema,
  DeviceSchema,
  IP_ADDRESS_COLLECTION_NAME,
  IpAddressSchema,
  JOB_ASSIGNMENT_NAME,
  JobAssignmentSchema,
  LOGS_COLLECTION_NAME,
  LogSchema,
  MongoClient,
  NETWORK_TYPES_COLLECTION_NAME,
  NetworkTypeSchema,
  TOPOLOGY_COLLECTION_NAME,
  TOPOLOGY_DETAIL_COLLECTION_NAME,
  TOPOLOGY_HISTORY_COLLECTION_NAME,
  TopologyDetailSchema,
  TopologyHistorySchema,
  TopologySchema,
  USB_KEYS_COLLECTION_NAME,
  UsbKeysSchema,
  USERS_COLLECTION_NAME,
  UserSchema,
} from "mongo";

const client = new MongoClient();

// connect to local db
await client.connect(MONGO_CONNECT_URL);

const db = client.database(MONGO_DB_NAME);

// 用户集合
export const UsersModel = db.collection<UserSchema>(USERS_COLLECTION_NAME);

// 日志集合
export const LogsModel = db.collection<LogSchema>(LOGS_COLLECTION_NAME);

// 网络类型集合
export const NetworkTypesModel = db.collection<NetworkTypeSchema>(
  NETWORK_TYPES_COLLECTION_NAME,
);

// 硬件设备集合
export const DevicesModel = db.collection<DeviceSchema>(DEVICE_COLLECTION_NAME);

// 设备基础资料集合
export const DeviceBaseModel = db.collection<DeviceBaseSchema>(
  DEVICE_BASE_COLLECTION_NAME,
);

// ip地址集合
export const IpAddressModel = db.collection<IpAddressSchema>(
  IP_ADDRESS_COLLECTION_NAME,
);

//部门集合
export const DepartmentModel = db.collection<DepartmentSchema>(
  DEPARTMENT_COLLECTION_NAME,
);

// 数字证书集合
export const UsbKeyModel = db.collection<UsbKeysSchema>(
  USB_KEYS_COLLECTION_NAME,
);

// 拓扑图集合
export const TopologyModel = db.collection<TopologySchema>(
  TOPOLOGY_COLLECTION_NAME,
);
export const TopologyDetailModel = db.collection<TopologyDetailSchema>(
  TOPOLOGY_DETAIL_COLLECTION_NAME,
);
export const TopologyHistoryModel = db.collection<TopologyHistorySchema>(
  TOPOLOGY_HISTORY_COLLECTION_NAME,
);

// 任务集合
export const JobAssignmentModel = db.collection<JobAssignmentSchema>(
  JOB_ASSIGNMENT_NAME,
);
