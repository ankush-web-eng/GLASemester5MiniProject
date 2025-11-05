'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Check } from 'lucide-react';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/skeleton';
import { categoryAgents } from './data';

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

// Sample data structure with image path for blog expert
// interface Agent {
//     id: string;
//     name: string;
//     imagePath?: string;
// }

interface ResultData {
    results: Array<{
        content: string;
        id: string;
    }>;
    status: string;
}

interface BackendRequestData {
    id: string;
    category: string;
    input: string;
}

// export const categoryAgents = {
//     blog: [
//         { id: '1', name: 'Blog Expert', imagePath: '/logos/blog_generator.png' },
//         { id: '2', name: 'Content Pro', imagePath: '/logos/blog_generator.png' },
//         { id: '3', name: 'Article Writer', imagePath: '/logos/blog_generator.png' },
//         { id: '4', name: 'Storyteller AI', imagePath: '/logos/blog_generator.png' }
//     ],
//     linkedin: [
//         { id: '1', name: 'LinkedIn Pro', imagePath: '/logos/linkedIn.png' },
//         { id: '2', name: 'Business Writer', imagePath: '/logos/linkedIn.png' },
//         { id: '3', name: 'Social Media Expert', imagePath: '/logos/linkedIn.png' },
//         { id: '4', name: 'Professional Networker', imagePath: '/logos/linkedIn.png' }
//     ],
//     youtube: [
//         { id: '1', name: 'Video Analyzer', imagePath: '/logos/youtube.png' },
//         { id: '2', name: 'Summary Expert', imagePath: '/logos/youtube.png' },
//         { id: '3', name: 'Content Curator', imagePath: '/logos/youtube.png' },
//         { id: '4', name: 'Video Insight AI', imagePath: '/logos/youtube.png' }
//     ],
//     travel: [
//         { id: '1', name: 'Journey Expert', imagePath: '/logos/travel_planner-removebg-preview.png' },
//         { id: '2', name: 'Travel Planner', imagePath: '/logos/travel_planner-removebg-preview.png' },
//         { id: '3', name: 'Route Optimizer', imagePath: '/logos/travel_planner-removebg-preview.png' },
//         { id: '4', name: 'Travel Assistant', imagePath: '/logos/travel_planner-removebg-preview.png' }
//     ]
// };

export default function AgentsPreviewPage() {
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [, setResults] = useState<ResultData | null>(null);
    const [activeTab, setActiveTab] = useState("agents");
    const [typedInput, setTypedInput] = useState<string>("");
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

    const router = useRouter();

    const handleAgentSelection = (agentId: string, category: string) => {
        if (activeCategory && activeCategory !== category && selectedAgents.length > 0) {
            return; // Prevent selection from other categories
        }
        
        setActiveCategory(category);
        setSelectedAgents(prev => {
            const newSelection = prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId];
            
            // If no agents are selected, reset active category
            if (newSelection.length === 0) {
                setActiveCategory(null);
            }
            
            return newSelection;
        });
    };

    const placeholders = [
        "Write a blog post about sustainable travel tips...",
        "Create a LinkedIn post about digital marketing trends...",
        "Analyze this YouTube video for key insights...",
        "Plan a 7-day itinerary for Paris...",
        "Generate content ideas for my travel blog...",
    ];
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypedInput(e.target.value);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedAgents.length === 0 || !activeCategory) {
            console.error('Please select agents and category first');
            setActiveTab("agents");
            return;
        }
        const backendData: BackendRequestData[] = selectedAgents.map((agentId: string) => ({
            id: agentId,
            category: activeCategory || "",
            input: typedInput
        }));
        sendToBackend(backendData);
    };

    const sendToBackend = async (backendData: BackendRequestData[]) => {
        try {
            setIsDataLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate_content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(backendData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate content');
            }

            localStorage.setItem('responseData', JSON.stringify(data));
            setResults(data);
            router.push('/dashboard/preview/playground');
        } catch (error) {
            console.error('Error:', error);
            // Handle error state here
        } finally {
            setIsDataLoading(false);
        }
    };

    const formatCategoryName = (category: string) => {
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveTab("task");
    };

    if (isDataLoading) return <Skeleton />

    return (
        <div className="p-4 min-h-screen bg-background">
            <h1 className="text-2xl font-bold mb-6 text-foreground">Agent Selection</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="agents">Available Agents</TabsTrigger>
                    <TabsTrigger value="task">Task</TabsTrigger>
                </TabsList>

                <TabsContent value="agents">
                    <div className="space-y-8">
                        {Object.entries(categoryAgents).map(([category, agents]) => (
                            <div key={category} className={`border rounded-lg p-6 transition-opacity ${
                                activeCategory && activeCategory !== category ? 'opacity-50' : ''
                            }`}>
                                <div className="flex items-center mb-4">
                                    <h2 className="text-xl font-semibold text-foreground">
                                        {formatCategoryName(category)}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {agents.map((agent) => (
                                        <Card
                                            key={agent.id}
                                            className={`relative flex flex-col items-center justify-center p-4 cursor-pointer rounded-2xl border-2 transition-all group shadow-sm ${
                                                activeCategory && activeCategory !== category 
                                                    ? 'opacity-50 pointer-events-none' 
                                                    : selectedAgents.includes(agent.id)
                                                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                            }`}
                                            onClick={() => handleAgentSelection(agent.id, category)}
                                        >
                                            <div className="text-4xl mb-2 opacity-70 group-hover:opacity-100">
                                                {agent.imagePath ? (
                                                    <div className="w-16 h-16 relative">
                                                        <Image
                                                            src={agent.imagePath}
                                                            alt={agent.name}
                                                            fill
                                                            className="object-contain"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span>🤖</span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-foreground">
                                                {agent.name}
                                            </span>
                                            {selectedAgents.includes(agent.id) && (
                                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                    <Check className="text-white" size={12} />
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleSave}
                                disabled={selectedAgents.length === 0}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Selection
                            </button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="task">
                    <div className="h-[300px] text-foreground flex flex-col space-y-3 justify-center items-center">
                        <p>What is the task you want to perform ??</p>
                        <PlaceholdersAndVanishInput
                            placeholders={placeholders}
                            onChange={handleChange}
                            onSubmit={onSubmit}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}