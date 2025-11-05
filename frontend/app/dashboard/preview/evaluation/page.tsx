'use client';
import { useEffect, useState } from "react";
import EvaluationDashboard, { Evaluation } from "../../preview/agents/agents"
import { Skeleton } from "@/components/skeleton";

export default function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const evalData = localStorage.getItem('responseData');
            if (evalData) {
                const evals = JSON.parse(evalData);
                if (evals?.evaluations) {
                    setEvaluations(evals.evaluations);
                }
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (!isClient) {
        return <Skeleton />;
    }

    return (
        <EvaluationDashboard
            data={{ evaluations }}
            isLoading={isLoading}
            error={error}
        />
    );
}