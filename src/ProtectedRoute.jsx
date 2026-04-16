import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "./AppContext";
import MainLoading from "./MainLoading";

const getSafeNextPath = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    if (!raw.startsWith("/")) return null;
    if (raw.startsWith("//")) return null;
    return raw;
};

const ProtectedRoute = ({ children, requireAuth = true }) => {
    const { user, loading, checkAuthStatus } = useAppContext();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            if (!user && requireAuth) {
                await checkAuthStatus();
            }
            setIsChecking(false);
        };

        verifyAuth();
    }, [user, requireAuth, checkAuthStatus]);

    // Show loading while checking authentication
    if (loading || isChecking) {
        return <MainLoading />;
    }

    // If auth is required but user is not authenticated
    if (requireAuth && !user) {
        const next = `${location.pathname}${location.search}${location.hash || ""}`;
        const safeNext = getSafeNextPath(next);
        if (safeNext && !safeNext.toLowerCase().startsWith("/login")) {
            sessionStorage.setItem("postLoginRedirect", safeNext);
        }

        const nextParam = safeNext
            ? `?next=${encodeURIComponent(safeNext)}`
            : "";
        return (
            <Navigate
                to={`/login${nextParam}`}
                state={{ from: location }}
                replace
            />
        );
    }

    // If user is authenticated but trying to access auth pages
    if (
        !requireAuth &&
        user &&
        (location.pathname === "/login" || location.pathname === "/register")
    ) {
        let target = "/dashboard";
        try {
            const stored = sessionStorage.getItem("postLoginRedirect");
            const safe = getSafeNextPath(stored);
            if (safe) target = safe;
            sessionStorage.removeItem("postLoginRedirect");
        } catch {
            // ignore storage errors
        }
        return <Navigate to={target} replace />;
    }

    return children;
};

export default ProtectedRoute;
