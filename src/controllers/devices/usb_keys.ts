import { create_log, LOGS_EVENT } from 'controllers/log/log.ts'
import { find } from 'curd'
import {
	LogSchema,
	ObjectId,
	UsbKeyModel,
	UsbKeysSchema,
	usbKeysSchemaMap,
} from 'mongo'
import { ErrCode, faildRes, hasKeys, successRes, whereWasChanged } from 'utils'
import { ClientConfig } from 'ws'

// 查找数字证书
export const find_usb_key = async (
	client: ClientConfig,
	query: Partial<UsbKeysSchema>
) =>
	await find({
		collection: UsbKeyModel,
		query,
	})

// 创建数字证书
export const create_usb_key = async (
	client: ClientConfig,
	query: Omit<UsbKeysSchema, '_id'>
) => {
	if (!hasKeys(query, 'number')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const isReapt = await UsbKeyModel.findOne({
		number: query.number,
	})

	if (isReapt) {
		return faildRes(ErrCode.USB_KEY_REPEAT)
	}

	const log: Partial<LogSchema> = {
		who: client.addr.hostname,
		for_who: query.number,
		event: LOGS_EVENT.CREATE,
		message: `创建数字证书: ${query.number}`,
	}

	const res = await UsbKeyModel.insertOne(query)

	return res
		? (create_log({ ...log, state: true }), successRes(res))
		: (create_log({ ...log, state: false }),
		  faildRes(ErrCode.USB_KEY_CREATE_ERROR))
}

// 更新数字证书
export const modify_usb_key = async (
	client: ClientConfig,
	query: Partial<UsbKeysSchema>
) => {
	if (!hasKeys(query, '_id')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const { _id, ...resInfo } = query

	const origin = await UsbKeyModel.findAndModify(
		{
			_id: new ObjectId(query._id),
		},
		{
			update: {
				$set: resInfo,
			},
		}
	)

	const log: Partial<LogSchema> = {
		who: client.addr.hostname,
		for_who: query.number || '',
		event: LOGS_EVENT.UPDATE,
		message: `更新数字证书: ${query.number || ''}`,
	}

	if (origin) {
		const [before_update, after_update] = whereWasChanged(
			query,
			origin || {},
			usbKeysSchemaMap
		)

		create_log({ ...log, state: true, before_update, after_update })

		return successRes(true)
	}

	create_log({ ...log, state: false })

	return faildRes(ErrCode.USB_KEY_UPDATE_ERROR)
}

// 删除数字证书
export const delete_usb_key = async (
	client: ClientConfig,
	query: Partial<UsbKeysSchema>
) => {
	if (!hasKeys(query, '_id')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const res = await UsbKeyModel.deleteOne({ _id: new ObjectId(query._id) })

	const log: Partial<LogSchema> = {
		who: client.addr.hostname,
		for_who: query.number || '',
		event: LOGS_EVENT.DELETE,
		message: `删除数字证书: ${query.number}`,
	}

	return res > 0
		? (create_log({ ...log, state: true }), successRes(res))
		: (create_log({ ...log, state: false }),
		  faildRes(ErrCode.USB_KEY_DELETE_ERROR))
}
