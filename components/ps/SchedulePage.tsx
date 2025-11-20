import React, { useMemo } from 'react';
import type { NetworkActivity, WBSNode, ProjectDefinition } from '../../types';

const parseDate = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date();
    return new Date(dateStr);
};

interface SchedulePageProps {
    activities: NetworkActivity[];
    wbs: WBSNode[];
    projects: ProjectDefinition[];
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ activities, wbs, projects }) => {
    const project = projects[0]; // Simplified to first project

    const { chartStartDate, totalDuration } = useMemo(() => {
        if (activities.length === 0) return { chartStartDate: new Date(), totalDuration: 30 };
        const startDates = activities.map(a => parseDate(a.plannedStartDate)).filter(d => !isNaN(d.getTime()));
        const endDates = activities.map(a => parseDate(a.plannedEndDate)).filter(d => !isNaN(d.getTime()));
        const minDate = new Date(Math.min.apply(null, startDates.map(d=>d.getTime())));
        const maxDate = new Date(Math.max.apply(null, endDates.map(d=>d.getTime())));
        const duration = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 5;
        return { chartStartDate: minDate, totalDuration: duration };
    }, [activities]);

    const getPosition = (startDateStr: string | undefined) => {
        const startDate = parseDate(startDateStr);
        const diff = (startDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24);
        return (diff / totalDuration) * 100;
    };
    
    const getWidth = (duration: number) => {
        return (duration / totalDuration) * 100;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">زمان‌بندی پروژه (نمودار گانت)</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="flex text-sm font-semibold border-b dark:border-gray-700">
                        <div className="w-1/3 p-2 border-r dark:border-gray-700">فعالیت</div>
                        <div className="w-2/3 p-2 relative">
                            {/* Date markers can be added here */}
                        </div>
                    </div>
                    {/* Body */}
                    {activities.map(act => (
                        <div key={act.id} className="flex border-b dark:border-gray-700 items-center group">
                            <div className="w-1/3 p-2 border-r dark:border-gray-700 text-sm">{act.description}</div>
                            <div className="w-2/3 h-10 p-2 relative">
                                <div
                                    className="absolute h-6 bg-primary rounded-md top-1/2 -translate-y-1/2 flex items-center px-2 text-white text-xs whitespace-nowrap overflow-hidden"
                                    style={{ left: `${getPosition(act.plannedStartDate)}%`, width: `${getWidth(act.duration)}%` }}
                                    title={`${act.description} - ${act.duration} روز`}
                                >
                                    {act.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
