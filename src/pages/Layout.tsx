import { Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import { useState } from "react";

const Layout = () => {
    const { isAuthenticating } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard"); // default tab

    if (isAuthenticating) return <div>Loading...</div>;

    return (
        <div className="h-screen flex">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="pt-16 h-full overflow-y-auto flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
