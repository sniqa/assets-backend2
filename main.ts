import { httpServer } from 'http'
import { jsonDispatch } from 'jsonDispatch'
import { RouterContext } from 'oak'
import { faildRes } from 'utils'

import * as devices from 'controllers/devices/devices.ts'
import * as devices_base from 'controllers/devices/devices_base.ts'
import * as usb_keys from 'controllers/devices/usb_keys.ts'
import { delete_logs, find_logs } from 'controllers/log/log.ts'
import { find_ips } from 'controllers/network/ip_address.ts'
import * as network_type from 'controllers/network/network_type.ts'
import * as department from 'controllers/staff/department.ts'
import * as user from 'controllers/staff/user.ts'

const dispatch = jsonDispatch({
	...devices_base,
	...devices,
	...usb_keys,
	...network_type,
	...department,
	...user,
	find_logs,
	delete_logs,
	find_ips,
})

const router = httpServer({ port: 8083 })

router.post('/phl', async (ctx: RouterContext<'/phl'>) => {
	const data = await ctx.request.body().value

	const client = {
		addr: {
			hostname: ctx.request.ip,
		},
	}

	const res = await dispatch(await data, client).catch((err) =>
		faildRes({
			errcode: 1004,
			errmsg: err,
		})
	)

	ctx.response.body = res
})

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
