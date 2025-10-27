import { Card, CardContent } from "./ui/card";
import { motion } from 'framer-motion';

export const Skeleton = () => {
    return (
        <Card className="h-full overflow-hidden">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <motion.div
                        className="h-6 w-24 bg-gray-200 rounded"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="h-4 w-16 bg-gray-200 rounded"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2
                        }}
                    />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="h-4 bg-gray-200 rounded"
                            style={{ width: `${Math.random() * 40 + 60}%` }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};