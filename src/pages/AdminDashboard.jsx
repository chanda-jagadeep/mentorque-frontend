import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

const CALL_TYPES = ["RESUME_REVAMP", "JOB_MARKET_GUIDANCE", "MOCK_INTERVIEW"];

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [callType, setCallType] = useState("RESUME_REVAMP");
  const [recommendations, setRecommendations] = useState([]);
  const [overlaps, setOverlaps] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [editMentor, setEditMentor] = useState(null);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("book");

  useEffect(() => {
    api.get("/api/admin/users").then(r => setUsers(r.data));
    api.get("/api/admin/mentors").then(r => setMentors(r.data));
    api.get("/api/admin/bookings").then(r => setBookings(r.data));
  }, []);

  const getRecommendations = async () => {
    if (!selectedUser) return;
    const { data } = await api.post("/api/admin/recommend", { userId: selectedUser, callType });
    setRecommendations(data);
    setOverlaps([]); setSelectedMentor(""); setSelectedSlot(null);
  };

  const checkOverlap = async (mentorId) => {
    setSelectedMentor(mentorId); setSelectedSlot(null);
    const { data } = await api.get(`/api/admin/overlap?userId=${selectedUser}&mentorId=${mentorId}`);
    setOverlaps(data);
  };

  const bookCall = async () => {
    if (!selectedSlot) return setMsg("Please select a time slot");
    try {
      await api.post("/api/admin/book", {
        userId: selectedUser, mentorId: selectedMentor,
        callType, startTime: selectedSlot.start, endTime: selectedSlot.end,
      });
      setMsg("✅ Call booked successfully!");
      api.get("/api/admin/bookings").then(r => setBookings(r.data));
      setRecommendations([]); setOverlaps([]); setSelectedSlot(null);
    } catch { setMsg("❌ Booking failed"); }
  };

  const saveMentorMeta = async () => {
    await api.patch(`/api/admin/mentors/${editMentor.id}`, {
      tags: editMentor.tags, description: editMentor.description
    });
    api.get("/api/admin/mentors").then(r => setMentors(r.data));
    setEditMentor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["book", "mentors", "bookings"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium capitalize text-sm transition ${tab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"}`}>
              {t === "book" ? "Book a Call" : t === "mentors" ? "Manage Mentors" : "All Bookings"}
            </button>
          ))}
        </div>

        {/* BOOK A CALL */}
        {tab === "book" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Step 1 — Select User & Call Type</h3>
              <div className="flex gap-3 flex-wrap">
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.tags.join(", ")}</option>)}
                </select>
                <select value={callType} onChange={e => setCallType(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {CALL_TYPES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
                <button onClick={getRecommendations}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                  Get Recommendations
                </button>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Step 2 — Recommended Mentors</h3>
                <div className="space-y-2">
                  {recommendations.map((m, i) => (
                    <div key={m.id}
                      onClick={() => checkOverlap(m.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${selectedMentor === m.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">#{i + 1} {m.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {m.tags.map(t => (
                              <span key={t} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-indigo-600">Score: {m.score}</span>
                          <p className="text-xs text-gray-400 mt-1">Click to check availability</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overlaps.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Step 3 — Available Overlap Slots</h3>
                <div className="space-y-2">
                  {overlaps.map((slot, i) => (
                    <div key={i}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg border cursor-pointer transition ${selectedSlot === slot ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}>
                      <p className="font-medium text-gray-800">
                        {new Date(slot.date).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(slot.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {new Date(slot.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
                {msg && <p className="text-sm mt-3 text-indigo-600">{msg}</p>}
                <button onClick={bookCall}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                  Book This Call
                </button>
              </div>
            )}

            {selectedMentor && overlaps.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
                No overlapping availability found. Ask the user and mentor to add more slots.
              </div>
            )}
          </div>
        )}

        {/* MANAGE MENTORS */}
        {tab === "mentors" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Mentor Profiles</h3>
            <div className="space-y-3">
              {mentors.map(m => (
                <div key={m.id} className="p-4 border rounded-xl">
                  {editMentor?.id === m.id ? (
                    <div className="space-y-2">
                      <p className="font-medium">{m.name}</p>
                      <input
                        value={editMentor.tags.join(", ")}
                        onChange={e => setEditMentor({ ...editMentor, tags: e.target.value.split(",").map(t => t.trim()) })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Tags (comma separated)"
                      />
                      <textarea
                        value={editMentor.description}
                        onChange={e => setEditMentor({ ...editMentor, description: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={2} placeholder="Description"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveMentorMeta}
                          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700">Save</button>
                        <button onClick={() => setEditMentor(null)}
                          className="border px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{m.description || "No description"}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {m.tags.map(t => <span key={t} className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      </div>
                      <button onClick={() => setEditMentor({ ...m })}
                        className="text-indigo-500 hover:text-indigo-700 text-sm font-medium">Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab === "bookings" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-4">All Bookings ({bookings.length})</h3>
            {bookings.length === 0 ? (
              <p className="text-gray-400 text-sm">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="p-4 border rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{b.callType.replace(/_/g, " ")}</p>
                        <p className="text-sm text-gray-500">User: {b.user.name} → Mentor: {b.mentor.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(b.startTime).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} •{" "}
                          {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                          {new Date(b.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Booked</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}