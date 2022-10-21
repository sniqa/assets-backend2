import { ObjectId } from "mongo";

export const DEPARTMENT_COLLECTION_NAME = "departments";

export interface DepartmentSchema {
  _id: ObjectId;
  department_name: string;
  locations: string[];
}

export const departmentMap = {
  department_name: "部门名称",
  locations: "办公室位置",
};
