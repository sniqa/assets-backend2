import { ObjectId } from 'mongo'

export const USB_KEYS_COLLECTION_NAME = 'usb_keys'

export interface UsbKeysSchema {
	_id: ObjectId
	number: string
	user: string
	enable_time: string
	collection_time: string
	remark: string
}

export const usbKeysSchemaMap: Omit<UsbKeysSchema, '_id'> = {
	number: '证书编号',
	user: '使用人',
	enable_time: '启用时间',
	collection_time: '领用时间',
	remark: '备注',
}
