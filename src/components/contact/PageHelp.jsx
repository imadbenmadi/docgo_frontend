import { useLocation, useParams } from "react-router-dom";
import AskQuestion from "./AskQuestion";

/**
 * One way to write in, on every page.
 *
 * Contact forms had grown one per page: a panel in the course sidebar, another
 * on the programme, a "report a problem" box under the player, and the widget
 * itself mounted by hand on six more pages. Same form, four placements, each
 * with its own idea of what to send.
 *
 * This mounts the widget once, beside the router, and works out what the page
 * is about from the URL. What the reader chooses inside it — a question or a
 * problem — decides which queue it lands in; where they were standing is the
 * subject, and they never have to say it.
 */

/** The URL says what the page is about; nobody should have to retype it. */
const subjectOf = (pathname, params) => {
  const path = pathname.toLowerCase();

  if (params.courseId || /^\/courses\/[^/]+/.test(path)) {
    return { context: "course", subjectType: "course", subjectId: params.courseId };
  }
  if (params.programId || /^\/programs\/[^/]+/.test(path)) {
    return { context: "program", subjectType: "program", subjectId: params.programId };
  }
  if (path.startsWith("/other-services/cv") || path.startsWith("/dashboard/cv")) {
    return { context: "cv", subjectType: params.id ? "cv" : null, subjectId: params.id };
  }
  if (
    path.startsWith("/other-services/internships") ||
    path.startsWith("/dashboard/internships")
  ) {
    return {
      context: "internship",
      subjectType: params.id ? "internship" : null,
      subjectId: params.id,
    };
  }
  if (path.startsWith("/payment") || path.startsWith("/dashboard/my-orders")) {
    return { context: "payment", subjectType: null, subjectId: null };
  }
  if (path.startsWith("/dashboard")) {
    return { context: "dashboard", subjectType: null, subjectId: null };
  }
  return { context: "landing", subjectType: null, subjectId: null };
};

/** Pages where a floating button would be in the way or beside the point. */
const QUIET = [
  /^\/login/,
  /^\/register/,
  /^\/forgot-password/,
  /^\/reset-password/,
  /^\/verify/,
  /^\/contact/,
  /^\/forms\//,
];

const PageHelp = () => {
  const location = useLocation();
  const params = useParams();
  const path = location.pathname.toLowerCase();
  if (QUIET.some((re) => re.test(path))) return null;

  const { context, subjectType, subjectId } = subjectOf(path, params);

  return (
    <AskQuestion
      key={`${context}:${subjectId || ""}`}
      context={context}
      subjectType={subjectType}
      subjectId={subjectId}
    />
  );
};

export default PageHelp;
