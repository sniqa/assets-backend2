import { httpServer } from "http";
import { jsonDispatch } from "jsonDispatch";
import { RouterContext } from "oak";
import { faildRes } from "utils";
import * as csv from "https://deno.land/std@0.160.0/encoding/csv.ts";
import { create_user } from "controllers/staff/user.ts";
import { create_device } from "controllers/devices/devices.ts";

import * as devices from "controllers/devices/devices.ts";
import * as devices_base from "controllers/devices/devices_base.ts";
import * as usb_keys from "controllers/devices/usb_keys.ts";
import { delete_logs, find_logs } from "controllers/log/log.ts";
import { find_ips } from "controllers/network/ip_address.ts";
import * as network_type from "controllers/network/network_type.ts";
import * as department from "controllers/staff/department.ts";
import * as user from "controllers/staff/user.ts";
import * as job_assignment from "controllers/job/job_assignment.ts";
import { ClientConfig } from "./src/ws.ts";

const dispatch = jsonDispatch({
  ...devices_base,
  ...devices,
  ...usb_keys,
  ...network_type,
  ...department,
  ...user,
  ...job_assignment,
  find_logs,
  delete_logs,
  find_ips,
});

const router = httpServer({ port: 8083 });

router.post("/phl", async (ctx: RouterContext<"/phl">) => {
  const data = await ctx.request.body().value;

  const client = {
    addr: {
      hostname: ctx.request.ip,
    },
  };

  const res = await dispatch(await data, client).catch((err) =>
    faildRes({
      errcode: 1004,
      errmsg: err,
    })
  );

  ctx.response.body = res;
});

router.post(
  "/upload_devices",
  async (ctx: RouterContext<"/upload_devices">, next: any) => {
    const body = ctx.request.body();

    if (body.type === "form-data") {
      const ts = await body.value.read({
        outPath: "./uploads",
      });

      if (ts.files) {
        const file = ts.files[0];

        const content = csv.parse(Deno.readTextFileSync(file.filename || ""));

        const header = content.shift();

        if (
          !validationCsvHeader(header || [], [
            "使用人",
            "物理位置",
            "网络类型",
            "IP地址",
            "MAC",
            "设备型号",
            "设备类别",
            "系统版本",
            "磁盘SN",
            "备注",
          ])
        ) {
          return ctx.response.body = {
            success: false,
          };
        }

        const client = {
          addr: {
            hostname: ctx.request.ip,
          },
        } as ClientConfig;

        const res = await Promise.all(content.map((row) => {
          const device = {
            user: row[0].trim() || "",
            location: row[1].trim() || "",
            network_type: row[2].trim() || "",
            ip_address: row[3].trim() || "",
            mac: row[4].trim() || "",
            device_model: row[5].trim() || "",
            device_category: row[6].trim() || "",
            system_version: row[7].trim() || "",
            disk_sn: row[8].trim() || "",
            remark: row[9].trim() || "",
          };

          return create_device(client, device);
        }));

        Deno.remove(file.filename || "");

        return ctx.response.body = res;
      }
    }
  },
);

router.post(
  "/upload_users",
  async (ctx: RouterContext<"/upload_users">, next: any) => {
    const body = ctx.request.body();

    if (body.type === "form-data") {
      const ts = await body.value.read({
        outPath: "./uploads",
      });

      if (ts.files) {
        const file = ts.files[0];

        const content = csv.parse(Deno.readTextFileSync(file.filename || ""));

        const header = content.shift();

        if (!validationCsvHeader(header || [], ["用户名称", "部门", "办公室", "备注"])) {
          return ctx.response.body = {
            success: false,
          };
        }

        const client = {
          addr: {
            hostname: ctx.request.ip,
          },
        } as ClientConfig;

        const res = await Promise.all(content.map((row) => {
          const user = {
            username: row[0].trim() || "",
            department: row[1].trim() || "",
            location: row[2].trim() || "",
            remark: row[3].trim() || "",
          };

          return create_user(client, user);
        }));

        Deno.remove(file.filename || "");

        return ctx.response.body = res;
      }
    }
  },
);

// const wsHandler: WsHandler = async (client, event) => {
//   try {
//     const data = JSON.parse(event.data);

//     const result = await dispatch(data, client);

//     client.socket.send(JSON.stringify(result));
//   } catch {
//     client.socket.send(JSON.stringify(ErrCode.REQUIRED_JSON));
//   }
// };

// ws({
//   port: 8082,
// }, wsHandler);

const validationCsvHeader = (csvHeader: string[], args: string[]) =>
  args.every((arg, index) => {
    return arg === csvHeader[index].trim();
  });
