import { useState, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { CourseSidebar } from "./CourseSidebar";
import { getCourseDetails } from "../../../API/Courses";
import useScrollLock from "../../../hooks/useScrollLock";

function AllContentVideosCourse() {
  const { courseId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    getCourseDetails(courseId)
      .then((res) => {
        const course = res?.data?.course || res?.data || res;
        setHasCertificate(
          course?.certificate === true && String(course?.uploadType) !== "zip",
        );
      })
      .catch(() => setHasCertificate(false));
  }, [courseId]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useScrollLock(sidebarOpen);

  return (
    <div className="flex w-full flex-col bg-white min-h-screen">
      {/* Mobile Header with Sidebar Toggle */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-[999]">
        <div className="flex  items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            Course Content
          </h1>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md  text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Toggle course menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[998]"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Container */}
      <div className="flex-1 w-full max-w-[1360px] w mx-auto px-4 ">
        <div className="flex gap-0  h-full">
          {/* Desktop Sidebar */}
          <div className="hidden md:block md:w-80 lg:w-96 flex-shrink-0">
            <CourseSidebar quizPassed={false} hasCertificate={hasCertificate} />
          </div>

          {/* Mobile Sidebar */}
          <div
            className={`md:hidden fixed top-0 left-0 h-[100dvh] w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[999] overscroll-contain ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {" "}
            <div className="h-full overflow-y-auto pt-16">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md sticky top-3 z-[999] text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                aria-label="Toggle course menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <CourseSidebar
                setSidebarOpen={setSidebarOpen}
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                quizPassed={false}
                hasCertificate={hasCertificate}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 pb-8">
            <div className="h-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllContentVideosCourse;
