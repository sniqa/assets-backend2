import { ws, WsHandler } from "ws";
import { ErrCode } from "utils";
import { jsonDispatch } from "jsonDispatch";

import * as test from "controllers/test.ts";
import * as devices_base from "controllers/devices/devices_base.ts";

const dispatch = jsonDispatch({ ...devices_base });

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
