import { useRouteError } from "react-router-dom";
import AppErrorScreen from "../components/AppErrorScreen";

// Thin wrapper so the router's errorElement and any local boundary render the
// same screen. AppErrorScreen is kept identical in the dashboard.
function ErrorElement() {
    const error = useRouteError();
    return <AppErrorScreen error={error} app="frontend" />;
}

export default ErrorElement;
