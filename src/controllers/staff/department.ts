import { create_log } from 'controllers/log/log.ts'
import { find } from 'curd'
import { ErrCode, faildRes, hasKeys, successRes, whereWasChanged } from 'utils'
import { ClientConfig } from 'ws'
import {
	departmentMap,
	DepartmentModel,
	DepartmentSchema,
	LogSchema,
	LOGS_EVENT,
	ObjectId,
	UpdateFilter,
} from '../../mongo/mod.ts'

// 创建
export const create_department = async (
	client: ClientConfig,
	data: Omit<DepartmentSchema, '_id'>
) => {
	if (!hasKeys(data, 'department_name')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	if (
		await DepartmentModel.findOne({ department_name: data.department_name })
	) {
		return faildRes(ErrCode.REPEAT_DEPARTMENT)
	}

	const res = await DepartmentModel.insertOne(data)

	const log: Partial<LogSchema> = {
		who: client.addr.hostname,
		for_who: data.department_name,
		event: LOGS_EVENT.CREATE,
		message: `创建部门: ${data.department_name}`,
	}

	console.log(res)

	return res
		? (create_log({ ...log, state: true }), successRes({ _id: res }))
		: (create_log({ ...log, state: false }),
		  faildRes(ErrCode.DEPARTMENT_CREATE_ERROR))
}

// 查询
export const find_departments = async (
	client: ClientConfig,
	data: Partial<DepartmentSchema>
) =>
	await find({
		collection: DepartmentModel,
		query: data,
	})

// 删除
export const delete_department = async (
	client: ClientConfig,
	data: Partial<DepartmentSchema>
) => {
	if (!hasKeys(data, '_id')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const res = await DepartmentModel.deleteOne({ _id: new ObjectId(data._id) })

	const log: Partial<LogSchema> = {
		who: client.addr.hostname,
		for_who: data.department_name || '',
		event: LOGS_EVENT.DELETE,
		message: `删除部门: ${data.department_name || ''}`,
	}

	return res > 0
		? (create_log({ ...log, state: true }), successRes(true))
		: (create_log({ ...log, state: false }),
		  faildRes(ErrCode.DEPARTMENT_DELETE_ERROR))
}

//删除所有
export const delete_all_department = async (
	client: ClientConfig,
	data: string[]
) => {}

// 变更
export const modify_department = async (
	client: ClientConfig,
	data: Partial<DepartmentSchema>
) => {
	if (!hasKeys(data, '_id')) {
		return faildRes(ErrCode.MISSING_PARAMETER)
	}

	const { _id, ...res } = data

	const oldData = await DepartmentModel.findAndModify(
		{
			_id: new ObjectId(data._id),
		},
		{
			update: { $set: res } as UpdateFilter<DepartmentSchema>,
		}
	)

	const log: Partial<LogSchema> = {
		who: client.addr.hostname,
		for_who: data.department_name || '',
		event: LOGS_EVENT.UPDATE,
		message: `更新部门: ${data.department_name || ''}`,
	}

	if (oldData) {
		const [before_update, after_update] = whereWasChanged(
			res,
			oldData,
			departmentMap
		)

		create_log({ ...log, state: true, before_update, after_update })

		return successRes(data)
	}

	create_log({ ...log, state: false })

	return faildRes(ErrCode.DEPARTMENT_UPDATE_ERROR)
}
