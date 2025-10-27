"use client";

import React from "react";
import { SlideNavTabs } from "./NavItems";

function NavbarContent() {
    return (
        <div className="flex justify-end relative">
            <SlideNavTabs />
        </div>
    );
}

export const Navbar = () => {
    return (
        <nav className="fixed top-0 right-0 z-[99999] mt-12 hidden px-12 text-sm md:flex float-right">
            <NavbarContent />
        </nav>
    );
};