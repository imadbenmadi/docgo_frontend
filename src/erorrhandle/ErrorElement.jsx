import { useRouteError } from "react-router-dom";
import AppErrorScreen from "../components/AppErrorScreen";

/**
 * The site's error screen.
 *
 * It used to print the raw error straight onto the page -- "Error Details:"
 * with a stack trace -- to whichever visitor happened to hit the bug, and
 * report it to nobody. Nothing reached the admin log, so the only way anyone
 * learned about a crash was if a person thought to mention it.
 *
 * AppErrorScreen is shared with the dashboard: same reference code, same
 * automatic report, same folded-away technical detail.
 */
function ErrorElement() {
    const error = useRouteError();
    return <AppErrorScreen error={error} app="frontend" />;
}

export default ErrorElement;
