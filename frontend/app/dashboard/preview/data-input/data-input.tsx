'use client';
import { FileUpload } from '@/components/ui/FileUpload';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from "@/components/ui/separator";

interface ApiResponse {
    content_type: string;
    recommended_agent: string;
    available_agents: string[];
    confidence_score: number;
    is_relevant: boolean;
}

export default function DataInput() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (files: File[]) => {
        if (files.length > 0 ) {
            setFile(files[0]);
            setTextContent(''); // Clear text input when file is selected
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextContent(e.target.value);
        setFile(null); // Clear file when text is entered
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            let formData: FormData | Record<string, string>;
            const hasFile = file !== null;

            if (hasFile) {
                const form = new FormData();
                form.append('file', file);
                formData = form;
            } else {
                formData = { content: textContent };
            }

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: !hasFile
                    ? { 'Content-Type': 'application/json' }
                    : undefined,
                body: !hasFile
                    ? JSON.stringify(formData)
                    : formData as FormData,
            });

            if (!response.ok) {
                throw new Error('Failed to analyze content');
            }

            const data: ApiResponse = await response.json();

            // Store response in localStorage
            localStorage.setItem('analysisResult', JSON.stringify(data));

            // Redirect to preview page
            router.push('/dashboard/preview/agents');
        } catch (error) {
            console.error('Error:', error);
            // Here you might want to show an error message to the user
        } finally {
            setIsLoading(false);
        }
    };

    const isSubmitDisabled = (
        (!file && !textContent.trim()) ||
        isLoading
    );

    return (
        <div className="container mx-auto px-4 py-3">
            <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-6 flex flex-col gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Upload Data</h3>
                        <div className="w-full min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                            <FileUpload
                                onChange={handleFileChange}
                            />
                        </div>
                        {file && (
                            <p className="text-sm text-gray-500">
                                Selected file: {file.name}
                            </p>
                        )}
                    </div>

                    <div className='flex justify-center'>
                        <div className="flex items-center gap-4 w-fit">
                            <Separator className="flex-grow" />
                            <span className="text-sm text-gray-500 font-medium">OR</span>
                            <Separator className="flex-grow" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Enter Description</h3>
                        <Textarea
                            placeholder="Enter your content here..."
                            className="min-h-[200px] w-full p-4"
                            value={textContent}
                            onChange={handleTextChange}
                            disabled={!!file}
                        />
                    </div>

                    <button
                        className="w-full mt-4 border rounded-xl py-2 px-3 bg-teal-500 text-white hover:bg-teal-600"
                        disabled={isSubmitDisabled || true} // Temporarily disable the button
                        onClick={handleSubmit}
                    >
                        {isLoading ? 'Processing...' : 'Next'}
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}