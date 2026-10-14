import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";

const InternalNotes = ({ ticketId, notes, onAdd }) => {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const saveNote = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!body.trim()) { setError("Please write a note first."); return; }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post(`/admin/tickets/${ticketId}/notes`, { body: body.trim() });
      onAdd(response.data.note);
      setBody("");
      setMessage("Private note saved.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
      <h2 className="text-lg font-semibold">Internal notes</h2><p className="mt-2 text-xs text-slate-500">Private to admins. These notes are never sent to the author.</p>
      <div className="mt-4 space-y-3">{notes.length === 0 && <p className="text-sm text-slate-500">No internal notes yet.</p>}{notes.map(note => <article key={note.id} className="rounded-lg border border-amber-100 bg-white p-4"><p className="whitespace-pre-wrap break-words text-sm leading-6">{note.body}</p><p className="mt-3 text-xs text-slate-500">Admin #{note.sender_id} &middot; {new Date(note.created_at).toLocaleString("en-IN")}</p></article>)}</div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}{message && <p role="status" className="mt-4 text-sm text-teal-700">{message}</p>}
      <form onSubmit={saveNote} className="mt-5"><label htmlFor="private-note" className="mb-2 block text-sm font-medium">Add a private note</label><textarea id="private-note" rows={3} required maxLength={10000} value={body} disabled={saving} onChange={event => setBody(event.target.value)} className="input resize-y" /><button disabled={saving || !body.trim()} className="mt-3 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50">{saving ? "Saving..." : "Save private note"}</button></form>
    </section>
  );
};

export default InternalNotes;
