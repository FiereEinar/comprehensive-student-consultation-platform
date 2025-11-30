import bcrypt from 'bcryptjs';
import UserModel, { IUser, UserTypes } from '../models/user.model';
import RoleModel, { IRole } from '../models/role.model';
import { MODULES, SUPER_ADMIN } from '../constants';

interface AdminSeedOptions {
	name: string;
	email: string;
	institutionalID: string;
	password: string;
}

export const seedAdmin = async (options: AdminSeedOptions) => {
	try {
		// Check if admin already exists
		const existingAdmin = await UserModel.findOne({ email: options.email });
		if (existingAdmin) {
			console.log('Admin account already exists:', options.email);
			const role = await createSuperAdminRole(existingAdmin);
			existingAdmin.adminRole = role?._id;
			await existingAdmin.save();
			return;
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(options.password, 10);

		// Create admin user
		const admin = await UserModel.create({
			name: options.name,
			email: options.email,
			institutionalID: options.institutionalID,
			password: hashedPassword,
			role: 'admin' as UserTypes,
			googleID: '',
			googleCalendarTokens: null,
		});

		const role = await createSuperAdminRole(admin);
		admin.adminRole = role?._id;
		await admin.save();

		console.log('Admin account created:', admin.email);
	} catch (err) {
		console.error('Failed to seed admin account:', err);
	}
};

const createSuperAdminRole = async (
	admin: IUser
): Promise<IRole | undefined> => {
	try {
		const superAdminRole = await RoleModel.findOne({ name: SUPER_ADMIN });
		if (superAdminRole) {
			console.log('Super admin role already exists');
			return superAdminRole;
		}

		const permissions = Object.values(MODULES).map((module) => module);

		const role = await RoleModel.create({
			name: SUPER_ADMIN,
			description: 'Super admin role',
			permissions: permissions,
			createdBy: admin._id,
		});
		console.log('Super admin role created');
		return role;
	} catch (err) {
		console.error('Failed to create super admin role:', err);
	}
};
