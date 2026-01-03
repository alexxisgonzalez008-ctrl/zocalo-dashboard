"use client";

import Dashboard from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage";
import LoginPage from "@/components/LoginPage";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

function HomeContent() {
    const { user, isLoading } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (user) {
        return <Dashboard />;
    }

    if (showLogin) {
        return <LoginPage onBack={() => setShowLogin(false)} />;
    }

    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
}

export default function Home() {
    return (
        <AuthProvider>
            <HomeContent />
        </AuthProvider>
    );
}
