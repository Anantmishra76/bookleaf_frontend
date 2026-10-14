import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api, { getErrorMessage } from "../../services/api";

const CreateTicket = () => {
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [retry, setRetry] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const loadBooks = async () => {
      setLoadingBooks(true);
      setBooksError("");
      try {
        const response = await api.get("/books", { signal: controller.signal });
        setBooks(response.data.books);
      } catch (error) {
        if (!axios.isCancel(error)) setBooksError(getErrorMessage(error));
      } finally {
        if (!controller.signal.aborted) setLoadingBooks(false);
      }
    };
    loadBooks();
    return () => controller.abort();
  }, [retry]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (!subject.trim() || !description.trim()) {
      setError("Please enter a subject and description.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await api.post("/tickets", {
        book_id: bookId ? Number(bookId) : null,
        subject: subject.trim(),
        description: description.trim(),
      });
      navigate(`/author/tickets/${response.data.ticket.id}`, {
        replace: true,
        state: { message: "Your ticket was submitted successfully." },
      });
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/author/tickets" className="text-sm font-medium text-teal-700 hover:underline">&larr; My tickets</Link>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">Create a support ticket</h1>
      <p className="mt-2 text-slate-500">Tell us how we can help with your book or account.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        {error && <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><p className="mt-2">If the connection failed after submitting, check My Tickets before submitting again.</p></div>}
        <div>
          <label htmlFor="book" className="mb-2 block text-sm font-medium">Which book is this about?</label>
          <select id="book" value={bookId} onChange={(event) => setBookId(event.target.value)} disabled={loadingBooks || submitting} className="input">
            <option value="">General / Account Level</option>
            {books.map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
          </select>
          {loadingBooks && <p role="status" className="mt-2 text-xs text-slate-500">Loading your books...</p>}
          {booksError && <div role="alert" className="mt-2 text-sm text-red-700"><p>{booksError} You can still submit a general query.</p><button type="button" onClick={() => setRetry(retry + 1)} disabled={submitting} className="mt-1 underline">Retry loading books</button></div>}
        </div>
        <div>
          <label htmlFor="subject" className="mb-2 block text-sm font-medium">Subject</label>
          <input id="subject" required maxLength={255} value={subject} onChange={(event) => setSubject(event.target.value)} disabled={submitting} placeholder="For example: Royalty payment pending" className="input" />
        </div>
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium">Description</label>
          <textarea id="description" required maxLength={10000} rows={7} value={description} onChange={(event) => setDescription(event.target.value)} disabled={submitting} placeholder="Describe your query and include any helpful details." className="input resize-y" />
          <p className="mt-2 text-right text-xs text-slate-400">{description.length} / 10,000 characters</p>
        </div>
        <div>
          <label htmlFor="attachment" className="mb-2 block text-sm font-medium">Attachment (optional preview)</label>
          <input id="attachment" type="file" disabled={submitting} className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-slate-700" />
          <p className="mt-2 text-xs text-slate-500">Attachments are not uploaded or sent yet. Include important information in your description.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
          <button type="submit" disabled={submitting} className="button">{submitting ? "Submitting ticket..." : "Submit ticket"}</button>
          {!submitting && <Link to="/author/tickets" className="text-sm text-slate-600 hover:underline">Cancel</Link>}
          {submitting && <p role="status" className="text-xs text-slate-500">This may take a few seconds. Please wait.</p>}
        </div>
      </form>
    </main>
  );
};

export default CreateTicket;
