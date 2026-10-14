import { useEffect, useRef, useState } from "react";
import api, { getErrorMessage, loadAiDraft } from "../../services/api";

const ResponseEditor = ({ ticketId, onSend }) => {
  const [body, setBody] = useState("");
  const [draft, setDraft] = useState("");
  const [draftLoading, setDraftLoading] = useState(true);
  const [draftError, setDraftError] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const edited = useRef(false);

  useEffect(() => {
    let active = true;
    const getDraft = async () => {
      try {
        const response = await loadAiDraft(ticketId);
        if (active) {
          setDraft(response.data.draft);
          // Never replace text the admin started writing while AI was loading.
          if (!edited.current) setBody(response.data.draft);
        }
      } catch (error) {
        if (active) setDraftError(getErrorMessage(error));
      } finally {
        if (active) setDraftLoading(false);
      }
    };
    getDraft();
    return () => { active = false; };
  }, [ticketId]);

  const refreshDraft = async () => {
    if (draftLoading) return;
    setDraftLoading(true);
    setDraftError("");
    try {
      const response = await loadAiDraft(ticketId);
      setDraft(response.data.draft);
      if (!edited.current) setBody(response.data.draft);
    } catch (error) {
      setDraftError(getErrorMessage(error));
    } finally {
      setDraftLoading(false);
    }
  };

  const sendResponse = async (event) => {
    event.preventDefault();
    if (sending) return;
    if (!body.trim()) { setError("Please write a response before sending."); return; }
    setSending(true);
    setError("");
    setMessage("");
    try {
      const response = await api.post(`/admin/tickets/${ticketId}/responses`, { body: body.trim() });
      onSend(response.data.response);
      setBody("");
      setDraft("");
      setMessage("Response sent. The author can now see it.");
      edited.current = true;
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Reply to author</h2><button type="button" onClick={refreshDraft} disabled={draftLoading || sending} className="text-sm font-medium text-teal-700 underline disabled:opacity-50">{draftLoading ? "Preparing AI draft..." : "Load AI draft"}</button></div>
      <p className="mt-2 text-xs leading-5 text-slate-500">Review the draft, check the facts, and edit before sending. After changing ticket settings, load the draft again for updated context.</p>
      {draftLoading && <p role="status" className="mt-3 text-sm text-slate-500">You can write manually while the AI draft loads.</p>}
      {draftError && <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{draftError} You can still write and send a manual response.</p>}
      {draft && <details className="mt-4 rounded-lg bg-teal-50 p-4"><summary className="cursor-pointer text-sm font-medium text-teal-800">View AI suggestion</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{draft}</p><button type="button" disabled={sending} onClick={() => { setBody(draft); edited.current = true; }} className="mt-3 text-sm font-medium text-teal-800 underline">Use this suggestion in the editor (replaces current text)</button></details>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-teal-700">{message}</p>}
      <form onSubmit={sendResponse} className="mt-4"><label htmlFor="public-response" className="mb-2 block text-sm font-medium">Public response</label><textarea id="public-response" rows={8} required maxLength={10000} value={body} disabled={sending} onChange={event => { edited.current = true; setBody(event.target.value); setMessage(""); }} placeholder="Write your response to the author..." className="input resize-y" /><p className="mt-2 text-xs text-slate-500">Visible to the author only after you send. Sending does not change ticket status.</p><button disabled={sending || !body.trim()} className="button mt-4">{sending ? "Sending..." : "Send response"}</button></form>
    </section>
  );
};

export default ResponseEditor;
