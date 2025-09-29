/**
 * ModuleGrid Component
 * 
 * This component arranges ModuleCard components in a responsive grid.
 * It takes a list of modules and displays them.
 * 
 * Located in: /components/courses/module-grid.tsx
 */

import { Module, ModuleCard } from './module-card';

interface ModuleGridProps {
    modules: Module[];
}

export function ModuleGrid({ modules }: ModuleGridProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
            {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
            ))}
        </div>
    );
} 