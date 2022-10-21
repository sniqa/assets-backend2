export { Collection, MongoClient, ObjectId } from "mongodb";
export type { UpdateFilter } from "mongodb/types";

export {
  DepartmentModel,
  DeviceBaseModel,
  DevicesModel,
  IpAddressModel,
  LogsModel,
  NetworkTypesModel,
  UsersModel,
} from "./connect.ts";

export {
  DEVICE_BASE_COLLECTION_NAME,
  type DeviceBaseSchema,
  deviceBaseSchemaMap,
} from "./device/devices_base.ts";

export {
  DEVICE_COLLECTION_NAME,
  type DeviceSchema,
  deviceSchemaMap,
} from "./device/devices.ts";

export {
  initialLogInfo,
  LOGS_COLLECTION_NAME,
  LOGS_EVENT,
  LOGS_TYPE,
  type LogSchema,
} from "./log/logs.ts";

export {
  IP_ADDRESS_COLLECTION_NAME,
  type IpAddressSchema,
} from "./network/ip_addresses.ts";

export {
  NETWORK_TYPES_COLLECTION_NAME,
  type NetworkTypeSchema,
} from "./network/network_types.ts";

export {
  DEPARTMENT_COLLECTION_NAME,
  departmentMap,
  type DepartmentSchema,
} from "./staff/departments.ts";
export { USERS_COLLECTION_NAME, type UserSchema } from "./staff/users.ts";
