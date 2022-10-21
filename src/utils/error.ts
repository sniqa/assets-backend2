interface ErrorRes {
  errmsg: string;
  errcode: number;
}

interface ErrCodeType {
  [x: string]: ErrorRes;
}

export const ErrCode: ErrCodeType = {
  REQUIRED_JSON: {
    errcode: 402,
    errmsg: "要求为json格式",
  },
  MISSING_PARAMETER: {
    errcode: 403,
    errmsg: "缺失必要的参数",
  },
  ERROR_PARAMETER: {
    errcode: 408,
    errmsg: "错误的参数",
  },
  USER_ALREADY_EXISTS: {
    errcode: 501,
    errmsg: "用户已存在",
  },
  USER_INFO_UPDATE_ERROR: {
    errcode: 501,
    errmsg: "修改用户信息失败",
  },
  USER_DELETE_ERROR: {
    errcode: 502,
    errmsg: "删除用户失败",
  },
  NETWORK_TYPE_EXISTS: {
    errcode: 601,
    errmsg: "网络类型已存在",
  },
  INSERT_NETWORK_TYPE_ERROR: {
    errcode: 601,
    errmsg: "插入网络类型失败",
  },
  DELETE_NETWORK_TYPE_ERROR: {
    errcode: 602,
    errmsg: " 删除网络类型失败",
  },
  ILLEGAL_IP_FORMAT: {
    errcode: 701,
    errmsg: "IP格式不正确",
  },
  INSERT_IP_RANGE_ERROR: {
    errcode: 702,
    errmsg: "插入ip地址段失败",
  },
  ILLEGAL_MAC_FORMAT: {
    errcode: 703,
    errmsg: "mac格式不正确",
  },
  MAC_REPEAT: {
    errcode: 704,
    errmsg: "mac地址重复!",
  },
  IP_REPEAT: {
    errcode: 705,
    errmsg: "IP地址重复!",
  },
  REPEAT_DEPARTMENT: {
    errcode: 801,
    errmsg: `部门名称已经存在`,
  },
  REPEAT: {
    errcode: 801,
    errmsg: `已经存在,不能重复创建`,
  },
  UPDATE_ERROR: {
    errcode: 802,
    errmsg: `更新失败,请重试!`,
  },
};
// 缺失参数
// export const MISSING_PARAMETER: ErrorRes = {
// 	errcode: 403,
// 	errmsg: '缺失必要的参数',
// }
