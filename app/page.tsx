import Dashboard from "@/components/Dashboard";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Home() {
    return (
        <AuthProvider>
            <Dashboard />
        </AuthProvider>
    );
}
