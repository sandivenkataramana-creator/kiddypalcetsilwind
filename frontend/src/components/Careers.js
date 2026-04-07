import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import { API_BASE_URL } from "./config";

const Careers = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/careers`)
      .then((res) => {
        setContent(res.data?.content || "");
      })
      .catch(() => setContent(""))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />

      <main className="bg-[radial-gradient(circle_at_top,_rgba(236,253,245,0.85),_rgba(255,255,255,1)_40%,_rgba(248,250,252,1)_100%)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto min-h-[60vh] w-full max-w-4xl rounded-[28px] border border-emerald-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Careers
            </h1>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
              Open Roles
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-5 py-10 text-center text-sm font-medium text-slate-600">
              Loading career opportunities...
            </div>
          ) : content ? (
            <pre className="whitespace-pre-wrap break-words rounded-2xl bg-slate-50 px-5 py-6 text-[15px] leading-8 text-slate-700 sm:px-6">
              {content}
            </pre>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
              No career content has been posted yet.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Careers;
