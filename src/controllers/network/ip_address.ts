import { create_log } from 'controllers/log/log.ts'
import { find } from 'curd'
import {
	ipAddressMap,
	IpAddressModel,
	IpAddressSchema,
	LogSchema,
	LOGS_EVENT,
} from 'mongo'
import {
	ErrCode,
	faildRes,
	getCurrentTime,
	hasKeys,
	successRes,
	whereWasChanged,
} from 'utils'
import { ClientConfig } from 'ws'

// 查找ip
export const find_ips = async (client: ClientConfig, data: any) => {
	return await find({
		collection: IpAddressModel,
		query: data,
		sort: 1,
	})
}

// 更新ip
export const modify_ip = async (
	client: ClientConfig,
	query: Partial<IpAddressSchema>
) => {
	if (!hasKeys(query, 'network_type', 'ip_address')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const { current_time } = getCurrentTime()

	const res = await IpAddressModel.findAndModify(
		{
			network_type: query.network_type,
			ip_address: query.ip_address,
		},
		{
			update: {
				$set: {
					is_used: query.is_used,
					username: query.username,
					enable_time: current_time,
				},
			},
		}
	)

	const [before_update, after_update] = whereWasChanged(
		query,
		res || {},
		ipAddressMap
	)

	const log: Partial<LogSchema> = {
		who: client.addr.hostname,
		for_who: query.ip_address,
		event: LOGS_EVENT.UPDATE,
		before_update,
		after_update,
		message: `变更IP地址: ${query.ip_address}信息`,
	}

	return res
		? (create_log({ ...log, state: true }), successRes(true))
		: (create_log({ ...log, state: false }), faildRes(ErrCode.IP_UPDATE_ERROR))
}

// 分配ip给人员
// export const assign_ip_to_person = async (client: ClientConfig, data: any) => {
//   console.log(data);

//   const res = await update({
//     collection: IpAddressModel,
//     query: data,
//     params_verify: ["ip_address", "username"],
//   });

//   console.log("res", res);

//   return successRes(res);
// };

// 分配IP给设备
// export const assign_ip_to_device = async (client: ClientConfig, data: any) => {
//   return await update({
//     collection: IpAddressModel,
//     query: { ...data, is_used: true },
//     params_verify: ["ip_address", "username"],
//   });
// };
