'use client';
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function GetStartedButton() {

    return (
        <Link
            href={"/dashboard/preview/data-input"}
            className="inline-flex gap-x-2 justify-start items-start px-5 ml-3 max-md:w-fit rounded-3xl duration-200 sm:w-auto group bg-page-gradient border-white/30 text-md font-geistSans hover:border-zinc-600 hover:text-zinc-100"
        >
            <ShimmerButton className="shadow-2xl">
                <div className="whitespace-pre-wrap flex items-center space-x-2 text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Get started
                    <div className="flex overflow-hidden relative justify-center items-center ml-1 w-5 h-5">
                        <ArrowUpRight className="absolute transition-all duration-500 group-hover:translate-x-4 group-hover:-translate-y-5" />
                        <ArrowUpRight className="absolute transition-all duration-500 -translate-x-4 -translate-y-5 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </div>
                </div>
            </ShimmerButton>
        </Link>
    )
}