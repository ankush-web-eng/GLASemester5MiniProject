'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {

    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/preview/data-input')
    });

    return <div>in development</div>
}