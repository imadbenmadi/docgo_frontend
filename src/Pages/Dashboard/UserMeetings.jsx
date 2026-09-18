import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  GraduationCap,
  Globe2,
  Loader2,
  Radio,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../utils/apiClient";

/**
 * The live sessions of the courses and programmes someone is enrolled on.
 *
 * A meeting is an appointment, so the page reads as a diary: the next one is
 * shown large with a countdown, the rest follow underneath, and each card says
 * which course or programme it belongs to and links to it. The join button
 * only opens the link once the meeting is open — a quarter of an hour before
 * it starts — which is why it counts down instead of failing.
 */

const ITEM = {
  course: { icon: GraduationCap, label: "Cours", path: (id) => `/Courses/${id}` },
  program: { icon: Globe2, label: "Programme", path: (id) => `/Programs/${id}` },
};

const when = (value, lang) =>
  value
    ? new Date(value).toLocaleString(lang === "ar" ? "ar" : "fr-FR", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "—";

/** "dans 2 h 15", "dans 3 jours", "maintenant". */
const countdown = (target, t) => {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return t("meetings.now", "maintenant");
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return t("meetings.inMinutes", `dans ${minutes} min`, { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return t("meetings.inHours", `dans ${hours} h ${minutes % 60 ? minutes % 60 : ""}`.trim(), {
      count: hours,
    });
  const days = Math.round(hours / 24);
  return t("meetings.inDays", `dans ${days} jour${days > 1 ? "s" : ""}`, { count: days });
};

const MeetingCard = ({ meet, onJoin, joining, featured, t, lang }) => {
  const kind = ITEM[meet.itemType] || ITEM.course;
  const Icon = kind.icon;
  const live = meet.state === "live";
  const cancelled = meet.state === "cancelled";

  return (
    <div
      className={`rounded-2xl p-5 ring-1 transition ${
        featured
          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-blue-500 shadow-lg"
          : "bg-white ring-gray-200"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                <Radio className="h-3 w-3 animate-pulse" />
                {t("meetings.live", "En direct")}
              </span>
            )}
            {cancelled && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                {t("meetings.cancelled", "Annulée")}
              </span>
            )}
            {!live && !cancelled && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  featured ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                }`}
              >
                {countdown(meet.opensAt || meet.scheduledTime, t)}
              </span>
            )}
          </div>

          <p
            className={`mt-2 truncate text-lg font-bold ${
              featured ? "text-white" : "text-gray-900"
            }`}
          >
            {meet.title || t("meetings.session", "Séance")}
          </p>

          <Link
            to={kind.path(meet.itemId)}
            className={`mt-1 inline-flex items-center gap-1.5 text-sm hover:underline ${
              featured ? "text-blue-100" : "text-blue-600"
            }`}
          >
            <Icon className="h-4 w-4" />
            {meet.itemTitle || kind.label}
          </Link>

          <p
            className={`mt-2 flex items-center gap-2 text-sm ${
              featured ? "text-blue-50" : "text-gray-600"
            }`}
          >
            <CalendarClock className="h-4 w-4" />
            {when(meet.scheduledTime, lang)} · {meet.duration} min
          </p>

          {meet.description && (
            <p
              className={`mt-1 text-sm ${featured ? "text-blue-100" : "text-gray-500"}`}
            >
              {meet.description}
            </p>
          )}
        </div>

        <button
          onClick={() => onJoin(meet)}
          disabled={!live || joining}
          title={
            live
              ? t("meetings.join", "Rejoindre")
              : t("meetings.opensSoon", "Le lien s'ouvre 15 minutes avant le début.")
          }
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            featured
              ? "bg-white text-blue-700 hover:bg-blue-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {joining ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-4 w-4" />
          )}
          {live
            ? t("meetings.join", "Rejoindre")
            : cancelled
              ? t("meetings.cancelled", "Annulée")
              : t("meetings.notYet", "Pas encore ouverte")}
        </button>
      </div>
    </div>
  );
};

const UserMeetings = () => {
  const { t, i18n } = useTranslation();
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  const load = useCallback(() => {
    apiClient
      .get("/Users/meets")
      .then(({ data }) => setMeets(data?.meets || []))
      .catch(() => setMeets([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // A meeting becomes joinable while the page is open, so the states are
    // refreshed rather than frozen at load time.
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  const join = async (meet) => {
    setJoining(meet.id);
    try {
      const { data } = await apiClient.get(`/Users/meets/${meet.id}/join`);
      if (data?.meetingLink) {
        window.open(data.meetingLink, "_blank", "noopener");
      } else {
        toast(
          t("meetings.notOpen", "Cette réunion n'est pas encore ouverte."),
          { icon: "🕒" },
        );
        load();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          t("meetings.joinFailed", "Impossible d'ouvrir la réunion."),
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

  const [next, ...rest] = meets;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
        <CalendarClock className="h-6 w-6 text-blue-600" />
        {t("meetings.title", "Réunions à venir")}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {t(
          "meetings.subtitle",
          "Les séances en direct de vos cours et de vos programmes.",
        )}
      </p>

      {!meets.length ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center text-gray-500 ring-1 ring-gray-200">
          {t("meetings.empty", "Aucune réunion programmée pour le moment.")}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <MeetingCard
            meet={next}
            onJoin={join}
            joining={joining === next.id}
            featured
            t={t}
            lang={i18n.language}
          />
          {rest.map((m) => (
            <MeetingCard
              key={m.id}
              meet={m}
              onJoin={join}
              joining={joining === m.id}
              t={t}
              lang={i18n.language}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMeetings;
