import type { Metadata } from "next";

export const siteConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || "AgentScope",
    description: process.env.NEXT_PUBLIC_SLOGAN_NAME || "Illuminate Your AI Choices: Test Once, Trust Always",
    url: "https://agentscope.ai",
    ogImage: "https://agentscope.ai/og-image.png",
    profileImage: "https://agentscope.ai/logo.png",
    twitter: "@agentscope",
    themeColor: "#33F9FF"
};

export const metadata: Metadata = {
    title: {
        default: `${siteConfig.name} - ${siteConfig.description}`,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: ["AgentScope", "AI Testing", "AI Evaluation", "AI Tools"],
    authors: [{ name: "AgentScope Team" }],
    creator: "AgentScope",

    metadataBase: new URL(siteConfig.url),
    alternates: {
        canonical: "/",
    },

    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteConfig.url,
        title: `${siteConfig.name} - ${siteConfig.description}`,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [{
            url: siteConfig.ogImage,
            width: 1200,
            height: 627,
            alt: siteConfig.name,
        }],
    },

    twitter: {
        card: "summary_large_image",
        creator: siteConfig.twitter,
        title: `${siteConfig.name} - ${siteConfig.description}`,
        description: siteConfig.description,
        images: [{
            url: siteConfig.ogImage,
            width: 1200,
            height: 627,
            alt: siteConfig.name,
        }],
    },

    manifest: "/manifest.webmanifest",

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // verification: {
    //     google: "",
    // },
};

export default siteConfig;