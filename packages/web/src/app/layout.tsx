import nextConfig from "@/next.config";
import { Metadata } from "next";
import { ClientWrapper } from "./client-layout";
import { jetbrainsMono, jetbrainsSans } from "./fonts";
import { getThemeScript } from "@/src/lib/general-utils";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Garza Glue",
    template: "%s | Garza Glue",
  },
  description:
    "AI integration platform. Build and manage integrations 10x faster with AI-powered data transformation and schema mapping.",
  keywords: ["API integration", "data transformation", "AI integration", "ETL", "data mapping"],
  authors: [{ name: "Garza Glue" }],
  openGraph: {
    title: "Garza Glue",
    description:
      "AI integration platform. Build and manage integrations 10x faster with AI-powered data transformation.",
    url: "https://s1.garzaglue.com",
    siteName: "Garza Glue",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garza Glue",
    description: "AI integration platform. Build and manage integrations 10x faster with AI.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://s1.garzaglue.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiEndpoint =
    process.env.API_ENDPOINT || "http://localhost:" + (process.env.API_PORT || 3002);
  const apiKey = process.env.AUTH_TOKEN || process.env.NEXT_PUBLIC_SUPERGLUE_API_KEY;

  if (!apiKey) {
    throw new Error("AUTH_TOKEN is not set and no other authentication provider is configured.");
  }

  const config = {
    garzaglueApiKey: apiKey,
    apiEndpoint,
    postHogKey: nextConfig.env?.NEXT_PUBLIC_POSTHOG_KEY,
    postHogHost: nextConfig.env?.NEXT_PUBLIC_POSTHOG_HOST,
    serverSession: {
      userId: "oss-admin",
      email: "",
      orgId: "default",
      orgName: "Personal",
      orgStatus: "free",
    },
  };

  return (
    <html
      lang="en"
      className={`${jetbrainsSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, interactive-widget=resizes-content, viewport-fit=cover"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Garza Glue" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeScript(),
          }}
        />
      </head>
      <body>
        <ClientWrapper config={config}>{children}</ClientWrapper>
      </body>
    </html>
  );
}
