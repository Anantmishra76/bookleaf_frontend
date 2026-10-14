import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api, { getErrorMessage } from "../../services/api";
import TicketStatus from "../../components/TicketStatus";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    const loadTickets = async () => {
      let keepUpdating = true;
      try {
        const response = await api.get("/tickets", { signal: controller.signal });
        setTickets(response.data.tickets);
        setError("");
      } catch (error) {
        if (!axios.isCancel(error)) setError(getErrorMessage(error));
        if ([401, 403].includes(error.response?.status)) keepUpdating = false;
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          // Wait until this request finishes before scheduling another one.
          if (keepUpdating) timer = setTimeout(loadTickets, 10000);
        }
      }
    };
    loadTickets();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [retry]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Author support</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My tickets</h1><p className="mt-2 text-slate-500">Track your queries and responses from the BookLeaf team.</p></div>
        <Link to="/author/tickets/new" className="button">Create ticket</Link>
      </div>
      <p className="mt-4 text-xs text-slate-500">Updates automatically every 10 seconds.</p>
      {loading && <p role="status" className="mt-8 text-slate-500">Loading your tickets...</p>}
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button onClick={() => setRetry(retry + 1)} className="mt-2 font-medium underline">Try again</button></div>}
      {!loading && !error && tickets.length === 0 && <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="text-lg font-semibold">No tickets yet</h2><p className="mt-2 text-sm text-slate-500">Need help? Create your first support ticket.</p></div>}
      {!loading && tickets.length > 0 && <div className="mt-8 space-y-4">
        {tickets.map((ticket) => <Link key={ticket.id} to={`/author/tickets/${ticket.id}`} className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-400 hover:shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="break-words font-semibold">{ticket.subject}</h2><TicketStatus status={ticket.status} /></div>
          <p className="mt-2 text-sm text-slate-500">#{ticket.id} &middot; {ticket.book_title || "General / Account Level"}</p>
          <p className="mt-3 line-clamp-2 whitespace-pre-wrap break-words text-sm text-slate-600">{ticket.description}</p>
          <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>Created {new Date(ticket.created_at).toLocaleString("en-IN")}</span><span className="font-medium text-teal-700">View ticket &rarr;</span></div>
        </Link>)}
      </div>}
    </main>
  );
};

export default MyTickets;
