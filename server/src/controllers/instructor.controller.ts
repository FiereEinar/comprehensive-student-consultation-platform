import asyncHandler from 'express-async-handler';
import appAssert from '../errors/app-assert';
import { FORBIDDEN, NOT_FOUND } from '../constants/http';
import {
	createSectionSchema,
	createSubjectSchema,
	updateSectionSchema,
	updateSubjectSchema,
} from '../schemas/subject.schema';
import SubjectModel from '../models/subject.model';
import CustomResponse from '../utils/response';
import SectionModel from '../models/section.model';

/**
 * @route GET /api/v1/instructor/subjects
 * @desc Get all subjects created by the current instructor
 */
export const getSubjects = asyncHandler(async (req, res) => {
	const user = req.user;
	appAssert(user?.role === 'instructor', FORBIDDEN, 'Access denied.');

	const subjects = await SubjectModel.find({ instructor: user._id }).sort({
		createdAt: -1,
	});

	res.json(
		new CustomResponse(true, subjects, 'Subjects retrieved successfully.')
	);
});

/**
 * @route GET /api/v1/instructor/subject/:id
 * @desc Get single subject details by ID
 */
export const getSubjectById = asyncHandler(async (req, res) => {
	const user = req.user;
	appAssert(user?.role === 'instructor', FORBIDDEN, 'Access denied.');

	const subject = await SubjectModel.findOne({
		_id: req.params.id,
		instructor: user._id,
	});

	appAssert(subject, NOT_FOUND, 'Subject not found.');

	res.json(
		new CustomResponse(true, subject, 'Subject retrieved successfully.')
	);
});

/**
 * @route POST /api/v1/instructor/subject - Create a subject
 */
export const createSubject = asyncHandler(async (req, res) => {
	appAssert(req.user, FORBIDDEN, 'Unauthorized');
	appAssert(req.user.role === 'instructor', FORBIDDEN, 'Access denied');

	const body = createSubjectSchema.parse(req.body);

	const subject = await SubjectModel.create({
		...body,
		instructor: req.user._id,
	});

	res.json(new CustomResponse(true, subject, 'Subject created successfully.'));
});

/**
 * @route PUT /api/v1/instructor/subject/:id - Update a subject
 */
export const updateSubject = asyncHandler(async (req, res) => {
	appAssert(req.user, FORBIDDEN, 'Unauthorized');
	appAssert(req.user.role === 'instructor', FORBIDDEN, 'Access denied');

	const { id } = req.params;
	const body = updateSubjectSchema.parse(req.body);

	const subject = await SubjectModel.findOneAndUpdate(
		{ _id: id, instructor: req.user._id },
		body,
		{ new: true }
	);
	appAssert(subject, NOT_FOUND, 'Subject not found.');

	res.json(new CustomResponse(true, subject, 'Subject updated successfully.'));
});

/**
 * @route DELETE /api/v1/instructor/subject/:id - Delete a subject
 */
export const deleteSubject = asyncHandler(async (req, res) => {
	appAssert(req.user, FORBIDDEN, 'Unauthorized');
	appAssert(req.user.role === 'instructor', FORBIDDEN, 'Access denied');

	const { id } = req.params;
	const subject = await SubjectModel.findOneAndDelete({
		_id: id,
		instructor: req.user._id,
	});
	appAssert(subject, NOT_FOUND, 'Subject not found.');

	// Optionally delete related sections
	await SectionModel.deleteMany({ subject: id });

	res.json(new CustomResponse(true, subject, 'Subject deleted successfully.'));
});

/**
 * @route POST /api/v1/instructor/section - Create a section
 */
export const createSection = asyncHandler(async (req, res) => {
	appAssert(req.user, FORBIDDEN, 'Unauthorized');
	appAssert(req.user.role === 'instructor', FORBIDDEN, 'Access denied');

	const body = createSectionSchema.parse(req.body);

	// Validate ownership of subject
	const subject = await SubjectModel.findOne({
		_id: body.subject,
		instructor: req.user._id,
	});
	appAssert(subject, NOT_FOUND, 'Subject not found or unauthorized.');

	const section = await SectionModel.create(body);
	res.json(new CustomResponse(true, section, 'Section created successfully.'));
});

/**
 * @route PUT /api/v1/instructor/section/:id - Update a section
 */
export const updateSection = asyncHandler(async (req, res) => {
	appAssert(req.user, FORBIDDEN, 'Unauthorized');
	appAssert(req.user.role === 'instructor', FORBIDDEN, 'Access denied');

	const { id } = req.params;
	const body = updateSectionSchema.parse(req.body);

	// Validate section ownership via subject
	const section = await SectionModel.findById(id).populate('subject');
	appAssert(section, NOT_FOUND, 'Section not found.');
	appAssert(
		String(section.subject.instructor) === String(req.user._id),
		FORBIDDEN,
		'Unauthorized access.'
	);

	Object.assign(section, body);
	await section.save();

	res.json(new CustomResponse(true, section, 'Section updated successfully.'));
});

/**
 * @route DELETE /api/v1/instructor/section/:id - Delete a section
 */
export const deleteSection = asyncHandler(async (req, res) => {
	appAssert(req.user, FORBIDDEN, 'Unauthorized');
	appAssert(req.user.role === 'instructor', FORBIDDEN, 'Access denied');

	const { id } = req.params;
	const section = await SectionModel.findById(id).populate('subject');
	appAssert(section, NOT_FOUND, 'Section not found.');
	appAssert(
		String(section.subject.instructor) === String(req.user._id),
		FORBIDDEN,
		'Unauthorized access.'
	);

	await section.deleteOne();

	res.json(new CustomResponse(true, null, 'Section deleted successfully.'));
});

/**
 * @route GET /api/v1/instructor/sections/:subjectId
 */
export const getSectionsBySubject = asyncHandler(async (req, res) => {
	const user = req.user;
	appAssert(user?.role === 'instructor', FORBIDDEN, 'Access denied.');

	const subject = await SubjectModel.findOne({
		_id: req.params.subjectId,
		instructor: user._id,
	});
	appAssert(subject, NOT_FOUND, 'Subject not found.');

	const sections = await SectionModel.find({ subject: subject._id });

	res.json(
		new CustomResponse(true, sections, 'Sections retrieved successfully.')
	);
});
