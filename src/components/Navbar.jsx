import { Link, NavLink } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const linkStyle = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50"}`;
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <Link to={user.role === "ADMIN" ? "/admin/tickets" : "/author/books"} className="text-2xl font-bold tracking-tight text-teal-800">BookLeaf<span className="ml-2 text-xs font-medium uppercase tracking-widest text-slate-500">Support</span></Link>
        <div className="flex flex-wrap items-center gap-4 text-sm"><span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">{user.role === "ADMIN" ? "Admin" : "Author"}</span><span className="break-all text-slate-500">{user.email}</span><button onClick={onLogout} className="rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50">Log out</button></div>
      </div>
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap gap-2 px-5 pb-4">
        {user.role === "AUTHOR" ? <><NavLink to="/author/books" className={linkStyle}>My Books</NavLink><NavLink to="/author/tickets" end className={linkStyle}>My Tickets</NavLink><NavLink to="/author/tickets/new" className={linkStyle}>Create Ticket</NavLink></> : <NavLink to="/admin/tickets" className={linkStyle}>Ticket Queue</NavLink>}
      </nav>
    </header>
  );
};

export default Navbar;
