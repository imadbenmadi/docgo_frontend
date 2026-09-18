import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  redirect,
  useParams,
} from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./ProtectedRoute";
import { getApiBaseUrl } from "./utils/apiBaseUrl";
import apiClient from "./utils/apiClient";

import ErrorElement from "./erorrhandle/ErrorElement";
const Login = lazy(() => import("./Pages/Auth/Login"));
const Register = lazy(() => import("./Pages/Auth/Register"));
const Blocked = lazy(() => import("./Pages/Auth/Blocked"));
const Deleted = lazy(() => import("./Pages/Auth/Deleted"));
const ForgotPassword = lazy(() => import("./Pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/Auth/ResetPassword"));
const Courses = lazy(() => import("./Pages/Courses"));
const FAQPage = lazy(() => import("./Pages/FAQPage"));
const PublicForm = lazy(() => import("./Pages/PublicForm"));
const FavoritesPage = lazy(() => import("./Pages/FavoritesPage"));
const Home = lazy(() => import("./Pages/Home"));
// One list of everything ordered, for all four products, with what to do
// next on each. The per-product "my applications" routes point at it: they
// read tables nothing writes to any more, and somebody whose receipt had been
// rejected had nowhere to find that out and no way to send another.
const MyOrders = lazy(() => import("./Pages/MyOrders"));
const PaymentPage = lazy(() => import("./Pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./Pages/PaymentSuccessPage"));
const ProgramDetails = lazy(() => import("./Pages/ProgramDetails").then((m) => ({ default: m.ProgramDetails })));
const Programs = lazy(() => import("./Pages/Programs").then((m) => ({ default: m.Programs })));
import { CourseDetails } from "./components/course/CourseDetails";
const Certificate = lazy(() => import("./Pages/Certificate"));
const VerifyCertificate = lazy(() => import("./Pages/VerifyCertificate"));
const Course = lazy(() => import("./Pages/Course"));
const CourseResources = lazy(() => import("./Pages/CourseResources"));
const CourseSections = lazy(() => import("./Pages/CourseSections"));
const CourseExploreZip = lazy(() => import("./Pages/CourseExploreZip"));
const UserDashboard = lazy(() => import("./Pages/Dashboard/UserDashboard"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const EditProfile = lazy(() => import("./Pages/Profile/EditProfile"));
const Profile = lazy(() => import("./Pages/Profile/Profile"));
const UserMessages_Default = lazy(() => import("./Pages/Dashboard/Messages/Default"));
const UserMessages = lazy(() => import("./Pages/Dashboard/Messages/UserMessages"));
const UserMessages_new = lazy(() => import("./Pages/Dashboard/Messages/UserMessages_new"));
const UserCertificates = lazy(() => import("./Pages/Dashboard/UserCertificates"));
const UserMeetings = lazy(() => import("./Pages/Dashboard/UserMeetings"));
const UserFavorites = lazy(() => import("./Pages/Dashboard/UserFavorites"));
const UserNotifications = lazy(() => import("./Pages/Dashboard/UserNotifications"));
const UserSettings = lazy(() => import("./Pages/Dashboard/UserSettings"));
const MyLearning = lazy(() => import("./Pages/Dashboard/MyLearning"));
const MyPrograms = lazy(() => import("./Pages/Dashboard/MyPrograms"));
const ProgramApplicationStatus = lazy(() => import("./Pages/ProgramApplicationStatus"));
// Other Services
const OtherServices = lazy(() => import("./Pages/OtherServices/OtherServices"));
const CVList = lazy(() => import("./Pages/OtherServices/CVList"));
const CVService = lazy(() => import("./Pages/OtherServices/CVService"));
const InternshipsList = lazy(() => import("./Pages/OtherServices/InternshipsList"));
const InternshipDetail = lazy(() => import("./Pages/OtherServices/InternshipDetail"));
// Auth protection loader
const protectedLoader = async ({ request }) => {
  const API_URL = getApiBaseUrl();

  const userRaw =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  let hasValidUser = false;
  if (userRaw) {
    try {
      const parsed = JSON.parse(userRaw);
      hasValidUser = !!parsed?.id;
    } catch {
      hasValidUser = false;
    }
  }

  // If we don't have a cached user, check cookie auth with the backend.
  // This prevents the login<->dashboard bounce on hard refresh.
  if (!hasValidUser) {
    try {
      const resp = await apiClient.get("/check_Auth", {
        validateStatus: () => true, // accept any status
      });

      if (resp.status === 200) {
        const data = resp.data;
        const authedUser = data?.user;
        if (authedUser?.id) {
          try {
            localStorage.setItem("user", JSON.stringify(authedUser));
            sessionStorage.setItem("user", JSON.stringify(authedUser));
          } catch {
            // ignore storage errors
          }
          hasValidUser = true;
        }
      }
    } catch {
      // ignore network errors; will fall back to redirect below
    }
  }

  if (!hasValidUser) {
    const url = new URL(request.url);
    const next = `${url.pathname}${url.search}${url.hash}`;
    try {
      if (next && !next.toLowerCase().startsWith("/login")) {
        sessionStorage.setItem("postLoginRedirect", next);
      }
    } catch {
      // ignore storage errors
    }
    return redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return null;
};

/** Old /Courses/:id/videos links, kept alive by pointing at the sections. */
const LegacyVideosRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={`/Courses/${courseId}/watch`} replace />;
};

const Routers = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "blocked",
        caseSensitive: false,
        element: <Blocked />,
      },
      {
        path: "deleted",
        caseSensitive: false,
        element: <Deleted />,
      },
      {
        path: "Programs",
        caseSensitive: false,
        element: <Programs />,
      },
      {
        path: "Programs/:programId",
        caseSensitive: false,
        element: <ProgramDetails />,
      },
      {
        path: "Programs/:programId/status",
        caseSensitive: false,
        loader: protectedLoader,
        element: <ProgramApplicationStatus />,
      },
      {
        path: "program/:programId/status",
        caseSensitive: false,
        loader: protectedLoader,
        element: <ProgramApplicationStatus />,
      },
      {
        path: "my-orders",
        caseSensitive: false,
        loader: protectedLoader,
        element: <MyOrders />,
      },
      {
        path: "myapplications",
        caseSensitive: false,
        loader: protectedLoader,
        element: <MyOrders />,
      },
      {
        path: "my-applications",
        caseSensitive: false,
        loader: protectedLoader,
        element: <MyOrders />,
      },
      {
        path: "Courses",
        caseSensitive: false,
        element: <Courses />,
      },
      {
        path: "faq",
        caseSensitive: false,
        element: <FAQPage />,
      },
      {
        path: "forms/:slug",
        element: <PublicForm />,
      },
      {
        path: "favorites",
        caseSensitive: false,
        element: <FavoritesPage />,
      },
      {
        path: "other-services",
        caseSensitive: false,
        element: <OtherServices />,
      },
      {
        path: "other-services/cv",
        caseSensitive: false,
        element: <CVList />,
      },
      {
        path: "other-services/cv/:id",
        caseSensitive: false,
        element: <CVService />,
      },
      {
        path: "other-services/internships",
        caseSensitive: false,
        element: <InternshipsList />,
      },
      {
        path: "other-services/internships/:id",
        caseSensitive: false,
        element: <InternshipDetail />,
      },
      {
        path: "other-services/my-applications",
        caseSensitive: false,
        loader: protectedLoader,
        element: <MyOrders />,
      },
      {
        path: "notifications",
        caseSensitive: false,
        loader: protectedLoader,
        element: <UserNotifications />,
      },
      {
        path: "Courses/:courseId",
        caseSensitive: false,
        element: <Course />,
        children: [
          {
            index: true,
            element: <CourseDetails />,
          },
        ],
      },
      {
        path: "Courses/:courseId/watch",
        caseSensitive: false,
        loader: protectedLoader,
        element: <CourseSections />,
      },
      {
        // Backward-compatible alias used by some payment redirects
        path: "MyCourses/:courseId",
        caseSensitive: false,
        loader: protectedLoader,
        element: <CourseSections />,
      },
      {
        path: "Courses/:courseId/watch/certificate",
        caseSensitive: false,
        loader: protectedLoader,
        element: <Certificate />,
      },
      {
        path: "verify/certificate/:certificateId",
        caseSensitive: false,
        element: <VerifyCertificate />,
      },
      {
        path: "Courses/:courseId/watch/resources",
        caseSensitive: false,
        loader: protectedLoader,
        element: <CourseResources />,
      },
      {
        path: "Courses/:courseId/explore",
        caseSensitive: false,
        loader: protectedLoader,
        element: <CourseExploreZip />,
      },
      // The flat per-course video list is gone; everything lives in
      // sections now. Old links land on the section player.
      {
        path: "Courses/:courseId/videos",
        caseSensitive: false,
        element: <LegacyVideosRedirect />,
      },
      {
        path: "Courses/:courseId/videos/*",
        caseSensitive: false,
        element: <LegacyVideosRedirect />,
      },
      {
        path: "profile",
        caseSensitive: false,
        loader: protectedLoader,
        element: <Profile />,
      },
      {
        path: "profile/edit",
        caseSensitive: false,
        loader: protectedLoader,
        element: <EditProfile />,
      },
      {
        path: "payment/course/:courseId",
        caseSensitive: false,
        loader: protectedLoader,
        element: <PaymentPage />,
      },
      {
        path: "payment/program/:programId",
        caseSensitive: false,
        loader: protectedLoader,
        element: <PaymentPage />,
      },
      {
        path: "payment/cv/:cvId",
        caseSensitive: false,
        loader: protectedLoader,
        element: <PaymentPage />,
      },
      {
        path: "payment/internship/:internshipId",
        caseSensitive: false,
        loader: protectedLoader,
        element: <PaymentPage />,
      },
      {
        path: "payment/success/course/:courseId",
        caseSensitive: false,
        loader: protectedLoader,
        element: <PaymentSuccessPage />,
      },
      {
        path: "payment/success/program/:programId",
        caseSensitive: false,
        loader: protectedLoader,
        element: <PaymentSuccessPage />,
      },
      {
        path: "dashboard",
        caseSensitive: false,
        loader: protectedLoader,
        element: <UserDashboard />,
        children: [
          {
            index: true,
            element: <div />, // This will be handled by the UserDashboard component
          },
          {
            path: "my-learning",
            caseSensitive: false,
            element: <MyLearning />,
          },
          {
            path: "my-programs",
            caseSensitive: false,
            element: <MyPrograms />,
          },
          {
            path: "messages",
            caseSensitive: false,
            element: <UserMessages_Default />,
            children: [
              {
                index: true,
                element: <UserMessages />,
              },
              {
                path: "new",
                caseSensitive: false,
                element: <UserMessages_new />,
              },
            ],
          },

          {
            path: "notifications",
            caseSensitive: false,
            element: <UserNotifications />,
          },

          {
            path: "settings",
            caseSensitive: false,
            element: <UserSettings />,
          },
          {
            path: "favorites",
            caseSensitive: false,
            element: <UserFavorites />,
          },
          {
            path: "my-orders",
            caseSensitive: false,
            element: <MyOrders />,
          },
          // Older links to the same page.
          { path: "applications", element: <Navigate to="/dashboard/my-orders" replace /> },
          { path: "applications/:type", element: <Navigate to="/dashboard/my-orders" replace /> },
          { path: "service-applications", element: <Navigate to="/dashboard/my-orders" replace /> },
          {
            path: "cv",
            caseSensitive: false,
            element: <CVList />,
          },
          {
            path: "cv/:id",
            caseSensitive: false,
            element: <CVService />,
          },
          {
            path: "internships",
            caseSensitive: false,
            element: <InternshipsList />,
          },
          {
            path: "internships/:id",
            caseSensitive: false,
            element: <InternshipDetail />,
          },
          {
            path: "meetings",
            caseSensitive: false,
            element: <UserMeetings />,
          },
          {
            path: "certificates",
            caseSensitive: false,
            element: <UserCertificates />,
          },
          { path: "all-payments", element: <Navigate to="/dashboard/my-orders" replace /> },
        ],
      },
    ],
  },
  {
    path: "login",
    caseSensitive: false,
    element: (
      <ProtectedRoute requireAuth={false}>
        <Login />
      </ProtectedRoute>
    ),
  },
  {
    path: "Login",
    caseSensitive: false,
    element: (
      <ProtectedRoute requireAuth={false}>
        <Login />
      </ProtectedRoute>
    ),
  },
  {
    path: "register",
    caseSensitive: false,
    element: (
      <ProtectedRoute requireAuth={false}>
        <Register />
      </ProtectedRoute>
    ),
  },
  {
    path: "Register",
    caseSensitive: false,
    element: (
      <ProtectedRoute requireAuth={false}>
        <Register />
      </ProtectedRoute>
    ),
  },
  {
    path: "forgot-password",
    caseSensitive: false,
    element: (
      <ProtectedRoute requireAuth={false}>
        <ForgotPassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "reset-password",
    caseSensitive: false,
    element: (
      <ProtectedRoute requireAuth={false}>
        <ResetPassword />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
  // Redirects for legacy/incorrect URLs
  {
    path: "Enrollments",
    caseSensitive: false,
    loader: protectedLoader,
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "Applications/Programs",
    caseSensitive: false,
    loader: protectedLoader,
    element: <Navigate to="/dashboard/applications/programs" replace />,
  },
]);

export default Routers;
