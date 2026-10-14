import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import api, { getErrorMessage } from "../../services/api";
import TicketStatus from "../../components/TicketStatus";

const TicketDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    setTicket(null);
    setResponses([]);
    setLoading(true);
    setError("");
    const loadTicket = async () => {
      let keepUpdating = true;
      try {
        const response = await api.get(`/tickets/${id}`, { signal: controller.signal });
        setTicket(response.data.ticket);
        setResponses(response.data.responses);
        setError("");
      } catch (error) {
        if (!axios.isCancel(error)) setError(getErrorMessage(error));
        if ([400, 401, 403, 404].includes(error.response?.status)) keepUpdating = false;
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          if (keepUpdating) timer = setTimeout(loadTicket, 8000);
        }
      }
    };
    loadTicket();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [id, retry]);

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <Link to="/author/tickets" className="text-sm font-medium text-teal-700 hover:underline">&larr; My tickets</Link>
      {location.state?.message && <p role="status" className="mt-5 rounded-lg bg-teal-50 p-4 text-sm text-teal-800">{location.state.message}</p>}
      {loading && <p role="status" className="mt-8 text-slate-500">Loading ticket...</p>}
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button onClick={() => setRetry(retry + 1)} className="mt-2 font-medium underline">Try again</button></div>}
      {!loading && ticket && <>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Ticket #{ticket.id}</p><TicketStatus status={ticket.status} /></div>
          <h1 className="mt-4 break-words text-2xl font-semibold">{ticket.subject}</h1>
          <p className="mt-2 text-sm text-slate-500">{ticket.book_title || "General / Account Level"}</p>
          <p className="mt-6 whitespace-pre-wrap break-words leading-7 text-slate-700">{ticket.description}</p>
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">Created {new Date(ticket.created_at).toLocaleString("en-IN")}</p>
        </section>
        <section className="mt-8" aria-label="Support responses">
          <h2 className="text-xl font-semibold">Responses from BookLeaf</h2>
          <p className="mt-2 text-xs text-slate-500">Updates automatically every 8 seconds. No page refresh needed.</p>
          <div className="mt-5 space-y-4" aria-live="polite">
            {responses.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No responses yet. The BookLeaf team will reply here.</p>}
            {responses.map((response) => <article key={response.id} className="rounded-xl border border-teal-100 bg-white p-6"><div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm font-semibold text-teal-800">BookLeaf Support</h3><time className="text-xs text-slate-500" dateTime={response.created_at}>{new Date(response.created_at).toLocaleString("en-IN")}</time></div><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{response.body}</p></article>)}
          </div>
        </section>
      </>}
    </main>
  );
};

export default TicketDetails;
