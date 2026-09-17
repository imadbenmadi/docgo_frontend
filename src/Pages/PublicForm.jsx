import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Loader2 } from "lucide-react";
import apiClient from "../utils/apiClient";
import { useAppContext } from "../AppContext";
import RichTextDisplay from "../components/Common/RichTextEditor/RichTextDisplay";

/**
 * A form shared from the dashboard, at /forms/:slug. Anyone can open it; a
 * form limited to members asks visitors to sign in first.
 */

const input =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const optionsOf = (f) =>
  (Array.isArray(f.options) ? f.options : String(f.options || "").split("\n"))
    .map((o) => (typeof o === "string" ? o : o?.label || o?.value || ""))
    .map((o) => o.trim())
    .filter(Boolean);

const PublicForm = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { isAuth, user } = useAppContext();
  const [form, setForm] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | closed | missing | sent
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState("");

  useEffect(() => {
    apiClient
      .get(`/forms/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        setForm(data.data);
        setState("ready");
      })
      .catch((err) => setState(err?.response?.status === 410 ? "closed" : "missing"));
  }, [slug]);

  const set = (key, value) => setAnswers((a) => ({ ...a, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const { data } = await apiClient.post(`/forms/${encodeURIComponent(slug)}`, {
        answers,
        name: isAuth ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() : name,
        email: isAuth ? user?.email : email,
      });
      setThanks(data?.message || "");
      setState("sent");
    } catch (err) {
      setError(err?.response?.data?.message || t("forms.error", "Your answers could not be sent."));
    } finally {
      setSending(false);
    }
  };

  const field = (f) => {
    const value = answers[f.key];
    switch (f.type) {
      case "textarea":
        return <textarea rows={4} className={input} value={value || ""} required={f.required} onChange={(e) => set(f.key, e.target.value)} />;
      case "select":
        return (
          <select className={input} value={value || ""} required={f.required} onChange={(e) => set(f.key, e.target.value)}>
            <option value="">—</option>
            {optionsOf(f).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-1.5">
            {optionsOf(f).map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name={f.key} value={o} checked={value === o} required={f.required} onChange={() => set(f.key, o)} />
                {o}
              </label>
            ))}
          </div>
        );
      case "checkbox": {
        const opts = optionsOf(f);
        if (!opts.length) {
          return (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={Boolean(value)} required={f.required} onChange={(e) => set(f.key, e.target.checked)} />
              {t("forms.yes", "Yes")}
            </label>
          );
        }
        const list = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-1.5">
            {opts.map((o) => (
              <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={list.includes(o)}
                  onChange={(e) => set(f.key, e.target.checked ? [...list, o] : list.filter((x) => x !== o))}
                />
                {o}
              </label>
            ))}
          </div>
        );
      }
      default: {
        const type = { email: "email", phone: "tel", number: "number", date: "date", file_link: "url" }[f.type] || "text";
        return <input type={type} className={input} value={value || ""} required={f.required} onChange={(e) => set(f.key, e.target.value)} />;
      }
    }
  };

  if (state === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (state === "missing" || state === "closed") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {state === "closed" ? t("forms.closed", "This form is closed") : t("forms.missing", "This form is not available")}
        </h1>
        <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">
          {t("forms.home", "Back to the home page")}
        </Link>
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{t("forms.thanks", "Thank you")}</h1>
        {thanks && <p className="mt-2 text-gray-600">{thanks}</p>}
      </div>
    );
  }

  const membersOnly = form.audience === "users" && !isAuth;

  return (
    <div className="bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
        {form.description && (
          <RichTextDisplay content={form.description} textClassName="mt-3 text-gray-600" />
        )}

        {membersOnly ? (
          <div className="mt-8 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            {t("forms.signIn", "Please sign in to fill in this form.")}{" "}
            <Link to={`/login?next=${encodeURIComponent(`/forms/${slug}`)}`} className="font-semibold underline">
              {t("forms.signInLink", "Sign in")}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            {!isAuth && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("forms.name", "Your name")}
                  <input className={`${input} mt-1`} value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  {t("forms.email", "Your email")}
                  <input type="email" className={`${input} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
              </div>
            )}

            {(form.fields || []).map((f) => (
              <div key={f.key}>
                <p className="mb-1.5 text-sm font-medium text-gray-800">
                  {f.label}
                  {f.required && <span className="ml-0.5 text-red-500">*</span>}
                </p>
                {f.help && <p className="mb-1.5 text-xs text-gray-500">{f.help}</p>}
                {field(f)}
              </div>
            ))}

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("forms.send", "Send")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PublicForm;
