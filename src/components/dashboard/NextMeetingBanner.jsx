import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { CalendarClock, Radio, Video } from "lucide-react";
import apiClient from "../../services/apiClient";

/**
 * The next live session, on the page people land on.
 *
 * A meeting is the one thing on this dashboard that happens at a time, so it
 * is announced rather than listed: while it is on, the banner turns red and
 * offers the link; before that it says when it opens and links to the course
 * or programme it belongs to.
 */

const ITEM = {
  course: { path: (id) => `/Courses/${id}`, key: "meetings.openCourse", fallback: "Voir le cours" },
  program: {
    path: (id) => `/Programs/${id}`,
    key: "meetings.openProgram",
    fallback: "Voir le programme",
  },
};

const when = (value) =>
  new Date(value).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });

const countdown = (target) => {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return "maintenant";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `dans ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `dans ${hours} h`;
  return `dans ${Math.round(hours / 24)} jour(s)`;
};

const NextMeetingBanner = ({ t }) => {
  const [meet, setMeet] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      apiClient
        .get("/Users/meets")
        .then(({ data }) => {
          if (alive) setMeet((data?.meets || [])[0] || null);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (!meet) return null;

  const live = meet.state === "live";

  return (
    <div
      className={`mb-6 rounded-2xl p-5 shadow-sm ring-1 ${
        live
          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white ring-red-500"
          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-blue-500"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
            {live ? (
              <>
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                {t?.("meetings.live", "En direct") || "En direct"}
              </>
            ) : (
              <>
                <CalendarClock className="h-3.5 w-3.5" />
                {t?.("meetings.next", "Prochaine réunion") || "Prochaine réunion"}
              </>
            )}
          </p>
          <p className="mt-1 truncate text-lg font-bold">
            {meet.title || t?.("meetings.session", "Séance") || "Séance"}
          </p>
          <p className="text-sm text-white/90">
            {meet.itemTitle ? `${meet.itemTitle} · ` : ""}
            {when(meet.scheduledTime)}
            {!live && ` · ${countdown(meet.opensAt || meet.scheduledTime)}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {meet.itemId && (
            <Link
              to={(ITEM[meet.itemType] || ITEM.course).path(meet.itemId)}
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
            >
              {t?.(
                (ITEM[meet.itemType] || ITEM.course).key,
                (ITEM[meet.itemType] || ITEM.course).fallback,
              ) || "Voir"}
            </Link>
          )}
          <Link
            to="/dashboard/meetings"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <Video className="h-4 w-4" />
            {live
              ? t?.("meetings.join", "Rejoindre") || "Rejoindre"
              : t?.("meetings.seeAll", "Mes réunions") || "Mes réunions"}
          </Link>
        </div>
      </div>
    </div>
  );
};

NextMeetingBanner.propTypes = {
  t: PropTypes.func,
};

export default NextMeetingBanner;
