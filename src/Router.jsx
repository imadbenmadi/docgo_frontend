import { createBrowserRouter, Navigate, redirect } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./ProtectedRoute";
import { getApiBaseUrl } from "./utils/apiBaseUrl";
import apiClient from "./utils/apiClient";

import ErrorElement from "./erorrhandle/ErrorElement";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Blocked from "./Pages/Auth/Blocked";
import Deleted from "./Pages/Auth/Deleted";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";
import Courses from "./Pages/Courses";
import FAQPage from "./Pages/FAQPage";
import FavoritesPage from "./Pages/FavoritesPage";
import Home from "./Pages/Home";
import MyApplications from "./Pages/MyApplications";
import PaymentPage from "./Pages/PaymentPage";
import PaymentSuccessPage from "./Pages/PaymentSuccessPage";
import { ProgramDetails } from "./Pages/ProgramDetails";
import { Programs } from "./Pages/Programs";

import { CourseDetails } from "./components/course/CourseDetails";
import AllContentVideosCourse from "./components/course/courseVideosContent/AllContentVideosCourse";
import CourseVideosContent from "./components/course/courseVideosContent/CourseVideosContent";
import Certificate from "./Pages/Certificate";
import VerifyCertificate from "./Pages/VerifyCertificate";
import Course from "./Pages/Course";
import CourseResources from "./Pages/CourseResources";
import CourseVideos from "./Pages/CourseVideos";
import CourseSections from "./Pages/CourseSections";
import CourseExploreZip from "./Pages/CourseExploreZip";
import UserDashboard from "./Pages/Dashboard/UserDashboard";
import NotFound from "./pages/NotFound";
import EditProfile from "./Pages/Profile/EditProfile";
import Profile from "./Pages/Profile/Profile";
import QuizContent from "./Pages/QuizContent";

import UserMessages_Default from "./Pages/Dashboard/Messages/Default";
import UserMessages from "./Pages/Dashboard/Messages/UserMessages";
import UserMessages_new from "./Pages/Dashboard/Messages/UserMessages_new";

import UserApplications from "./Pages/Dashboard/UserApplications";
import UserCertificates from "./Pages/Dashboard/UserCertificates";
import UserFavorites from "./Pages/Dashboard/UserFavorites";
import UserNotifications from "./Pages/Dashboard/UserNotifications";
import UserSettings from "./Pages/Dashboard/UserSettings";

import MyLearning from "./Pages/Dashboard/MyLearning";
import MyPrograms from "./Pages/Dashboard/MyPrograms";
import UserAllPaymentsPage from "./Pages/Dashboard/UserAllPaymentsPage";
import ProgramApplicationStatus from "./Pages/ProgramApplicationStatus";

// Other Services
import OtherServices from "./Pages/OtherServices/OtherServices";
import CVService from "./Pages/OtherServices/CVService";
import InternshipsList from "./Pages/OtherServices/InternshipsList";
import InternshipDetail from "./Pages/OtherServices/InternshipDetail";
import MyOtherServicesApplications from "./Pages/OtherServices/MyOtherServicesApplications";

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
        path: "myapplications",
        caseSensitive: false,
        loader: protectedLoader,
        element: <MyApplications />,
      },
      {
        path: "my-applications",
        caseSensitive: false,
        loader: protectedLoader,
        element: <MyApplications />,
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
        element: <MyOtherServicesApplications />,
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
      {
        path: "Courses/:courseId/videos",
        caseSensitive: false,
        element: <AllContentVideosCourse />,
        children: [
          {
            index: true,
            element: <CourseVideosContent />,
          },
          {
            path: ":videoId",
            caseSensitive: false,
            element: <CourseVideosContent />,
          },
          {
            path: "quiz",
            caseSensitive: false,
            element: <QuizContent />,
          },
          {
            path: "certificate",
            caseSensitive: false,
            element: <Certificate />,
          },
        ],
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
            path: "applications",
            caseSensitive: false,
            element: <UserApplications />,
          },
          {
            path: "applications/:type",
            caseSensitive: false,
            element: <UserApplications />,
          },
          {
            path: "service-applications",
            caseSensitive: false,
            element: <MyOtherServicesApplications />,
          },
          {
            path: "cv",
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
            path: "certificates",
            caseSensitive: false,
            element: <UserCertificates />,
          },
          {
            path: "all-payments",
            caseSensitive: false,
            element: <UserAllPaymentsPage />,
          },
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
