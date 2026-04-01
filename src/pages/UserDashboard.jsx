import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function UserDashboard() {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [msg, setMsg] = useState("");

  const fetchSlots = async () => {
    const { data } = await api.get("/api/availability/me");
    setSlots(data);
  };

  useEffect(() => { fetchSlots(); }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/api/availability", { date, startTime, endTime });
      setMsg("✅ Availability added!");
      setDate(""); setStartTime(""); setEndTime("");
      fetchSlots();
    } catch (err) {
      setMsg(err.response?.data?.error || "Error adding slot");
    }
  };

  const deleteSlot = async (id) => {
    await api.delete(`/api/availability/${id}`);
    fetchSlots();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">My Availability</h2>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Add Time Slot</h3>
          <form onSubmit={addSlot} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required />
              </div>
            </div>
            {msg && <p className="text-sm text-indigo-600">{msg}</p>}
            <button type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              Add Slot
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">My Scheduled Slots ({slots.length})</h3>
          {slots.length === 0 ? (
            <p className="text-gray-400 text-sm">No slots added yet.</p>
          ) : (
            <div className="space-y-2">
              {slots.map(slot => (
                <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(slot.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button onClick={() => deleteSlot(slot.id)}
                    className="text-red-400 hover:text-red-600 text-sm font-medium">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}