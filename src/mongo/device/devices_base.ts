import { ObjectId } from 'mongo'

export const DEVICE_BASE_COLLECTION_NAME = 'devices_base'

export interface DeviceBaseSchema {
	_id: ObjectId
	vendor: string
	device_model: string //设备型号
	device_category: string
	device_kind: string //设备类型
	manufacture_date: string //出厂日期
	shelf_life: string //保质期
}

export const deviceBaseSchemaMap: Omit<DeviceBaseSchema, '_id'> = {
	vendor: '设备品牌',
	device_model: '设备型号',
	device_category: '设备分类',
	device_kind: '设备类型',
	manufacture_date: '出厂日期',
	shelf_life: '保质期',
}
