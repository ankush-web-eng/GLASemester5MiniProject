'use client';
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RiLoader2Line } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";
// import { IconBrandGoogle } from "@tabler/icons-react";
import { signIn } from "next-auth/react";

type SigninFormData = {
    email: string;
    password: string;
};

export function SigninForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<SigninFormData>();
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onSubmit: SubmitHandler<SigninFormData> = async (data: SigninFormData) => {
        setLoading(true);
        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: data.email,
                password: data.password,
            });
            if (result?.error) {
                if (result.error === 'CredentialsSignin') {
                    toast({
                        title: 'Login Failed',
                        description: 'Incorrect username or password',
                        variant: 'destructive',
                        duration: 2000,
                    });
                    return;
                } else {
                    toast({
                        title: 'Error',
                        description: result.error,
                        variant: 'destructive',
                        duration: 2000,
                    });
                    return;
                }
            }
            router.replace('/dashboard/preview/data-input');
        } catch {
            toast({
                title: 'Error',
                description: 'Server Error occurred. Please try again after some time.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-white dark:bg-black">
            <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-2xl bg-white dark:bg-black shadow-blue-950 dark:shadow-blue-950 dark:border-2">
                <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                    Login to {process.env.NEXT_PUBLIC_APP_NAME}
                </h2>

                <form className="my-8" onSubmit={handleSubmit(onSubmit)}>

                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            placeholder="imagine.dev@gmail.com"
                            type="email"
                            {...register("email", { required: true })}
                        />
                        {errors.email && <span className="text-red-500 text-sm">Email is required</span>}
                    </LabelInputContainer>

                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            {...register("password", { required: true })}
                        />
                        {errors.password && <span className="text-red-500 text-sm">Password is required</span>}
                    </LabelInputContainer>

                    <button
                        className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] "
                        type="submit"
                    >
                        {loading ? (
                            <span className="flex justify-center items-center">
                                <RiLoader2Line className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </span>
                        ) : (
                            'Sign In'
                        )}
                        <BottomGradient />
                    </button>


                    <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />


                    {/* <div className="flex flex-col space-y-4 mb-3 justify-center">
                        <button
                            className=" relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                            type="button"
                            onClick={() => signIn('google')}
                        >
                            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                                Signin with Google
                            </span>
                            <BottomGradient />
                        </button>
                    </div> */}

                    <div className="flex w-full items-center justify-center mt-3">
                        <Link href={'/auth/signup'} className="text-slate-500 hover:text-slate-300">New user? Signup here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};
