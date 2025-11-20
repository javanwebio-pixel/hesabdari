
import React, { useState } from 'react';
import type { OrgUnit } from '../../../types';
// FIX: Import 'IconUsers' and 'IconBuildingCommunity' to resolve module export errors.
import { IconChevronLeft, IconUser, IconUsers, IconBuildingCommunity } from '../../Icons';

interface OrgChartItemProps {
    node: OrgUnit;
    level: number;
    onToggle: (id: string) => void;
    expandedNodes: Set<string>;
}

const OrgChartItem: React.FC<OrgChartItemProps> = ({ node, level, onToggle, expandedNodes }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indentStyle = { paddingRight: `${level * 2}rem` };

    return (
        <>
            <div className="flex items-center gap-2 py-3 border-b dark:border-gray-700" style={indentStyle}>
                {hasChildren && <IconChevronLeft className={`w-4 h-4 cursor-pointer transition-transform ${isExpanded ? '-rotate-90' : ''}`} onClick={() => onToggle(node.id)} />}
                {!hasChildren && <div className="w-4 h-4"></div>}
                <IconBuildingCommunity className="w-5 h-5 text-primary"/>
                <div className="flex-grow">
                    <p className="font-semibold">{node.name}</p>
                    {node.manager && <p className="text-xs text-gray-500 flex items-center gap-1"><IconUser className="w-3 h-3"/> {node.manager}</p>}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1"><IconUsers className="w-4 h-4"/> {node.headcount}</div>
            </div>
            {isExpanded && hasChildren && node.children.map(child => (
                <OrgChartItem key={child.id} node={child} level={level + 1} onToggle={onToggle} expandedNodes={expandedNodes} />
            ))}
        </>
    );
};


interface OrgStructurePageProps {
    orgStructure: OrgUnit[];
}

export const OrgStructurePage: React.FC<OrgStructurePageProps> = ({ orgStructure }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(orgStructure.map(n => n.id)));

    const handleToggle = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">ساختار سازمانی</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {orgStructure.map(node => (
                    <OrgChartItem key={node.id} node={node} level={0} onToggle={handleToggle} expandedNodes={expandedNodes} />
                ))}
            </div>
        </div>
    );
};
