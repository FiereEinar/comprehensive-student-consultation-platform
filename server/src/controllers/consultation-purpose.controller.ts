import asyncHandler from 'express-async-handler';
import CustomResponse from '../utils/response';
import { RESOURCE_TYPES } from '../constants';
import { logActivity } from '../utils/activity-logger';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from '../constants/http';
import ConsultationPurposeModel from '../models/consultation-purpose';

/**
 * @route POST /api/v1/consultation-purpose
 * @body { purposes: string[] }
 */
export const createConsultationPurpose = asyncHandler(async (req, res) => {
	const { purposes } = req.body;

	appAssert(
		Array.isArray(purposes) && purposes.length > 0,
		BAD_REQUEST,
		'At least one purpose is required',
	);

	const doc = await ConsultationPurposeModel.create({
		purposes,
		createdBy: req.user._id,
	});

	await logActivity(req, {
		action: 'CREATE_CONSULTATION_PURPOSE',
		description: 'Instructor created consultation purpose',
		resourceId: doc._id.toString(),
		resourceType: RESOURCE_TYPES.CONSULTATION_PURPOSE,
	});

	const populated = await ConsultationPurposeModel.findById(doc._id).populate(
		'createdBy',
		'name institutionalID',
	);

	res.json(
		new CustomResponse(
			true,
			populated,
			'Consultation purpose created successfully',
		),
	);
});

/**
 * @route GET /api/v1/consultation-purpose/instructor/:id
 * @desc Get instructor consultation purposes
 */
export const getInstructorConsultationPurposes = asyncHandler(
	async (req, res) => {
		const { id } = req.params;

		appAssert(id, BAD_REQUEST, 'Instructor ID is required');

		const purposes = await ConsultationPurposeModel.findOne({
			createdBy: id,
		}).populate('createdBy', 'name institutionalID');

		res.json(
			new CustomResponse(true, purposes, 'Consultation purposes fetched'),
		);
	},
);

/**
 * @route PATCH /api/v1/consultation-purpose/:id
 * @body { purposes?: string[] }
 */
export const updateConsultationPurpose = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { purposes } = req.body;

	await logActivity(req, {
		action: 'UPDATE_CONSULTATION_PURPOSE',
		description: 'Instructor updated consultation purpose',
		resourceId: id as string,
		resourceType: RESOURCE_TYPES.CONSULTATION_PURPOSE,
	});

	let doc;

	if (!id) {
		doc = await ConsultationPurposeModel.findOne({ createdBy: req.user._id });
	} else {
		doc = await ConsultationPurposeModel.findById(id);
	}

	if (!doc) {
		doc = await ConsultationPurposeModel.create({
			purposes: purposes || [],
			createdBy: req.user._id,
		});

		res.json(
			new CustomResponse(
				true,
				doc,
				'Consultation purpose created successfully',
			),
		);
		return;
	}

	appAssert(
		doc.createdBy.toString() === req.user._id.toString(),
		FORBIDDEN,
		'You are not allowed to update this resource',
	);

	appAssert(
		purposes === undefined || (Array.isArray(purposes) && purposes.length > 0),
		BAD_REQUEST,
		'Purposes must be a non-empty array',
	);

	const updateData: any = {};
	if (purposes !== undefined) updateData.purposes = purposes;

	const updated = await ConsultationPurposeModel.findByIdAndUpdate(
		id,
		updateData,
		{ new: true },
	).populate('createdBy', 'name institutionalID');

	res.json(
		new CustomResponse(
			true,
			updated,
			'Consultation purpose updated successfully',
		),
	);
});

/**
 * @route DELETE /api/v1/consultation-purpose/:id
 */
export const deleteConsultationPurpose = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { purpose } = req.body;

	const doc = await ConsultationPurposeModel.findById(id);
	appAssert(doc, NOT_FOUND, 'Consultation purpose not found');

	appAssert(
		doc.createdBy.toString() === req.user._id.toString(),
		FORBIDDEN,
		'You are not allowed to delete this resource',
	);

	if (doc.purposes.includes(purpose)) {
		doc.purposes.splice(doc.purposes.indexOf(purpose), 1);
		await doc.save();
	}

	await logActivity(req, {
		action: 'DELETE_CONSULTATION_PURPOSE',
		description: 'Instructor deleted a consultation purpose',
		resourceId: id as string,
		resourceType: RESOURCE_TYPES.CONSULTATION_PURPOSE,
	});

	res.json(
		new CustomResponse(true, null, 'Consultation purpose deleted successfully'),
	);
});
