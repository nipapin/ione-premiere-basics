import ThemeWrapper from "@/theme/ThemeWrapper";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import Script from "next/script";
import "../globals.css";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    return <html lang="en">
        <head>
            <link href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@200,400&display=swap" rel="stylesheet" />
            <Script strategy="afterInteractive" async src="https://www.googletagmanager.com/gtag/js?id=G-7CHVX35WV6" />
            <Script id="ga-init" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || [];
                function gtag() {
                    dataLayer.push(arguments);
                }
                gtag("js", new Date());
                gtag("config", "G-7CHVX35WV6");`}
            </Script>
        </head>
        <body>
            <AppRouterCacheProvider options={{ key: "odin" }}>
                <ThemeWrapper>
                    {children}
                </ThemeWrapper>
            </AppRouterCacheProvider>
        </body>
    </html>

}