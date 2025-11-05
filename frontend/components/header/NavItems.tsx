'use client';
import Link from "next/link";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/includes/ModeToggle";

export const SlideNavTabs = () => {
    return (
        <div className="fixed right-0 left-0 top-5 z-30 mx-auto">
            <SlideTabs />
        </div>
    );
};

const SlideTabs = () => {
    const [position, setPosition] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    });
    const { data: session } = useSession();
    const router = useRouter();

    const handleAuth = () => {
        if (session) {
            signOut();
        } else {
            router.push("/auth/signin");
        }
    }

    return (
        <ul
            onMouseLeave={() => {
                setPosition((pv) => ({
                    ...pv,
                    opacity: 0,
                }));
            }}
            className="flex relative items-center py-1 px-5 mx-auto text-sm rounded-full w-fit"
        >
            <Tab setPosition={setPosition}>
                <Link className="w-full h-full" href="/dashboard/preview">
                    Dashboard
                </Link>
            </Tab>
            <Tab setPosition={setPosition}>
                <Link className="w-full h-full" href="/dashboard/preview/agents">
                    Agents
                </Link>
            </Tab>
            <Tab setPosition={setPosition}>
                <Link className="w-full h-full" href="/about">
                    About
                </Link>
            </Tab>
            <Tab setPosition={setPosition}>
                <div className="w-full h-full" >
                    <ModeToggle />
                </div>
            </Tab>

            <button
                onClick={handleAuth}
                className="inline-flex gap-x-2 justify-start items-start py-3 px-5 ml-3 w-full rounded-3xl border duration-200 sm:w-auto group bg-black dark:bg-white border-gray-700/30 dark:border-gray-300/20 text-md font-geistSans text-gray-200 dark:text-black hover:bg-gray-700/60 dark:hover:bg-gray-100/20 hover:text-white dark:hover:text-gray-100"
            >
                {session ? "Sign Out" : "Sign In"}
                <div className="flex overflow-hidden relative justify-center items-center ml-1 w-5 h-5">
                    <ArrowUpRight className="absolute transition-all duration-500 group-hover:translate-x-4 group-hover:-translate-y-5" />
                    <ArrowUpRight className="absolute transition-all duration-500 -translate-x-4 -translate-y-5 group-hover:translate-x-0 group-hover:translate-y-0" />
                </div>
            </button>

            <Cursor position={position} />
        </ul>
    );
};

export const Tab = ({
    children,
    setPosition,
}: {
    children: React.ReactNode;
    setPosition: ({
        left,
        width,
        opacity,
    }: {
        left: number;
        width: number;
        opacity: number;
    }) => void;
}) => {
    const ref = useRef<HTMLLIElement>(null);

    return (
        <li
            ref={ref}
            onMouseEnter={() => {
                if (!ref?.current) return;
                const { width } = ref.current.getBoundingClientRect();
                setPosition({
                    left: ref.current.offsetLeft,
                    width,
                    opacity: 1,
                });
            }}
            className="block relative z-10 py-2.5 px-3 text-xs text-gray-800 dark:text-gray-200 cursor-pointer md:py-2 md:px-5 md:text-base hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
            {children}
        </li>
    );
};

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
    return (
        <motion.li
            animate={{
                ...position,
            }}
            className="absolute z-0 h-7 bg-gray-200/30 dark:bg-gray-700/30 rounded-full md:h-10 shadow-md backdrop-blur-sm"
        />
    );
};

export default SlideNavTabs;