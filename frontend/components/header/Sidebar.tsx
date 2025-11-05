"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
    IconArrowLeft,
    IconBrandTabler,
    IconSettings,
    IconUserBolt,
} from "@tabler/icons-react";
import Image from "next/image";
import { usePathname } from 'next/navigation';

export function SidebarPreview() {
    const pathname = usePathname();
    const links = [
        {
            label: "Data input",
            href: "/dashboard/preview/data-input",
            icon: (
                <IconBrandTabler className={`h-5 w-5 flex-shrink-0 ${
                    pathname === "/dashboard/preview/data-input" 
                    ? "text-blue-500" 
                    : "text-neutral-700 dark:text-neutral-200"
                }`} />
            ),
        },
        {
            label: "Agents",
            href: "/dashboard/preview/agents",
            icon: (
                <IconUserBolt className={`h-5 w-5 flex-shrink-0 ${
                    pathname === "/dashboard/preview/agents" 
                    ? "text-blue-500" 
                    : "text-neutral-700 dark:text-neutral-200"
                }`} />
            ),
        },
        {
            label: "Settings",
            href: "/dashboard/preview/settings",
            icon: (
                <IconSettings className={`h-5 w-5 flex-shrink-0 ${
                    pathname === "/dashboard/preview/settings" 
                    ? "text-blue-500" 
                    : "text-neutral-700 dark:text-neutral-200"
                }`} />
            ),
        },
        {
            label: "History",
            href: "/dashboard/preview/history",
            icon: (
                <IconArrowLeft className={`h-5 w-5 flex-shrink-0 ${
                    pathname === "/dashboard/preview/history" 
                    ? "text-blue-500" 
                    : "text-neutral-700 dark:text-neutral-200"
                }`} />
            ),
        },
    ];
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed left-0 h-screen">
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink 
                                    key={idx} 
                                    link={link}
                                    className={pathname === link.href ? "text-blue-500" : ""}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "Manu Arora",
                                href: "#",
                                icon: (
                                    <Image
                                        src="https://assets.aceternity.com/manu.png"
                                        className="h-7 w-7 flex-shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
        </div>
    );
}

// Rest of the Logo and LogoIcon components remain the same
