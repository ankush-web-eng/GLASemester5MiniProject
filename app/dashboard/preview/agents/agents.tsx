'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Calculator, Activity, Award, LayoutGrid, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { categoryAgents } from './data';

const MetricCard = ({ title, value, icon: Icon, description, isLoading }: { title: string; value?: string | number; icon: React.ElementType; description: string; isLoading: boolean }) => (
    <Card className="transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-24" />
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </>
            )}
        </CardContent>
    </Card>
);

const EmptyState = () => (
    <div className="flex-col items-center p-8 text-center space-y-4  min-h-screen flex justify-center">
        <LayoutGrid className="h-16 w-16 text-gray-400" />
        <h3 className="text-lg font-semibold">No Evaluation Data Available</h3>
        <p className="text-sm text-gray-500">Start adding content evaluations to see insights and analytics here.</p>
        <Link href={'/dashboard/preview/data-input'}><Button>Start Now</Button></Link>
    </div>
);

const ChartCard = ({ title, description, height = "h-80", children }: { title: string; description?: string; height?: string; children: React.ReactNode }) => (
    <Card className="col-span-1">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={height}>
            {children}
        </CardContent>
    </Card>
);

const LoadingChart = () => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="space-y-4 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
);

const findAgentName = (id: string): string => {
    for (const category of Object.values(categoryAgents)) {
        const agent = category.find(agent => agent.id === id);
        if (agent) {
            return agent.name;
        }
    }
    return `Agent ${id}`;
};

export interface Evaluation {
    scores: Record<string, number>;
    average_score: number;
}

interface DashboardProps {
    data: { evaluations: Evaluation[] } | null;
    isLoading: boolean;
    error?: Error | null;
}

const EvaluationDashboard = ({ data, isLoading, error }: DashboardProps) => {
    if (error) {
        return (
            <Alert variant="destructive" className="m-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load evaluation data. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (!isLoading && (!data?.evaluations || data.evaluations.length === 0)) {
        return <EmptyState />;
    }

    const radarData = data?.evaluations?.[0] ? Object.keys(data.evaluations[0].scores).map(key => ({
        category: key.charAt(0).toUpperCase() + key.slice(1),
        ...data.evaluations.reduce((acc, evaluation, index) => {
            const storedData = localStorage.getItem('responseData');
            const parsedData = storedData ? JSON.parse(storedData) : null;
            const agentId = parsedData?.results?.[index]?.id || `${index + 1}`;
            const agentName = findAgentName(agentId);
            return {
                ...acc,
                [agentName]: evaluation.scores[key]
            };
        }, {})
    })) : [];

    const barData = data?.evaluations?.map((evaluation, index) => {
        const storedData = localStorage.getItem('responseData');
        const parsedData = storedData ? JSON.parse(storedData) : null;
        const agentId = parsedData?.results?.[index]?.id || `${index + 1}`;
        return {
            name: findAgentName(agentId),
            score: evaluation.average_score
        };
    }) || [];

    const stats = data?.evaluations ? {
        avgScore: data.evaluations.reduce((acc, curr) => acc + curr.average_score, 0) / data.evaluations.length,
        highestScore: Math.max(...data.evaluations.map(e => e.average_score)),
        totalEvaluations: data.evaluations.length,
        categories: Object.keys(data.evaluations[0].scores).length
    } : null;

    const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Average Score"
                    value={stats?.avgScore.toFixed(2)}
                    icon={Calculator}
                    description="Overall performance"
                    isLoading={isLoading!}
                />
                <MetricCard
                    title="Highest Score"
                    value={stats?.highestScore.toFixed(2)}
                    icon={Award}
                    description="Best performance"
                    isLoading={isLoading!}
                />
                <MetricCard
                    title="Total Evaluations"
                    value={stats?.totalEvaluations}
                    icon={Activity}
                    description="Content pieces evaluated"
                    isLoading={isLoading!}
                />
                <MetricCard
                    title="Categories"
                    value={stats?.categories}
                    icon={LayoutGrid}
                    description="Evaluation metrics"
                    isLoading={isLoading!}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <ChartCard
                    title="Average Scores Distribution"
                    description="Comparison of overall scores across content pieces"
                >
                    {isLoading ? (
                        <LoadingChart />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="score"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard
                    title="Parameter Scores by Agent"
                    description="Detailed view of individual parameter scores for each agent"
                >
                    {isLoading ? (
                        <LoadingChart />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={Object.keys(data?.evaluations?.[0]?.scores || {}).map(param => ({
                                    parameter: param,
                                    ...data?.evaluations?.reduce((acc, evaluation, index) => {
                                        const storedData = localStorage.getItem('responseData');
                                        const parsedData = storedData ? JSON.parse(storedData) : null;
                                        const agentId = parsedData?.results?.[index]?.id || `${index + 1}`;
                                        const agentName = findAgentName(agentId);
                                        return {
                                            ...acc,
                                            [agentName]: evaluation.scores[param]
                                        };
                                    }, {})
                                }))}
                            >
                                <XAxis dataKey="parameter" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                {data?.evaluations?.map((_, index) => {
                                    const storedData = localStorage.getItem('responseData');
                                    const parsedData = storedData ? JSON.parse(storedData) : null;
                                    const agentId = parsedData?.results?.[index]?.id || `${index + 1}`;
                                    const agentName = findAgentName(agentId);
                                    return (
                                        <Bar
                                            key={agentName}
                                            dataKey={agentName}
                                            fill={chartColors[index % chartColors.length]}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    );
                                })}
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                <ChartCard
                    title="Criteria Comparison"
                    description="Detailed breakdown of scores across all evaluation criteria"
                >
                    {isLoading ? (
                        <LoadingChart />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="category" />
                                <PolarRadiusAxis domain={[0, 5]} />
                                {data?.evaluations?.map((_, index) => {
                                    const storedData = localStorage.getItem('responseData');
                                    const parsedData = storedData ? JSON.parse(storedData) : null;
                                    const agentId = parsedData?.results?.[index]?.id || `${index + 1}`;
                                    const agentName = findAgentName(agentId);
                                    return (
                                        <Radar
                                            key={index}
                                            name={agentName}
                                            dataKey={agentName}
                                            fill={chartColors[index % chartColors.length]}
                                            fillOpacity={0.6}
                                        />
                                    );
                                })}
                                <Legend />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </div>
        </div>
    );
};

export default EvaluationDashboard;