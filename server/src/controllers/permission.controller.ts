// import asyncHandler from 'express-async-handler';
// import PermissionModel from '../models/permission.model';
// import CustomResponse, { CustomPaginatedResponse } from '../utils/response';
// import appAssert from '../errors/app-assert';
// import { BAD_REQUEST, NOT_FOUND } from '../constants/http';
// import { DEFAULT_LIMIT, RESOURCE_TYPES } from '../constants';
// import { logActivity } from '../utils/activity-logger';
// import { decryptFields } from '../utils/encryption';

// const permissionModelEncryptedFields = [
// 	'name',
// 	'description',
// 	'resource',
// 	'action',
// ];

// /**
//  * @route GET /api/v1/permission
//  * @query page=1
//  * @query pageSize=10
//  * @query search=keyword
//  * @query resource=filter by resource
//  */
// export const getPermissions = asyncHandler(async (req, res) => {
// 	const {
// 		page = 1,
// 		pageSize = DEFAULT_LIMIT,
// 		search = '',
// 		resource = '',
// 	} = req.query as Record<string, string>;

// 	const numericPage = Number(page);
// 	const limit = Number(pageSize);
// 	const skip = (numericPage - 1) * limit;

// 	/** ---------------------
// 	 *        FILTERS
// 	 *  --------------------*/
// 	const filter: Record<string, any> = {};

// 	// filter by resource (optional)
// 	if (resource.trim() !== '') {
// 		filter.resource = resource;
// 	}

// 	// search: name, description, resource, action
// 	if (search.trim() !== '') {
// 		const regex = { $regex: search, $options: 'i' };
// 		filter.$or = [
// 			{ name: regex },
// 			{ description: regex },
// 			{ resource: regex },
// 			{ action: regex },
// 		];
// 	}

// 	/** ---------------------
// 	 *     FETCH DATA
// 	 *  --------------------*/
// 	const permissionsRaw = await PermissionModel.find(filter)
// 		.populate('createdBy', 'name institutionalID')
// 		.skip(skip)
// 		.limit(limit)
// 		.exec();

// 	let permissions = permissionsRaw.map((perm) =>
// 		decryptFields(perm.toObject(), permissionModelEncryptedFields)
// 	);

// 	const total = await PermissionModel.countDocuments(filter);

// 	// calculate pagination
// 	const next = skip + limit < total ? numericPage + 1 : -1;
// 	const prev = numericPage > 1 ? numericPage - 1 : -1;

// 	res.json(
// 		new CustomPaginatedResponse(
// 			true,
// 			permissions,
// 			'Permissions fetched',
// 			next,
// 			prev
// 		)
// 	);
// });

// /**
//  * @route GET /api/v1/permission/:permissionID
//  */
// export const getSinglePermission = asyncHandler(async (req, res) => {
// 	const { permissionID } = req.params;

// 	const permission = await PermissionModel.findById(permissionID)
// 		.populate('createdBy', 'name institutionalID')
// 		.exec();

// 	appAssert(permission, NOT_FOUND, 'Permission not found');

// 	const decryptedPermission = decryptFields(
// 		permission.toObject(),
// 		permissionModelEncryptedFields
// 	);

// 	res.json(new CustomResponse(true, decryptedPermission, 'Permission fetched'));
// });

// /**
//  * @route POST /api/v1/permission
//  * @body { name: string, description?: string, resource: string, action: string }
//  */
// export const createPermission = asyncHandler(async (req, res) => {
// 	const { name, description, resource, action } = req.body;

// 	appAssert(name, BAD_REQUEST, 'Permission name is required');
// 	appAssert(resource, BAD_REQUEST, 'Resource is required');
// 	appAssert(action, BAD_REQUEST, 'Action is required');

// 	await logActivity(req, {
// 		action: 'CREATE_PERMISSION',
// 		description: 'Create new permission',
// 		resourceId: undefined,
// 		resourceType: RESOURCE_TYPES.PERMISSION,
// 	});

// 	const permission = await PermissionModel.create({
// 		name,
// 		description,
// 		resource,
// 		action,
// 		createdBy: req.user._id,
// 	});

// 	const populatedPermission = await PermissionModel.findById(
// 		permission._id
// 	).populate('createdBy', 'name institutionalID');

// 	res.json(
// 		new CustomResponse(
// 			true,
// 			decryptFields(
// 				populatedPermission?.toObject(),
// 				permissionModelEncryptedFields
// 			),
// 			'Permission created successfully'
// 		)
// 	);
// });

// /**
//  * @route PATCH /api/v1/permission/:permissionID
//  * @body { name?: string, description?: string, resource?: string, action?: string }
//  */
// export const updatePermission = asyncHandler(async (req, res) => {
// 	const { permissionID } = req.params;
// 	const { name, description, resource, action } = req.body;

// 	const permission = await PermissionModel.findById(permissionID);
// 	appAssert(permission, NOT_FOUND, 'Permission not found');

// 	await logActivity(req, {
// 		action: 'UPDATE_PERMISSION',
// 		description: 'Update permission',
// 		resourceId: permissionID,
// 		resourceType: RESOURCE_TYPES.PERMISSION,
// 	});

// 	const updateData: any = {};
// 	if (name !== undefined) updateData.name = name;
// 	if (description !== undefined) updateData.description = description;
// 	if (resource !== undefined) updateData.resource = resource;
// 	if (action !== undefined) updateData.action = action;

// 	const updatedPermission = await PermissionModel.findByIdAndUpdate(
// 		permissionID,
// 		updateData,
// 		{ new: true }
// 	).populate('createdBy', 'name institutionalID');

// 	res.json(
// 		new CustomResponse(
// 			true,
// 			decryptFields(
// 				updatedPermission?.toObject(),
// 				permissionModelEncryptedFields
// 			),
// 			'Permission updated successfully'
// 		)
// 	);
// });

// /**
//  * @route DELETE /api/v1/permission/:permissionID
//  */
// export const deletePermission = asyncHandler(async (req, res) => {
// 	const { permissionID } = req.params;

// 	const permission = await PermissionModel.findById(permissionID);
// 	appAssert(permission, NOT_FOUND, 'Permission not found');

// 	await logActivity(req, {
// 		action: 'DELETE_PERMISSION',
// 		description: 'Delete permission',
// 		resourceId: permissionID,
// 		resourceType: RESOURCE_TYPES.PERMISSION,
// 	});

// 	await PermissionModel.findByIdAndDelete(permissionID);

// 	res.json(new CustomResponse(true, null, 'Permission deleted successfully'));
// });
