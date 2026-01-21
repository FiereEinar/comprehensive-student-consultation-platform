import asyncHandler from 'express-async-handler';
import RoleModel from '../models/role.model';
import CustomResponse, { CustomPaginatedResponse } from '../utils/response';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, NOT_FOUND } from '../constants/http';
import { logActivity } from '../utils/activity-logger';
import { decryptFields } from '../services/encryption';
import {
	DEFAULT_LIMIT,
	RESOURCE_TYPES,
	MODULES,
	Modules,
	SUPER_ADMIN,
} from '../constants';

const roleModelEncryptedFields = ['name', 'description'];

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
		.populate('createdBy', 'name institutionalID')
		.skip(skip)
		.limit(limit)
		.exec();

	let roles = rolesRaw.map((role) => {
		const base = role.toObject();
		return decryptFields(base, roleModelEncryptedFields);
	});

	const total = await RoleModel.countDocuments(filter);

	// calculate pagination
	const next = skip + limit < total ? numericPage + 1 : -1;
	const prev = numericPage > 1 ? numericPage - 1 : -1;

	res.json(
		new CustomPaginatedResponse(true, roles, 'Roles fetched', next, prev),
	);
});

/**
 * @route GET /api/v1/role/:roleID
 */
export const getSingleRole = asyncHandler(async (req, res) => {
	const { roleID } = req.params;

	const role = await RoleModel.findById(roleID)
		.populate('createdBy', 'name institutionalID')
		.exec();

	appAssert(role, NOT_FOUND, 'Role not found');

	const decryptedRole = decryptFields(
		role.toObject(),
		roleModelEncryptedFields,
	);

	res.json(new CustomResponse(true, decryptedRole, 'Role fetched'));
});

/**
 * @route POST /api/v1/role
 * @body { name: string, description?: string, permissionIds: string[] }
 */
export const createRole = asyncHandler(async (req, res) => {
	const { name, description } = req.body;

	appAssert(name, BAD_REQUEST, 'Role name is required');

	appAssert(
		name !== SUPER_ADMIN,
		BAD_REQUEST,
		'Cannot create Super Admin role',
	);

	const role = await RoleModel.create({
		name,
		description,
		permissions: [],
		createdBy: req.user._id,
	});

	await logActivity(req, {
		action: 'CREATE_ROLE',
		description: 'Create new role',
		resourceId: undefined,
		resourceType: RESOURCE_TYPES.ROLE,
	});

	const populatedRole = await RoleModel.findById(role._id)
		.populate('permissions')
		.populate('createdBy', 'name institutionalID');

	res.json(
		new CustomResponse(
			true,
			decryptFields(populatedRole?.toObject(), roleModelEncryptedFields),
			'Role created successfully',
		),
	);
});

/**
 * @route PATCH /api/v1/role/:roleID
 * @body { name?: string, description?: string, permissions?: string[] }
 */
export const updateRole = asyncHandler(async (req, res) => {
	const { roleID } = req.params;
	const { name, description, permissions } = req.body;

	const role = await RoleModel.findById(roleID);
	appAssert(role, NOT_FOUND, 'Role not found');

	appAssert(
		role.name !== SUPER_ADMIN,
		BAD_REQUEST,
		'Cannot update Super Admin role',
	);

	// Validate permissions
	if (permissions && permissions.length > 0) {
		const validPermissions = Object.values(MODULES);
		const invalidPermissions = permissions.filter(
			(perm: string) => !validPermissions.includes(perm as Modules),
		);
		appAssert(
			invalidPermissions.length === 0,
			BAD_REQUEST,
			`Invalid permissions: ${invalidPermissions.join(', ')}`,
		);
	}

	await logActivity(req, {
		action: 'UPDATE_ROLE',
		description: 'Update role',
		resourceId: Array.isArray(roleID) ? roleID[0] : roleID,
		resourceType: RESOURCE_TYPES.ROLE,
	});

	const updateData: any = {};
	if (name !== undefined) updateData.name = name;
	if (description !== undefined) updateData.description = description;
	if (permissions !== undefined) updateData.permissions = permissions;

	const updatedRole = await RoleModel.findByIdAndUpdate(roleID, updateData, {
		new: true,
	}).populate('createdBy', 'name institutionalID');

	res.json(
		new CustomResponse(
			true,
			decryptFields(updatedRole?.toObject(), roleModelEncryptedFields),
			'Role updated successfully',
		),
	);
});

/**
 * @route DELETE /api/v1/role/:roleID
 */
export const deleteRole = asyncHandler(async (req, res) => {
	const { roleID } = req.params;

	const role = await RoleModel.findById(roleID);
	appAssert(role, NOT_FOUND, 'Role not found');
	appAssert(
		role.name !== SUPER_ADMIN,
		BAD_REQUEST,
		'Cannot delete Super Admin role',
	);

	await logActivity(req, {
		action: 'DELETE_ROLE',
		description: 'Delete role',
		resourceId: Array.isArray(roleID) ? roleID[0] : roleID,
		resourceType: RESOURCE_TYPES.ROLE,
	});

	await RoleModel.findByIdAndDelete(roleID);

	res.json(new CustomResponse(true, null, 'Role deleted successfully'));
});
