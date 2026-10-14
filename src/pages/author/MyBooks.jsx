import { useEffect, useState } from "react";
import axios from "axios";
import api, { getErrorMessage } from "../../services/api";

const money = (value) => {
  if (value === null || value === undefined) return "Not available";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));
};

const date = (value) => {
  if (!value) return "Not published yet";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadBooks = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/books", { signal: controller.signal });
        setBooks(response.data.books);
      } catch (error) {
        if (!axios.isCancel(error)) setError(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadBooks();
    return () => controller.abort();
  }, [retry]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Author dashboard</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">My books</h1>
      <p className="mt-2 text-slate-500">Your publishing progress, sales, and royalties.</p>
      {loading && <p role="status" className="mt-8 text-slate-500">Loading your books...</p>}
      {error && <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5"><p className="text-red-700">{error}</p><button onClick={() => setRetry(retry + 1)} className="mt-3 font-medium text-red-800 underline">Try again</button></div>}
      {!loading && !error && books.length === 0 && <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-semibold">No books yet</h2><p className="mt-2 text-sm text-slate-500">Your books will appear here when they are added to your account.</p></div>}
      {!loading && !error && <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {books.map((book) => (
          <article key={book.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">{book.status.replaceAll("_", " ")}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{book.genre || "Genre not specified"}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
              <div><dt className="text-slate-500">ISBN</dt><dd className="mt-1 break-all font-medium">{book.isbn || "Not assigned yet"}</dd></div>
              <div><dt className="text-slate-500">Publication date</dt><dd className="mt-1 font-medium">{date(book.publication_date)}</dd></div>
              <div><dt className="text-slate-500">MRP</dt><dd className="mt-1 font-medium">{money(book.mrp)}</dd></div>
              <div><dt className="text-slate-500">Copies sold</dt><dd className="mt-1 font-medium">{book.total_copies_sold ?? 0}</dd></div>
              <div><dt className="text-slate-500">Royalty earned</dt><dd className="mt-1 font-medium">{money(book.total_royalty_earned)}</dd></div>
              <div><dt className="text-slate-500">Royalty paid</dt><dd className="mt-1 font-medium">{money(book.royalty_paid)}</dd></div>
            </dl>
            <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm text-slate-600">Royalty pending</span><strong className="text-lg text-teal-800">{money(book.royalty_pending)}</strong></div>
          </article>
        ))}
      </div>}
    </main>
  );
};

export default MyBooks;
