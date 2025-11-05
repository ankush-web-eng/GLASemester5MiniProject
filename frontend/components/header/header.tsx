'use client';
import { ArrowUpRight } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoMdExit } from "react-icons/io";

export default function Header() {

    const { data: session } = useSession();
    const router = useRouter();


    const [isHidden, setIsHidden] = useState(true);

    useEffect(() => {
        if (window.location.href === '/') {
            setIsHidden(false);
        } else {
            setIsHidden(true);
        }
    }, [])

    const handleAuth = () => {
        if (session) {
            signOut();
        } else {
            router.push("/auth/signin");
        }
    }

    return (
        <nav className="float-right right-0 flex justify-center items-center py-3 px-3 space-x-3">
            <button
                onClick={handleAuth}
                className={`inline-flex mr-3 gap-x-2 justify-start items-start py-2 px-2 ml-3 w-full rounded-3xl border duration-200 sm:w-auto group border-gray-700/30 dark:border-gray-300/20 text-md font-geistSans text-gray-800 dark:text-black hover:bg-gray-700/60 dark:hover:bg-gray-100/20 hover:text-white ${isHidden ? 'hidden' : ''} dark:hover:text-gray-100`}
            >

                <div className="flex text-3xl overflow-hidden relative justify-center items-center ml-1 w-5 h-5">
                    {session ? <IoMdExit /> : <ArrowUpRight />}
                </div>
            </button>

        </nav>
    )
}