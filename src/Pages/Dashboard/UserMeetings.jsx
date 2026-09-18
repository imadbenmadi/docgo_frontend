import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, ExternalLink, Loader2, Video } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../utils/apiClient";

/**
 * Live meetings for the courses the user is enrolled on. The link itself is
 * only handed over once the meeting has started — that check lives on the
 * server, this page just asks for it.
 */

const when = (value, lang) =>
  value
    ? new Date(value).toLocaleString(lang === "ar" ? "ar" : "fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "—";

const UserMeetings = () => {
  const { t, i18n } = useTranslation();
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    apiClient
      .get("/Users/Courses/meets")
      .then(({ data }) => setMeets(data?.meets || []))
      .catch(() => setMeets([]))
      .finally(() => setLoading(false));
  }, []);

  const join = async (meet) => {
    setJoining(meet.id);
    try {
      const { data } = await apiClient.get(`/Users/Courses/meets/${meet.id}/join`);
      if (data?.meetingLink) window.open(data.meetingLink, "_blank", "noopener");
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          t("meetings.notOpen", "This meeting is not open yet."),
      );
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <CalendarClock className="h-6 w-6 text-blue-600" />
        {t("meetings.title", "Réunions à venir")}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {t(
          "meetings.subtitle",
          "Les séances en direct des cours auxquels vous êtes inscrit.",
        )}
      </p>

      {!meets.length ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center text-gray-500 ring-1 ring-gray-200">
          {t("meetings.empty", "Aucune réunion programmée pour le moment.")}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {meets.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {m.title || m.meetCourse?.Title || t("meetings.session", "Séance")}
                </p>
                {m.meetCourse?.Title && (
                  <p className="text-sm text-gray-500">{m.meetCourse.Title}</p>
                )}
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <CalendarClock className="h-4 w-4" />
                  {when(m.scheduledTime, i18n.language)} · {m.duration} min
                </p>
                {m.description && (
                  <p className="mt-1 text-sm text-gray-500">{m.description}</p>
                )}
              </div>
              <button
                onClick={() => join(m)}
                disabled={joining === m.id || m.status === "cancelled"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {joining === m.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : m.status === "cancelled" ? (
                  <ExternalLink className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                {m.status === "cancelled"
                  ? t("meetings.cancelled", "Annulée")
                  : t("meetings.join", "Rejoindre")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMeetings;
