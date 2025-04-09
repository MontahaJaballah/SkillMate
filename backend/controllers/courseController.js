const Course = require('../models/Course');
const Skill = require('../models/Skill');
const mongoose = require('mongoose'); // mongoose is required for ObjectId validation

// Get all courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({
                path: 'skill',
                select: 'name categorie proficiency'
            })
            .populate({
                path: 'teacher_id',
                select: 'firstName lastName email avatar bio phoneNumber role rating reviews courses totalStudents'
            })
            .select('title description thumbnail createdate price teacher_id duration level language type sections');

        // Add lecture count to each course and format instructor data
        const coursesWithLectureCount = courses.map(course => {
            const courseData = course.toObject();
            const instructor = course.teacher_id;

            // Format instructor data
            if (instructor) {
                courseData.teacher_id = {
                    name: instructor.firstName && instructor.lastName
                        ? `${instructor.firstName} ${instructor.lastName}`
                        : 'Unknown Instructor',
                    email: instructor.email || '',
                    bio: instructor.bio || 'No bio available',
                    avatar: instructor.avatar || 'https://ui-avatars.com/api/?background=random',
                    rating: instructor.rating || 0,
                    reviews: instructor.reviews || 0,
                    courses: instructor.courses || [],
                    totalStudents: instructor.totalStudents || 0,
                    role: instructor.role || 'teacher'
                };
            } else {
                courseData.teacher_id = {
                    name: 'Unknown Instructor',
                    email: '',
                    bio: 'No bio available',
                    avatar: 'https://ui-avatars.com/api/?background=random',
                    rating: 0,
                    reviews: 0,
                    courses: [],
                    totalStudents: 0,
                    role: 'teacher'
                };
            }

            // Calculate total duration
            const totalDuration = courseData.sections?.reduce((total, section) => {
                const sectionDuration = section.content?.reduce((acc, content) => acc + (content.duration || 0), 0) || 0;
                return total + sectionDuration;
            }, 0) || 0;

            courseData.lectureCount = course.sections?.reduce((total, section) =>
                total + (section.content?.length || 0), 0
            ) || 0;
            courseData.duration = totalDuration;
            return courseData;
        });

        res.status(200).json(coursesWithLectureCount);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            shortDescription,
            type,
            thumbnail,
            skill,
            teacher_id,
            schedule,
            duration,
            price,
            originalPrice,
            level,
            language,
            prerequisites,
            sections,
            tags,
            faqs
        } = req.body;

        // Validate required fields
        if (!title || !description || !thumbnail || !teacher_id || !duration || !level || !language) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['title', 'description', 'thumbnail', 'teacher_id', 'duration', 'level', 'language']
            });
        }

        // Validate skill for regular courses
        if (type === 'regular' && !skill) {
            return res.status(400).json({ message: 'Skill is required for regular courses' });
        }

        // Validate skill exists if provided
        if (skill) {
            const existingSkill = await Skill.findById(skill);
            if (!existingSkill) {
                return res.status(400).json({ message: 'Skill not found' });
            }
        }

        // Validate prerequisites if provided
        if (prerequisites && prerequisites.length > 0) {
            const prereqIds = prerequisites.map(id => mongoose.Types.ObjectId(id));
            const existingPrereqs = await Course.find({ _id: { $in: prereqIds } });
            if (existingPrereqs.length !== prerequisites.length) {
                return res.status(400).json({ message: 'One or more prerequisites courses not found' });
            }
        }

        // Process sections and their content
        const processedSections = sections.map(section => ({
            title: section.title,
            content: section.content.map(content => {
                const baseContent = {
                    type: content.type,
                    title: content.title,
                    duration: content.duration || 0,
                    description: content.description,
                    resources: content.resources || []
                };

                // Add type-specific fields
                switch (content.type) {
                    case 'video':
                        return {
                            ...baseContent,
                            videoUrl: content.videoUrl
                        };
                    case 'quiz':
                        return {
                            ...baseContent,
                            questions: content.questions.map(q => ({
                                question: q.question,
                                options: q.options,
                                correctAnswer: q.correctAnswer
                            }))
                        };
                    case 'assignment':
                        return {
                            ...baseContent,
                            instructions: content.instructions,
                            submissionType: content.submissionType
                        };
                    default:
                        return baseContent;
                }
            })
        }));

        const newCourse = new Course({
            title,
            description,
            shortDescription,
            type: type || 'regular',
            thumbnail,
            skill: type === 'regular' ? skill : undefined,
            teacher_id,
            schedule: type === 'regular' ? schedule : undefined,
            duration,
            price: price || 0,
            originalPrice: originalPrice || price || 0,
            level,
            language,
            prerequisites: prerequisites || [],
            sections: processedSections,
            tags: tags || [],
            faqs: faqs || [],
            status: 'draft',
            createdate: new Date(),
            students: [],
            ratings: []
        });

        await newCourse.save();

        res.status(201).json({
            message: 'Course created successfully',
            course: await Course.findById(newCourse._id)
                .populate({ path: 'skill', select: 'name categorie proficiency' })
                .populate({ path: 'teacher_id', select: 'name email' })
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            message: 'Error creating course',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get a single course
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id)
            .populate({
                path: 'skill',
                select: 'name categorie proficiency'
            })
            .populate({
                path: 'teacher_id',
                select: 'firstName lastName email avatar bio phoneNumber role rating reviews courses totalStudents'
            })
            .populate({
                path: 'prerequisites',
                select: 'title thumbnail'
            });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const instructor = course.teacher_id;

        // Calculate total duration
        const totalDuration = course.sections?.reduce((total, section) => {
            const sectionDuration = section.content?.reduce((acc, content) => acc + (content.duration || 0), 0) || 0;
            return total + sectionDuration;
        }, 0) || 0;

        // Format course data
        const formattedCourse = {
            ...course.toObject(),
            duration: totalDuration,
            teacher_id: {
                name: instructor.firstName && instructor.lastName
                    ? `${instructor.firstName} ${instructor.lastName}`
                    : 'Unknown Instructor',
                email: instructor.email || '',
                bio: instructor.bio || 'No bio available',
                avatar: instructor.avatar || 'https://ui-avatars.com/api/?background=random',
                rating: instructor.rating || 0,
                reviews: instructor.reviews || 0,
                courses: instructor.courses || [],
                totalStudents: instructor.totalStudents || 0,
                role: instructor.role || 'teacher'
            }
        };

        res.status(200).json(formattedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
};
// Enroll a user in a course
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.body;

        // Validate required fields
        if (!courseId || !userId) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['courseId', 'userId']
            });
        }

        // Validate that the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is already enrolled
        if (course.students.includes(userId)) {
            return res.status(400).json({ message: 'User is already enrolled in this course' });
        }

        // Add user to course students array
        course.students.push(userId);
        await course.save();

        res.status(200).json({
            message: 'Successfully enrolled in course',
            course: {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail,
                enrollmentDate: new Date()
            }
        });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({
            message: 'Error enrolling in course',
            error: error.message
        });
    }
};

// Get all courses a user is enrolled in
const getEnrolledCourses = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all courses where the user is in the students array
        const enrolledCourses = await Course.find({ students: userId })
            .populate({
                path: 'skill',
                select: 'name categorie proficiency'
            })
            .populate({
                path: 'teacher_id',
                select: 'firstName lastName email avatar bio phoneNumber role rating reviews courses totalStudents'
            })
            .select('title description thumbnail createdate price teacher_id duration level language type sections');

        // Format courses with additional information
        const formattedCourses = enrolledCourses.map(course => {
            const courseData = course.toObject();
            const instructor = course.teacher_id;

            // Format instructor data
            if (instructor) {
                courseData.teacher_id = {
                    name: instructor.firstName && instructor.lastName
                        ? `${instructor.firstName} ${instructor.lastName}`
                        : 'Unknown Instructor',
                    email: instructor.email || '',
                    bio: instructor.bio || 'No bio available',
                    avatar: instructor.avatar || 'https://ui-avatars.com/api/?background=random',
                    rating: instructor.rating || 0,
                    reviews: instructor.reviews || 0,
                    courses: instructor.courses || [],
                    totalStudents: instructor.totalStudents || 0,
                    role: instructor.role || 'teacher'
                };
            }

            // Calculate lecture count and total duration
            courseData.lectureCount = course.sections?.reduce((total, section) =>
                total + (section.content?.length || 0), 0
            ) || 0;
            
            const totalDuration = course.sections?.reduce((total, section) => {
                const sectionDuration = section.content?.reduce((acc, content) => acc + (content.duration || 0), 0) || 0;
                return total + sectionDuration;
            }, 0) || 0;
            
            courseData.duration = totalDuration;
            
            return courseData;
        });

        res.status(200).json(formattedCourses);
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        res.status(500).json({
            message: 'Error fetching enrolled courses',
            error: error.message
        });
    }
};

module.exports = {
    getCourses,
    createCourse,
    getCourseById,
    enrollInCourse,
    getEnrolledCourses
};
