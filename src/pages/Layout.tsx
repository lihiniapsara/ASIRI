import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div className="h-screen flex">
            <main className="pt-16 h-full overflow-y-auto flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;