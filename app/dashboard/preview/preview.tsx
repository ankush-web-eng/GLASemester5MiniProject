import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Expand, Minimize2, AlertCircle, RefreshCw, Clock, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

interface ApiResult {
    content: string | null;
    id: string;
    response_time?: number;
    error?: string;
}

interface ApiResponse {
    results: ApiResult[];
    status: string;
}

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={copyToClipboard}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Copy to clipboard"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4 text-gray-500" />
            )}
        </button>
    );
};

const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose prose-sm max-w-none dark:prose-invert"
        components={{
            code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    <div className="relative group">
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={String(children).replace(/\n$/, '')} />
                        </div>
                        <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            className="!mt-0"
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    <code className={className} {...props}>
                        {children}
                    </code>
                );
            },
            // Enhance other markdown elements
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            a: ({ href, children }) => (
                <a href={href} className="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            ),
            ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
            blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                    {children}
                </blockquote>
            ),
            table: ({ children }) => (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 my-4">
                        {children}
                    </table>
                </div>
            ),
            th: ({ children }) => (
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {children}
                </th>
            ),
            td: ({ children }) => (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {children}
                </td>
            ),
        }}
    >
        {content}
    </ReactMarkdown>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
            {message.includes("'str' object has no attribute 'get'")
                ? "Invalid response format detected. Please check the input data structure."
                : message}
        </AlertDescription>
    </Alert>
);

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ))}
    </div>
);
const TypewriterText = ({ content }: { content: string }) => {
    const [displayedContent, setDisplayedContent] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        setDisplayedContent("");
        setIsComplete(false);

        const interval = setInterval(() => {
            if (currentIndex < content.length) {
                setDisplayedContent(prev => prev + content[currentIndex]);
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, 20); // Adjust speed here (lower = faster)

        return () => clearInterval(interval);
    }, [content]);

    return (
        <div className="markdown-content">
            {isComplete ? (
                <MarkdownContent content={content} />
            ) : (
                <div className="font-mono">{displayedContent}</div>
            )}
        </div>
    );
};

const ContentCard = ({ result, isExpanded, onToggle }: { result: ApiResult; isExpanded: boolean; onToggle: () => void }) => {
    const hasError = result.error || !result.content;

    return (
        <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <h3 className="text-lg font-semibold">
                            Response {result.id}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        {result.response_time && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {result.response_time.toFixed(2)}ms
                            </div>
                        )}
                        {result.content && <CopyButton text={result.content} />}
                    </div>
                </div>

                <ScrollArea className={`${isExpanded ? 'h-96' : 'h-48'} transition-all duration-300 rounded-md bg-gray-50 p-4`}>
                    {hasError ? (
                        <div className="flex items-center text-red-500 gap-2 p-4 bg-red-50 rounded-md">
                            <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">
                            {result.error || "No content available"}
                        </span>
                        </div>
                    ) : (
                        result.content && (
                            isExpanded ? (
                                <TypewriterText content={result.content || ''} />
                            ) : (
                                <TypewriterText content={(result.content || '').slice(0, 200) + ((result.content || '').length > 200 ? '...' : '')} />
                            )
                        )
                    )}
                </ScrollArea>

                {result.content && result.content.length > 200 && (
                    <button
                        onClick={onToggle}
                        className="mt-4 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors duration-200 px-3 py-1 rounded-full hover:bg-blue-50"
                    >
                        {isExpanded ? (
                            <>
                                <Minimize2 className="h-4 w-4" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <Expand className="h-4 w-4" />
                                Show More
                            </>
                        )}
                    </button>
                )}
            </CardContent>
        </Card>
    )
};

const ContentComparison = () => {
    const [expandedPanels, setExpandedPanels] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [parsedData, setParsedData] = useState<ApiResult[] | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError('');
            try {
                const storedData = localStorage.getItem('responseData');
                if (!storedData) {
                    throw new Error('No data available');
                }

                const parsed = JSON.parse(storedData);
                const results = parsed.results || parsed;

                if (!Array.isArray(results)) {
                    throw new Error('Invalid data structure');
                }

                setParsedData(results);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An unexpected error occurred');
                setParsedData([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const safeData = Array.isArray(parsedData) ? parsedData : [];

    const data: ApiResponse = {
        results: safeData.map(item => ({
            content: item?.content || null,
            id: item?.id?.toString() || Math.random().toString(),
            response_time: item?.response_time,
            error: item?.error
        })),
        status: safeData.length > 0 ? "success" : "error"
    };
    const gridClassName = `grid gap-4 p-4 ${data.results.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
        data.results.length >= 3 ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 md:grid-cols-2'
        }`;

    if (loading) return <LoadingSkeleton />;

    if (error) return <ErrorMessage message={error} />;

    if (!data.results.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <RefreshCw className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No Results Available</h3>
                <p className="text-gray-500 mt-2">Try refreshing the page or checking your data source.</p>
            </div>
        );
    }

    return (
        <div className={gridClassName}>
            {data.results.map((result) => (
                <div key={result.id} className="transition-all duration-300">
                    <ContentCard
                        result={result}
                        isExpanded={expandedPanels.has(result.id)}
                        onToggle={() => {
                            const newExpanded = new Set(expandedPanels);
                            if (expandedPanels.has(result.id)) {
                                newExpanded.delete(result.id);
                            } else {
                                newExpanded.add(result.id);
                            }
                            setExpandedPanels(newExpanded);
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default ContentComparison;