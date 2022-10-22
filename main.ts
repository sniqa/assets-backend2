import { ws, WsHandler } from "ws";
import { ErrCode } from "utils";
import { jsonDispatch } from "jsonDispatch";

import * as devices_base from "controllers/devices/devices_base.ts";
import * as devices from "controllers/devices/devices.ts";
import * as usb_keys from "controllers/devices/usb_keys.ts";
import { find_ips } from "controllers/network/ip_address.ts";
import * as network_type from "controllers/network/network_type.ts";
import * as department from "controllers/staff/department.ts";
import * as user from "controllers/staff/user.ts";
import { find_logs } from "controllers/log/log.ts";
const dispatch = jsonDispatch({
  ...devices_base,
  ...devices,
  ...usb_keys,
  ...network_type,
  ...department,
  ...user,
  find_logs,
  find_ips,
});

const wsHandler: WsHandler = async (client, event) => {
  try {
    const data = JSON.parse(event.data);

    const result = await dispatch(data, client);

    client.socket.send(JSON.stringify(result));
  } catch {
    client.socket.send(JSON.stringify(ErrCode.REQUIRED_JSON));
  }
};

ws({
  port: 8082,
}, wsHandler);
