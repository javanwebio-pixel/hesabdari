
import React from 'react';
import type { TrainingCourse } from '../../../types';
// FIX: Import 'IconUsers' to resolve the 'has no exported member' error.
import { IconBook, IconClock, IconUsers } from '../../Icons';

interface LearningPageProps {
    courses: TrainingCourse[];
}

export const LearningPage: React.FC<LearningPageProps> = ({ courses }) => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">آموزش و توسعه</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-3">
                        <h3 className="font-bold text-lg text-primary flex items-center gap-2"><IconBook/> {course.title}</h3>
                        <p className="text-sm text-gray-500">مدرس: {course.instructor}</p>
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1"><IconClock className="w-4 h-4"/> {course.duration}</span>
                            <span className="flex items-center gap-1"><IconUsers className="w-4 h-4"/> {course.enrolled} شرکت‌کننده</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
