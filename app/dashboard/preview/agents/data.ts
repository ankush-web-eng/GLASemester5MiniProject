export interface Agent {
    id: string;
    name: string;
    imagePath: string;
}

export interface CategoryAgents {
    [key: string]: Agent[];
}

export const categoryAgents: CategoryAgents = {
    blog: [
        { id: '1', name: 'Blog Expert', imagePath: '/logos/blog_generator.png' },
        { id: '2', name: 'Content Pro', imagePath: '/logos/blog_generator.png' },
        { id: '3', name: 'Article Writer', imagePath: '/logos/blog_generator.png' },
        { id: '4', name: 'Storyteller AI', imagePath: '/logos/blog_generator.png' }
    ],
    linkedin: [
        { id: '1', name: 'LinkedIn Pro', imagePath: '/logos/linkedIn.png' },
        { id: '2', name: 'Business Writer', imagePath: '/logos/linkedIn.png' },
        { id: '3', name: 'Social Media Expert', imagePath: '/logos/linkedIn.png' },
        { id: '4', name: 'Professional Networker', imagePath: '/logos/linkedIn.png' }
    ],
    youtube: [
        { id: '1', name: 'Video Analyzer', imagePath: '/logos/youtube.png' },
        { id: '2', name: 'Summary Expert', imagePath: '/logos/youtube.png' },
        { id: '3', name: 'Content Curator', imagePath: '/logos/youtube.png' },
        { id: '4', name: 'Video Insight AI', imagePath: '/logos/youtube.png' }
    ],
    travel: [
        { id: '1', name: 'Journey Expert', imagePath: '/logos/travel_planner-removebg-preview.png' },
        { id: '2', name: 'Travel Planner', imagePath: '/logos/travel_planner-removebg-preview.png' },
        { id: '3', name: 'Route Optimizer', imagePath: '/logos/travel_planner-removebg-preview.png' },
        { id: '4', name: 'Travel Assistant', imagePath: '/logos/travel_planner-removebg-preview.png' }
    ]
};
