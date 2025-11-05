import Box from "@/components/layout/box";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full">
            <div className="h-full w-1/4"><Box /></div>
            <main className="h-full w-3/4 overflow-y-auto p-6">
                {children}
            </main>
        </div>
    );
}