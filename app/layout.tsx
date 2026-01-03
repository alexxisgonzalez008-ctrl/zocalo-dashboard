
import "@/app/globals.css";
import { Inter } from "next/font/google"; // Using next/font generic
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
    title: "Islara Dashboard",
    description: "Construction Project Management",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    inter.variable
                )}
            >
                <ThemeProvider defaultTheme="system" storageKey="islara-theme">
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
