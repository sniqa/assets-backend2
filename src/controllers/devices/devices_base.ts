import { create_log, create_logs, LOGS_EVENT } from 'controllers/log/log.ts'
import { find, remove } from 'curd'
import {
	DeviceBaseModel,
	DeviceBaseSchema,
	deviceBaseSchemaMap,
	ObjectId,
} from 'mongo'
import { ErrCode, faildRes, hasKeys, successRes, whereWasChanged } from 'utils'
import { ClientConfig } from 'ws'

// 创建设备
export const create_device_base = async (
	client: ClientConfig,
	query: Omit<DeviceBaseSchema, '_id'>
) => {
	if (!hasKeys(query, 'device_model', 'device_kind')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const repeat = await DeviceBaseModel.findOne({
		device_model: query.device_model,
	})

	if (repeat) {
		return faildRes(ErrCode.REPEAT_DEVICE_BASE)
	}

	const res = await DeviceBaseModel.insertOne(query)

	create_log({
		who: client.addr.hostname,
		for_who: query.device_model || '',
		event: LOGS_EVENT.CREATE,
		state: true,
		message: `创建${deviceBaseSchemaMap['device_model']}: ${query.device_model}`,
	})

	return successRes(res)
}

// 查找设备
export const find_device_base = async (client: ClientConfig, data: any) =>
	await find({
		collection: DeviceBaseModel,
		query: data,
	})

// 变更设备
export const modify_device_base = async (
	client: ClientConfig,
	query: Partial<DeviceBaseSchema>
) => {
	if (!hasKeys(query, '_id')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const { _id, ...info } = query

	const res = await DeviceBaseModel.findAndModify(
		{
			_id: new ObjectId(_id),
		},
		{
			update: {
				$set: info,
			},
		}
	)

	if (!res) {
		return faildRes({
			errcode: 893,
			errmsg: `更新失败`,
		})
	}

	const [before_update, after_update] = whereWasChanged(
		query,
		res,
		deviceBaseSchemaMap
	)

	create_log({
		who: client.addr.hostname,
		for_who: query.device_model || '',
		event: LOGS_EVENT.UPDATE,
		message: `更新设备基础资料: ${res.device_model || ''}`,
		before_update,
		after_update,
	})

	return successRes(true)
}

// 删除
export const delete_device_bases = async (
	client: ClientConfig,
	ids: Array<string | number>
) => {
	const objectIds = ids.map((id) => new ObjectId(id))

	const target = await DeviceBaseModel.find({
		_id: {
			$in: objectIds,
		},
	}).toArray()

	if (target.length <= 0) {
		return faildRes(ErrCode.ERROR_PARAMETER)
	}

	const r = target.map((t) => ({
		device_model: t.device_model,
		state: true,
		who: client.addr.hostname,
		event: LOGS_EVENT.DELETE,
		for_who: t.device_model,
		message: `删除设备型号: ${t.device_model}`,
	}))

	const res = await remove({
		collection: DeviceBaseModel,
		ids: objectIds,
	})

	res.success && create_logs(r)

	return successRes(res)
}

//删除单个设备
export const delete_device_base = async (
	client: ClientConfig,
	query: Partial<DeviceBaseSchema>
) => {
	if (!hasKeys(query, '_id')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const _id = new ObjectId(query._id)

	const res = await DeviceBaseModel.deleteOne({ _id })

	create_log({
		state: true,
		who: client.addr.hostname,
		event: LOGS_EVENT.DELETE,
		for_who: query?.device_model || '',
		message: `删除设备型号: ${query?.device_model || ''}`,
	})

	return res > 0 ? successRes(res) : faildRes(ErrCode.DELETE_DEVICE_BASE_ERROR)
}
