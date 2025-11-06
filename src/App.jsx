import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* Utility to create unique ids without external libs */
const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

/* localStorage key */
const STORAGE_KEY = "advanced_todos_v1";

/* CSV export helper */
const downloadCSV = (rows, filename = "tasks.csv") => {
  const csv = [
    ["id", "text", "createdAt", "updatedAt", "completedAt", "completed"],
    ...rows.map((r) => [
      r.id,
      `"${(r.text || "").replace(/"/g, '""')}"`,
      new Date(r.createdAt).toISOString(),
      r.updatedAt ? new Date(r.updatedAt).toISOString() : "",
      r.completedAt ? new Date(r.completedAt).toISOString() : "",
      r.completed ? "true" : "false",
    ]),
  ]
    .map((r) => r.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | completedAt

  /* load from localStorage once */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to parse saved tasks", e);
    }
  }, []);

  /* save to localStorage when tasks change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  const resetForm = () => {
    setText("");
    setEditId(null);
  };

  const handleAddOrUpdate = (e) => {
    e?.preventDefault?.();

    const trimmed = (text || "").trim();
    if (!trimmed) {
      alert("Please add a task description.");
      return;
    }

    if (editId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editId
            ? { ...t, text: trimmed, updatedAt: Date.now() }
            : t
        )
      );
      resetForm();
      return;
    }

    const newTask = {
      id: makeId(),
      text: trimmed,
      createdAt: Date.now(),
      updatedAt: null,
      completed: false,
      completedAt: null,
    };
    setTasks((prev) => [newTask, ...prev]);
    resetForm();
  };

  const handleDelete = (id) => {
    if (!confirm("Permanently delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (id === editId) resetForm();
  };

  const handleToggle = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : null,
              updatedAt: Date.now(),
            }
          : t
      )
    );
  };

  const handleEdit = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setText(t.text);
    setEditId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearAll = () => {
    if (!confirm("Clear all tasks? This will remove everything permanently.")) return;
    setTasks([]);
    resetForm();
  };

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) => t.text.toLowerCase().includes(q));
    }
    if (sortBy === "newest") {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === "oldest") {
      list.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === "completedAt") {
      list.sort((a, b) => {
        const aa = a.completedAt || 0;
        const bb = b.completedAt || 0;
        return bb - aa;
      });
    }
    return list;
  }, [tasks, filter, query, sortBy]);

  return (
    <div className="page">
      <main className="shell" role="main">
        <header className="header">
          <h1 className="brand">TaskForge — Where Goals Turn Into Growth</h1>
          <p className="subtitle">Turn tasks into achievements: Track, Complete, and Preserve your progress</p>
        </header>

        {/* card: input + stats */}
        <section className="card top-card" aria-labelledby="task-form">
          <form id="task-form" className="form-row" onSubmit={handleAddOrUpdate}>
            <div className="form-left">
              <label className="sr-only" htmlFor="todo-input">Task</label>
              <input
                id="todo-input"
                autoFocus
                inputMode="text"
                aria-label="Task description"
                placeholder="Write a clear task or goal (e.g. 'Finish project report')"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={300}
              />
            </div>

            <div className="form-right">
              <button className="btn primary" type="submit">
                {editId ? "Update Task" : "Add Task"}
              </button>

              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  resetForm();
                }}
                aria-label="Reset input"
              >
                Reset
              </button>
            </div>
          </form>

          <div className="stats-row" aria-hidden>
            <div className="stat">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="divider" />
            <div className="stat">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="divider" />
            <div className="stat">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </section>

        {/* controls */}
        <section className="card controls">
          <div className="controls-left">
            <div className="segmented">
              <button
                className={filter === "all" ? "seg active" : "seg"}
                onClick={() => setFilter("all")}
                aria-pressed={filter === "all"}
              >
                All
              </button>
              <button
                className={filter === "active" ? "seg active" : "seg"}
                onClick={() => setFilter("active")}
                aria-pressed={filter === "active"}
              >
                Active
              </button>
              <button
                className={filter === "completed" ? "seg active" : "seg"}
                onClick={() => setFilter("completed")}
                aria-pressed={filter === "completed"}
              >
                Completed
              </button>
            </div>

            <div className="search-wrap">
              <input
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search tasks"
              />
            </div>
          </div>

          <div className="controls-right">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort tasks"
              className="select"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="completedAt">Recently Completed</option>
            </select>

            <button
              className="btn outline"
              onClick={() => downloadCSV(tasks)}
              title="Export all tasks as CSV"
            >
              Export CSV
            </button>

            <button className="btn danger" onClick={handleClearAll} title="Clear all tasks">
              Clear All
            </button>
          </div>
        </section>

        {/* list */}
        <section className="card list-card" aria-labelledby="list-title">
          <h2 id="list-title" className="list-title">Tasks</h2>

          {filtered.length === 0 ? (
            <div className="empty-state">No tasks match your filter.</div>
          ) : (
            <ul className="task-list" role="list">
              {filtered.map((t) => (
                <li key={t.id} className={`task ${t.completed ? "done" : ""}`}>
                  <div className="task-left">
                    <button
                      className="toggle"
                      onClick={() => handleToggle(t.id)}
                      aria-pressed={t.completed}
                      aria-label={t.completed ? "Mark as not completed" : "Mark as completed"}
                    >
                      {t.completed ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <circle cx="12" cy="12" r="9" stroke="#0078ff" strokeWidth="1.6" />
                        </svg>
                      )}
                    </button>

                    <div className="task-info" onDoubleClick={() => handleEdit(t.id)}>
                      <div className="task-text">{t.text}</div>
                      <div className="task-meta">
                        <span>Created: {new Date(t.createdAt).toLocaleString()}</span>
                        {t.updatedAt && <span> • Updated: {new Date(t.updatedAt).toLocaleString()}</span>}
                        {t.completedAt && <span> • Done: {new Date(t.completedAt).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button className="icon-btn" onClick={() => handleEdit(t.id)} title="Edit task">
                      ✏️
                    </button>
                    <button className="icon-btn danger" onClick={() => handleDelete(t.id)} title="Delete task">
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="footer">
          <small>GoalKeeper • Keep records • Responsive • Accessible</small>
        </footer>
      </main>
    </div>
  );
}
