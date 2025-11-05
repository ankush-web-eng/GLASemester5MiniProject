'use client'
import React from 'react';
import {
    History,
    Settings,
    ChevronDown,
    LineChart,
    PlayCircle,
    Users,
    Database,
    HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Box = () => {
    const pathname = usePathname();

    interface SectionHeaderProps {
        title: string;
        icon: React.ElementType;
        section: string;
        link: string;
    }

    const SectionHeader = ({
        title,
        icon: Icon,
        link
    }: SectionHeaderProps) => (
        <Link
            href={link}
            className={`cursor-pointer flex items-center justify-between px-5 bg-white py-4 rounded-xl transition-all duration-300 ${pathname === link
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
        >
            <div className="flex items-center">
                <Icon className="mr-3" size={24} />
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <ChevronDown
                className={`transform transition-transform ${pathname === link ? 'rotate-180 text-emerald-500' : 'text-gray-500'
                    }`}
                size={24}
            />
        </Link>
    );

    return (
        <div className="w-1/4 h-screen bg-gray-100 border-r border-gray-200 fixed left-0 top-0">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                <h1 className="text-2xl font-bold text-white">
                    {process.env.NEXT_PUBLIC_APP_NAME}
                </h1>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
                <SectionHeader
                    link={'/dashboard/preview/data-input'}
                    title="Data"
                    icon={Database}
                    section="data-input"
                    />
                <SectionHeader
                    link={'/dashboard/preview/agents'}
                    title="Agents"
                    icon={Users}
                    section="agents"
                    />
                <SectionHeader
                    link={'/dashboard/preview/playground'}
                    title="Playground"
                    icon={PlayCircle}
                    section="playground"
                    />
                <SectionHeader
                    title="Evaluation"
                    link={'/dashboard/preview/evaluation'}
                    icon={LineChart}
                    section="evaluation"
                    />
                <SectionHeader
                    link={'/dashboard/preview/history'}
                    title="History"
                    icon={History}
                    section="history"
                />
                <SectionHeader
                    link={'/dashboard/preview/settings'}
                    title="Settings"
                    icon={Settings}
                    section="settings"
                />
                <SectionHeader
                    link={'/dashboard/preview/help'}
                    title="Help"
                    icon={HelpCircle}
                    section="help"
                />
            </div>
        </div>
    );
};

export default Box;