import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api, { getErrorMessage } from "../../services/api";
import TicketStatus from "../../components/TicketStatus";
import TicketSettings from "../../components/admin/TicketSettings";
import ResponseEditor from "../../components/admin/ResponseEditor";
import InternalNotes from "../../components/admin/InternalNotes";

const AdminTicketDetails = ({ user }) => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadTicket = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/admin/tickets/${id}`, { signal: controller.signal });
        setTicket(response.data.ticket);
        setResponses(response.data.responses);
        setNotes(response.data.notes);
      } catch (error) {
        if (!axios.isCancel(error)) setError(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadTicket();
    return () => controller.abort();
  }, [id, retry]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/admin/tickets" className="text-sm font-medium text-teal-700 hover:underline">&larr; Ticket queue</Link>
      {loading && <p role="status" className="mt-8 text-slate-500">Loading ticket...</p>}
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button onClick={() => setRetry(retry + 1)} className="mt-2 underline">Try again</button></div>}
      {!loading && !error && ticket && <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Ticket #{ticket.id}</p><TicketStatus status={ticket.status} /></div><h1 className="mt-4 break-words text-2xl font-semibold">{ticket.subject}</h1><p className="mt-2 text-sm text-slate-500">{ticket.book_title || "General / Account Level"}</p><div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm"><p className="font-medium">{ticket.author_name}</p><p className="mt-1 break-all text-slate-500">{ticket.author_email}</p></div><p className="mt-6 whitespace-pre-wrap break-words leading-7 text-slate-700">{ticket.description}</p><p className="mt-5 text-xs text-slate-500">Created {new Date(ticket.created_at).toLocaleString("en-IN")}</p></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Public response history</h2><div className="mt-4 space-y-4">{responses.length === 0 && <p className="text-sm text-slate-500">No responses sent yet.</p>}{responses.map(response => <article key={response.id} className="border-l-2 border-teal-200 pl-4"><p className="whitespace-pre-wrap break-words text-sm leading-7">{response.body}</p><p className="mt-2 text-xs text-slate-500">Admin #{response.sender_id} &middot; {new Date(response.created_at).toLocaleString("en-IN")}</p></article>)}</div></section>
          <ResponseEditor key={`response-${ticket.id}`} ticketId={ticket.id} onSend={response => setResponses(current => [...current, response])} />
          <InternalNotes key={`notes-${ticket.id}`} ticketId={ticket.id} notes={notes} onAdd={note => setNotes(current => [...current, note])} />
        </div>
        <TicketSettings key={ticket.id} ticket={ticket} user={user} onUpdate={updated => setTicket(current => ({ ...current, ...updated }))} />
      </div>}
    </main>
  );
};

export default AdminTicketDetails;
