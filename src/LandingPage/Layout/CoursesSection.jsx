import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import img from "../../assets/image.png";
import CardCourse from "../../components/CardCourse";
import Container from "../../components/Container";

function CoursesSection({ featuredCourses, latestCourses }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const carouselRef = useRef(null);
  const scrollRafRef = useRef(null);

  // Use featured courses or fallback to latest courses or null
  const coursesToDisplay =
    featuredCourses && featuredCourses.length > 0
      ? featuredCourses
      : latestCourses && latestCourses.length > 0
        ? latestCourses
        : null;

  useEffect(() => {
    const updateMaxScroll = () => {
      if (carouselRef.current) {
        setMaxScroll(
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth,
        );
      }
    };

    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);

    return () => window.removeEventListener("resize", updateMaxScroll);
  }, []);

  const handleScroll = () => {
    if (!carouselRef.current) return;

    if (scrollRafRef.current != null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      if (!carouselRef.current) return;

      const scrollPos = Math.abs(carouselRef.current.scrollLeft);
      setScrollPosition((prev) => {
        // Avoid tiny updates that just cause extra renders
        return Math.abs(prev - scrollPos) < 1 ? prev : scrollPos;
      });
    });
  };

  const handleMouseDown = (e) => {
    if (carouselRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - carouselRef.current.offsetLeft);
      setScrollLeft(carouselRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startX;

    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  const handleScrollButton = (direction) => {
    const scrollAmount = 300;
    if (carouselRef.current) {
      const scrollValue = direction === "right" ? scrollAmount : -scrollAmount;

      const adjustedScrollValue = isRTL ? -scrollValue : scrollValue;
      carouselRef.current.scrollBy({
        left: adjustedScrollValue,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {coursesToDisplay && coursesToDisplay.length > 0 ? (
        <Container>
          <div id="Coureses" className="relative px-2 sm:px-4 md:px-6">
            {/* <h2 className="lg:text-2xl sm:text-xl sm-sm:text-lg font-medium  text-gray-700 text-center mb-8">
              {t("DeepenYourKnowledgeWithOurCourses", "Deepen your knowledge with our courses")}
            </h2> */}

            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide"
              style={{
                direction: isRTL ? "rtl" : "ltr",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {coursesToDisplay.map((course, index) => (
                <div key={course.id || index} className="flex-shrink-0">
                  <CardCourse
                    id={course.id}
                    url={
                      course.Image
                        ? `${import.meta.env.VITE_API_URL}${course.Image}`
                        : course.url || img
                    }
                    title={course.Title || course.title}
                    description={course.Description || course.description}
                    price={course.Price || course.price}
                  />
                </div>
              ))}
            </div>

            <button
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full ${
                scrollPosition <= 0 ? "hidden" : ""
              }`}
              onClick={() => handleScrollButton("left")}
              aria-label={t("Previous", "Previous")}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full ${
                scrollPosition >= maxScroll ? "hidden" : ""
              }`}
              onClick={() => handleScrollButton("right")}
              aria-label={t("Next", "Next")}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </Container>
      ) : null}
    </>
  );
}

CoursesSection.propTypes = {
  featuredCourses: PropTypes.arrayOf(PropTypes.object),
  latestCourses: PropTypes.arrayOf(PropTypes.object),
};

export default CoursesSection;
