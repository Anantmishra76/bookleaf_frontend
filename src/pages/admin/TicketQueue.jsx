import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import api, { getErrorMessage } from "../../services/api";
import TicketStatus from "../../components/TicketStatus";
import { statuses, priorities, categories, formatLabel } from "../../utils/ticketOptions";

const TicketQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    priority: searchParams.get("priority") || "",
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadTickets = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/admin/tickets", { params: searchParams, signal: controller.signal });
        setTickets(response.data.tickets);
      } catch (error) {
        if (!axios.isCancel(error)) setError(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadTickets();
    return () => controller.abort();
  }, [searchParams, retry]);

  const changeFilter = (event) => setFilters({ ...filters, [event.target.name]: event.target.value });
  const applyFilters = (event) => {
    event.preventDefault();
    if (filters.from && filters.to && filters.from > filters.to) {
      setFilterError("From date must be on or before To date.");
      return;
    }
    setFilterError("");
    const params = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) params[key] = value;
    }
    setSearchParams(params);
  };
  const clearFilters = () => {
    setFilters({ status: "", category: "", priority: "", from: "", to: "" });
    setFilterError("");
    setSearchParams({});
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Operations dashboard</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Ticket queue</h1><p className="mt-2 text-slate-500">Unresolved tickets first, ordered by priority and age.</p></div><button onClick={() => setRetry(retry + 1)} disabled={loading} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-50">Refresh queue</button></div>
      <form onSubmit={applyFilters} className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div><label htmlFor="filter-status" className="mb-2 block text-sm font-medium">Status</label><select id="filter-status" name="status" value={filters.status} onChange={changeFilter} className="input"><option value="">All statuses</option>{statuses.map(status => <option key={status} value={status}>{formatLabel(status)}</option>)}</select></div>
          <div><label htmlFor="filter-category" className="mb-2 block text-sm font-medium">Category</label><select id="filter-category" name="category" value={filters.category} onChange={changeFilter} className="input"><option value="">All categories</option>{categories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}</select></div>
          <div><label htmlFor="filter-priority" className="mb-2 block text-sm font-medium">Priority</label><select id="filter-priority" name="priority" value={filters.priority} onChange={changeFilter} className="input"><option value="">All priorities</option>{priorities.map(priority => <option key={priority} value={priority}>{priority}</option>)}</select></div>
          <div><label htmlFor="filter-from" className="mb-2 block text-sm font-medium">Created from</label><input id="filter-from" type="date" name="from" value={filters.from} onChange={changeFilter} className="input" /></div>
          <div><label htmlFor="filter-to" className="mb-2 block text-sm font-medium">Created to</label><input id="filter-to" type="date" name="to" value={filters.to} onChange={changeFilter} className="input" /></div>
        </div>
        {filterError && <p role="alert" className="mt-3 text-sm text-red-700">{filterError}</p>}
        <div className="mt-4 flex gap-4"><button className="button" type="submit">Apply filters</button><button type="button" onClick={clearFilters} className="text-sm text-slate-600 hover:underline">Clear filters</button></div>
      </form>
      {loading && <p role="status" className="mt-8 text-slate-500">Loading tickets...</p>}
      {error && <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button onClick={() => setRetry(retry + 1)} className="mt-2 underline">Try again</button></div>}
      {!loading && !error && tickets.length === 0 && <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">No tickets match these filters.</p>}
      {!loading && !error && tickets.length > 0 && <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr>{["Ticket", "Author", "Status", "Priority", "Created"].map(label => <th key={label} scope="col" className="whitespace-nowrap px-5 py-4 font-medium">{label}</th>)}</tr></thead><tbody>{tickets.map(ticket => <tr key={ticket.id} className="border-t border-slate-100"><td className="min-w-56 px-5 py-4"><Link to={`/admin/tickets/${ticket.id}`} className="font-semibold text-teal-800 hover:underline">{ticket.subject}</Link><p className="mt-1 text-xs text-slate-500">#{ticket.id} &middot; {ticket.book_title || "General / Account Level"}</p></td><td className="px-5 py-4">{ticket.author_name}</td><td className="whitespace-nowrap px-5 py-4"><TicketStatus status={ticket.status} /></td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${["HIGH", "CRITICAL"].includes(ticket.priority) ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{ticket.priority || "Not set"}</span></td><td className="whitespace-nowrap px-5 py-4">{new Date(ticket.created_at).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div>}
    </main>
  );
};

export default TicketQueue;
