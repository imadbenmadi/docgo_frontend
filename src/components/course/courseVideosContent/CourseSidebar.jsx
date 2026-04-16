import { useState } from "react";
import { FaCheck, FaCheckCircle, FaCircle, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

export function CourseSidebar({
  setSidebarOpen,
  sidebarOpen,
  quizPassed,
  hasCertificate = true,
}) {
  const [activeSectionId, setActiveSectionId] = useState(1);

  const handleSectionClick = (id) => {
    setActiveSectionId(id);
    setSidebarOpen(false); // Close sidebar on section click
  };

  const handleClickQuiz = () => {
    setSidebarOpen(false); // Close sidebar when clicking on quiz
  };
  const handleClickCertificate = () => {
    setSidebarOpen(false); // Close sidebar when clicking on certificate
  };

  const sections = [
    {
      id: 1,
      title: "Section 1 : Démarrage du design",
      completed: true,
    },
    {
      id: 2,
      title: "Section 2 : Comprendre les couleurs",
      completed: false,
    },
    {
      id: 3,
      title: "Section 3 : Typographie efficace",
      completed: false,
    },
    {
      id: 4,
      title: "Section 4 : Adobe Illustrator",
      completed: false,
    },
    {
      id: 5,
      title: "Vue d'ensemble du design",
      completed: false,
    },
  ];

  const allCompleted = sections.every((s) => s.completed);

  return (
    <aside className="   max-md:ml-0 max-md:w-full">
      <div className="flex   flex-col items-start pr-8 pl-20 border-r border-solid min-h-[1015px] text-zinc-800 max-md:px-5 max-md:mt-8">
        <h1 className="text-2xl font-semibold leading-9 text-zinc-800">
          Fondements du design : Des bases à la maîtrise professionnelle
        </h1>

        {/* Sections Navigation */}
        <section className="mt-8 max-w-full   w-[264px]">
          <h2 className="text-xl leading-10 text-zinc-800">Contenu du cours</h2>
          <nav className="mt-4 w-full text-sm leading-5 max-w-[264px]">
            {sections.map((section) => {
              const isActive = section.id === activeSectionId;
              return (
                <Link
                  to={section.completed ? `section${section.id}` : "#"}
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`flex gap-4 items-center p-4 w-full rounded-2xl border transition-all duration-200 text-left ${
                    section.completed
                      ? "border-green-600 text-green-600"
                      : isActive
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-zinc-800 text-zinc-800 hover:border-blue-400 hover:bg-blue-50"
                  } ${section.id > 1 ? "mt-4" : ""}`}
                >
                  {/* Icon */}
                  {section.completed ? (
                    <FaCheckCircle className="w-5 h-5 shrink-0 text-green-600" />
                  ) : (
                    <FaCircle className="w-5 h-5 shrink-0 text-gray-400" />
                  )}

                  {/* Title */}
                  <span className="flex-1">{section.title}</span>

                  {/* Check icon if completed */}
                  {section.completed && (
                    <FaCheck className="w-4 h-4 shrink-0 text-green-600" />
                  )}
                </Link>
              );
            })}
          </nav>
        </section>

        {/* Locked Features */}
        <section className="mt-8 text-xl leading-10 w-full max-w-[264px]">
          <div
            onClick={handleClickQuiz}
            className="mt-6 flex items-center gap-2"
          >
            {!allCompleted ? (
              <Link
                to="quiz"
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                <FaCheckCircle className="text-green-600" />
                Quiz débloqué
              </Link>
            ) : (
              <span className="text-gray-400 flex items-center gap-2">
                <FaLock /> Quiz (verrouillé)
              </span>
            )}
          </div>

          <div
            onClick={handleClickCertificate}
            className="mt-6 flex items-center gap-2"
          >
            {hasCertificate && (
              <>
                {quizPassed ? (
                  <Link
                    to="Certificate"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <FaCheckCircle className="text-green-600" />
                    Certificat + PDF
                  </Link>
                ) : (
                  <span className="text-gray-400 flex items-center gap-2">
                    <FaLock /> Certificat + PDF (verrouillé)
                  </span>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
