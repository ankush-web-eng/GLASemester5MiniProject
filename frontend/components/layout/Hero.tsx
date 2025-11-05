import { siteConfig } from "@/config/metadata";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";
import GetStartedButton from "@/components/includes/GetStartedButton";
import { Navbar } from "../header/Navbar";

export default function Hero() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black">
            <Navbar />
            <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
                <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                    {siteConfig.name} <br />
                    {siteConfig.description}
                </h1>
                <p className="mt-4 font-normal text-base text-gray-600 dark:text-gray-300 max-w-lg text-center mx-auto">
                    Building the future of AI testing and evaluation.
                    Our platform helps you make informed decisions about AI tools and services.
                </p>
                <div className="mt-8 flex justify-center">
                    <GetStartedButton />
                </div>
            </div>
            <DotPattern
                className={cn(
                    "absolute inset-0 h-full w-full",
                    "text-gray-300 dark:text-gray-700 opacity-30"
                )}
            />
        </div>
    );
}