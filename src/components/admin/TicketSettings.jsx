import { useState } from "react";
import api, { getErrorMessage } from "../../services/api";
import { statuses, priorities, categories, formatLabel } from "../../utils/ticketOptions";

const TicketSettings = ({ ticket, user, onUpdate }) => {
  const [status, setStatus] = useState(ticket.status);
  const [category, setCategory] = useState(ticket.category || "GENERAL_INQUIRY");
  const [priority, setPriority] = useState(ticket.priority || "MEDIUM");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const saveChanges = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await api.patch(`/admin/tickets/${ticket.id}`, { status, category, priority });
      onUpdate(response.data.ticket);
      setMessage("Ticket settings saved.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const assignToMe = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await api.patch(`/admin/tickets/${ticket.id}`, { assign_to_me: true });
      onUpdate(response.data.ticket);
      setMessage("Ticket assigned to you.");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Manage ticket</h2>
      <p className="mt-2 text-xs text-slate-500">Review and override the suggested category and priority when needed.</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-teal-700">{message}</p>}
      <form onSubmit={saveChanges} className="mt-5 space-y-4">
        <div><label htmlFor="ticket-status" className="mb-2 block text-sm font-medium">Status</label><select id="ticket-status" value={status} onChange={event => setStatus(event.target.value)} disabled={saving} className="input">{statuses.map(value => <option key={value} value={value}>{formatLabel(value)}</option>)}</select></div>
        <div><label htmlFor="ticket-category" className="mb-2 block text-sm font-medium">Category</label><select id="ticket-category" value={category} onChange={event => setCategory(event.target.value)} disabled={saving} className="input">{categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        <div><label htmlFor="ticket-priority" className="mb-2 block text-sm font-medium">Priority</label><select id="ticket-priority" value={priority} onChange={event => setPriority(event.target.value)} disabled={saving} className="input">{priorities.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
        <button disabled={saving} className="button w-full">{saving ? "Saving..." : "Save changes"}</button>
      </form>
      <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-sm text-slate-500">Assignment</p><p className="mt-1 text-sm font-medium">{ticket.assigned_admin_id === user.id ? "Assigned to you" : ticket.assigned_admin_id ? `Assigned to admin #${ticket.assigned_admin_id}` : "Unassigned"}</p><button onClick={assignToMe} disabled={saving || ticket.assigned_admin_id === user.id} className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50">Assign to me</button></div>
    </section>
  );
};

export default TicketSettings;
