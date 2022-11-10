import { ObjectId } from "mongo";

export const JOB_ASSIGNMENT_NAME = "job_assignment";

export interface JobAssignmentSchema {
  _id: ObjectId;
  user: string;
  job_title: string;
  job_content: string;
  timestamp: number;
  ip_address: string;
  passed_state: JobPassState;
  refuse_reason?: string;
  completed?: boolean;
}

export enum JobPassState {
  Allow = "通过",
  Refuse = "拒绝",
  Pengding = "等待",
}

export const JobAssignmentMap = {
  user: "申请人",
  job_title: "标题",
  job_content: "内容",
  passed_state: "状态",
  refuse_reason: "拒绝理由",
  completed: "完成",
};
