import { ObjectId } from "mongo";

export const USERS_COLLECTION_NAME = "users";

export interface UserSchema {
  _id: ObjectId;
  // account: string
  username: string;
  // password: string
  department: string;
  location: string;
  // role: string
  remark: string;
}

export const userSchemaMap: Omit<UserSchema, "_id"> = {
  username: "用户名称",
  department: "部门",
  location: "办公室",
  remark: "备注",
};
