import asyncHandler from 'express-async-handler';
import RoleModel from '../models/role.model';
import PermissionModel from '../models/permission.model';
import CustomResponse, { CustomPaginatedResponse } from '../utils/response';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, NOT_FOUND } from '../constants/http';
import { DEFAULT_LIMIT, RESOURCE_TYPES } from '../constants';
import { logActivity } from '../utils/activity-logger';
import { decryptFields } from '../utils/encryption';

const roleModelEncryptedFields = ['name', 'description'];
const permissionModelEncryptedFields = [
	'name',
	'description',
	'resource',
	'action',
];

/**
 * @route GET /api/v1/role
 * @query page=1
 * @query pageSize=10
 * @query search=keyword
 */
export const getRoles = asyncHandler(async (req, res) => {
	const {
		page = 1,
		pageSize = DEFAULT_LIMIT,
		search = '',
	} = req.query as Record<string, string>;

	const numericPage = Number(page);
	const limit = Number(pageSize);
	const skip = (numericPage - 1) * limit;

	/** ---------------------
	 *        FILTERS
	 *  --------------------*/
	const filter: Record<string, any> = {};

	// search: name, description
	if (search.trim() !== '') {
		const regex = { $regex: search, $options: 'i' };
		filter.$or = [{ name: regex }, { description: regex }];
	}

	/** ---------------------
	 *     FETCH DATA
	 *  --------------------*/
	const rolesRaw = await RoleModel.find(filter)
		.populate('permissions')
		.populate('createdBy', 'name institutionalID')
		.skip(skip)
		.limit(limit)
		.exec();

	let roles = rolesRaw.map((role) => {
		const base = role.toObject();
		return decryptFields(base, roleModelEncryptedFields);
	});

	// Decrypt permissions within roles
	roles = roles.map((role) => ({
		...role,
		permissions:
			role.permissions?.map((perm: any) =>
				decryptFields(perm, permissionModelEncryptedFields)
			) || [],
	}));

	const total = await RoleModel.countDocuments(filter);

	// calculate pagination
	const next = skip + limit < total ? numericPage + 1 : -1;
	const prev = numericPage > 1 ? numericPage - 1 : -1;

	res.json(
		new CustomPaginatedResponse(true, roles, 'Roles fetched', next, prev)
	);
});

/**
 * @route GET /api/v1/role/:roleID
 */
export const getSingleRole = asyncHandler(async (req, res) => {
	const { roleID } = req.params;

	const role = await RoleModel.findById(roleID)
		.populate('permissions')
		.populate('createdBy', 'name institutionalID')
		.exec();

	appAssert(role, NOT_FOUND, 'Role not found');

	const decryptedRole = decryptFields(
		role.toObject(),
		roleModelEncryptedFields
	);
	decryptedRole.permissions =
		decryptedRole.permissions?.map((perm: any) =>
			decryptFields(perm, permissionModelEncryptedFields)
		) || [];

	res.json(new CustomResponse(true, decryptedRole, 'Role fetched'));
});

/**
 * @route POST /api/v1/role
 * @body { name: string, description?: string, permissionIds: string[] }
 */
export const createRole = asyncHandler(async (req, res) => {
	const { name, description, permissionIds } = req.body;

	appAssert(name, BAD_REQUEST, 'Role name is required');

	// Check if permissions exist
	if (permissionIds && permissionIds.length > 0) {
		const permissions = await PermissionModel.find({
			_id: { $in: permissionIds },
		});
		appAssert(
			permissions.length === permissionIds.length,
			BAD_REQUEST,
			'One or more permissions not found'
		);
	}

	await logActivity(req, {
		action: 'CREATE_ROLE',
		description: 'Create new role',
		resourceId: undefined,
		resourceType: RESOURCE_TYPES.ROLE,
	});

	const role = await RoleModel.create({
		name,
		description,
		permissions: permissionIds || [],
		createdBy: req.user._id,
	});

	const populatedRole = await RoleModel.findById(role._id)
		.populate('permissions')
		.populate('createdBy', 'name institutionalID');

	res.json(
		new CustomResponse(
			true,
			decryptFields(populatedRole?.toObject(), roleModelEncryptedFields),
			'Role created successfully'
		)
	);
});

/**
 * @route PATCH /api/v1/role/:roleID
 * @body { name?: string, description?: string, permissionIds?: string[] }
 */
export const updateRole = asyncHandler(async (req, res) => {
	const { roleID } = req.params;
	const { name, description, permissionIds } = req.body;

	const role = await RoleModel.findById(roleID);
	appAssert(role, NOT_FOUND, 'Role not found');

	// Check if permissions exist
	if (permissionIds && permissionIds.length > 0) {
		const permissions = await PermissionModel.find({
			_id: { $in: permissionIds },
		});
		appAssert(
			permissions.length === permissionIds.length,
			BAD_REQUEST,
			'One or more permissions not found'
		);
	}

	await logActivity(req, {
		action: 'UPDATE_ROLE',
		description: 'Update role',
		resourceId: roleID,
		resourceType: RESOURCE_TYPES.ROLE,
	});

	const updateData: any = {};
	if (name !== undefined) updateData.name = name;
	if (description !== undefined) updateData.description = description;
	if (permissionIds !== undefined) updateData.permissions = permissionIds;

	const updatedRole = await RoleModel.findByIdAndUpdate(roleID, updateData, {
		new: true,
	})
		.populate('permissions')
		.populate('createdBy', 'name institutionalID');

	res.json(
		new CustomResponse(
			true,
			decryptFields(updatedRole?.toObject(), roleModelEncryptedFields),
			'Role updated successfully'
		)
	);
});

/**
 * @route DELETE /api/v1/role/:roleID
 */
export const deleteRole = asyncHandler(async (req, res) => {
	const { roleID } = req.params;

	const role = await RoleModel.findById(roleID);
	appAssert(role, NOT_FOUND, 'Role not found');

	await logActivity(req, {
		action: 'DELETE_ROLE',
		description: 'Delete role',
		resourceId: roleID,
		resourceType: RESOURCE_TYPES.ROLE,
	});

	await RoleModel.findByIdAndDelete(roleID);

	res.json(new CustomResponse(true, null, 'Role deleted successfully'));
});
