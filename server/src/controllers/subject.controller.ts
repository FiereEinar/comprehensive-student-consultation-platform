import { Request, Response } from 'express';
import SubjectModel from '../models/subject.model';
import { createSubjectSchema, updateSubjectSchema } from '../schemas/subject.schema';

export const createSubject = async (req: Request, res: Response) => {
	try {
		const parsedData = createSubjectSchema.parse(req.body);
		// Assign the currently logged-in instructor (if not admin) or specified instructor
		const instructor = req.user._id;

		const subject = await SubjectModel.create({
			...parsedData,
			instructors: [instructor],
		});

		res.status(201).json({ message: 'Subject created successfully', subject });
	} catch (error: any) {
		res.status(400).json({ message: error.errors ? error.errors[0].message : error.message });
	}
};

export const getSubjects = async (req: Request, res: Response) => {
	try {
		const { schoolYear, semester, instructor } = req.query;
		const query: any = {};

		if (schoolYear) query.schoolYear = schoolYear;
		if (semester) query.semester = Number(semester);
		if (instructor) query.instructors = instructor; // filter by instructor ID inside the array

		const subjects = await SubjectModel.find(query).populate('instructors', 'name email');
		res.status(200).json(subjects);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const updateSubject = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const parsedData = updateSubjectSchema.parse(req.body);

		const subject = await SubjectModel.findByIdAndUpdate(id, parsedData, { new: true });
		if (!subject) return res.status(404).json({ message: 'Subject not found' });

		res.status(200).json({ message: 'Subject updated successfully', subject });
	} catch (error: any) {
		res.status(400).json({ message: error.errors ? error.errors[0].message : error.message });
	}
};

export const deleteSubject = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const subject = await SubjectModel.findByIdAndDelete(id);
		
		if (!subject) return res.status(404).json({ message: 'Subject not found' });

		res.status(200).json({ message: 'Subject deleted successfully' });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};

export const toggleInstructorSubject = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const instructorId = req.user._id;

		const subject = await SubjectModel.findById(id);
		if (!subject) return res.status(404).json({ message: 'Subject not found' });

		// check if instructor is already in the array
		const isInstructorAssigned = subject.instructors.some(
			(instId) => instId.toString() === instructorId.toString()
		);

		if (isInstructorAssigned) {
			subject.instructors = subject.instructors.filter(
				(instId) => instId.toString() !== instructorId.toString()
			);
		} else {
			subject.instructors.push(instructorId);
		}

		await subject.save();

		res.status(200).json({ 
			message: isInstructorAssigned ? 'Successfully removed from subject' : 'Successfully assigned to subject', 
			subject 
		});
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
};
