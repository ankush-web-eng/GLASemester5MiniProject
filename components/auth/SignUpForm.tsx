'use client';
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import { cn } from "@/lib/utils";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RiLoader2Line } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SignupFormData = {
    firstname: string;
    email: string;
    password: string;
};

type VerifyFormData = {
    verifyCode: string;
}

export function SignupForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isVerify, setIsVerify] = useState(false);

    const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
        setLoading(true);
        console.log(data);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`, data);
            if (response.status === 201) {
                toast({
                    title: "Success",
                    description: response.data.message,
                    duration: 2000,
                });
            }
            localStorage.setItem('email', data.email);
            setIsVerify(true);
        } catch (error) {
            const axiosError = error as AxiosError<string>;
            const errorMessage = axiosError.response?.data || "There was a problem with your sign-up. Please try again.";
            toast({
                title: "Sign Up Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (isVerify) {
        return <VerifyForm />;
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-white dark:bg-black">
            <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-2xl bg-white dark:bg-black shadow-blue-950">
                <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                    Welcome to {process.env.NEXT_PUBLIC_APP_NAME}
                </h2>

                <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                        <LabelInputContainer>
                            <Label htmlFor="firstname">First name</Label>
                            <Input
                                id="firstname"
                                placeholder="imagine"
                                {...register("firstname", { required: true })}
                            />
                            {errors.firstname && <span className="text-red-500 text-sm">First name is required</span>}
                        </LabelInputContainer>
                    </div>

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
                            'Sign Up'
                        )}
                        <BottomGradient />
                    </button>

                    <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
                    <div className="flex w-full items-center justify-center mt-3">
                        <Link href={'/auth/signin'} className="text-slate-500 hover:text-slate-300">Already registered ? Signin here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

export const LabelInputContainer = ({
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

const VerifyForm = () => {

    const [loading, setlaoding] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormData>();
    const { toast } = useToast();
    const router = useRouter();

    const onSubmit: SubmitHandler<VerifyFormData> = async (data) => {
        setlaoding(true);
        try {
            const formdata = { ...data, email: localStorage.getItem('email') }
            console.log(formdata);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verify`, formdata)
            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: response.data.message,
                    duration: 2000
                })
            }
            localStorage.removeItem('email');
            router.replace('/auth/signin');
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            const errorMessage = axiosError.response?.data.message
            toast({
                title: "Verification Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 3000
            })
        } finally {
            setlaoding(false);
        }
    }

    return (
        <div className="min-h-screen flex justify-center items-center dark:bg-[#0f0a39]">
            <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-2xl bg-white dark:bg-black shadow-blue-950">
                <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                    Verify your email
                </h2>

                <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                        <LabelInputContainer>
                            <Label htmlFor="firstname">Verification code</Label>
                            <Input
                                id="firstname"
                                placeholder={`Enter otp sent to ${localStorage.getItem('email')}`}
                                {...register("verifyCode", { required: true })}
                            />
                            {errors.verifyCode && <span className="text-red-500 text-sm">Verification code is required</span>}
                        </LabelInputContainer>
                    </div>

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
                            'Verify'
                        )}
                        <BottomGradient />
                    </button>

                    <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

                </form>
            </div>
        </div>
    )
}