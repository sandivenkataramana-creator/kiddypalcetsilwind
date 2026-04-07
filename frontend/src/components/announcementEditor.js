import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";

const API_BASE = `${API_BASE_URL}/api/settings`;

export default function AnnouncementEditor() {
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${API_BASE}/top-announcement`);
        if (mounted) {
          setAnnouncement(res.data.announcement ?? "");
        }
      } catch (err) {
        console.error("Failed to load announcement", err);
        if (mounted) setMessage("Failed to load announcement");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnnouncement();
    return () => (mounted = false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE}/top-announcement`, { announcement });
      setMessage("Saved!");
      // Optionally sync the exact returned value
      if (res.data && res.data.announcement) {
        setAnnouncement(res.data.announcement);
      }
    } catch (err) {
      console.error("Failed to save announcement", err);
      setMessage("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 1800);
    }
  };

  if (loading) return <div>Loading announcement...</div>;

  return (
    <div className="max-w-[720px]">
      {/* optional: show sample image above announcement - local path provided below */}
      {/* <img src="/uploads/your-image.jpg" alt="banner" className="w-full rounded-lg" /> */}

      <label className="mb-1.5 block font-semibold text-[#273c2e]">Top Announcement</label>
      <textarea
        value={announcement}
        onChange={(e) => setAnnouncement(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-lg border border-[#dccaaa] p-2.5 text-[#273c2e] focus:border-[#2e79e3] focus:outline-none focus:ring-2 focus:ring-[#2e79e3]/20"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#2e79e3] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#256bd0] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Announcement"}
        </button>

        <button
          onClick={() => {
            // Optionally revert to last saved version by re-fetching
            axios.get(`${API_BASE}/top-announcement`).then((r) => setAnnouncement(r.data.announcement ?? ""));
          }}
          className="rounded-lg bg-[#f4f7f5] px-3.5 py-2 text-sm font-semibold text-[#273c2e] transition hover:bg-[#e7eee9]"
        >
          Revert
        </button>

        <div className="ml-auto self-center text-sm text-[#333]">{message}</div>
      </div>
    </div>
  );
}
