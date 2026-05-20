import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { NotesStorage, LinksStorage, MediaStorage, MindmapsStorage } from "./storage";
import type { Note, Link, Media, Mindmap } from "./storage";

type Theme = "dark" | "light";
type PageType = "dashboard" | "notes" | "links" | "media" | "mindmap" | "settings";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

// Main App Component
function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MainLayout theme={theme} toggleTheme={toggleTheme} />
    </ThemeContext.Provider>
  );
}
interface MainLayoutProps {
  theme: Theme;
  toggleTheme: () => void;
}

function MainLayout({ theme, toggleTheme }: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");

  const bgClass = theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900";
  const sidebarClass =
    theme === "dark"
      ? "bg-slate-900 border-slate-800"
      : "bg-slate-50 border-slate-200";
  const navItemClass = (isActive: boolean) =>
    isActive
      ? theme === "dark"
        ? "bg-indigo-600 text-white"
        : "bg-indigo-100 text-indigo-900"
      : theme === "dark"
        ? "text-slate-400 hover:text-slate-200"
        : "text-slate-600 hover:text-slate-900";

  return (
    <div className={`flex h-screen ${bgClass}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r ${sidebarClass} flex flex-col`}>
        <div className="p-6 border-b border-inherit">
          <h1 className="text-2xl font-bold">SecondBrain</h1>
          <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}>
            Your Knowledge Vault
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "dashboard" as const, label: "Dashboard", icon: "📊" },
            { id: "notes" as const, label: "Notes", icon: "📝" },
            { id: "links" as const, label: "Links", icon: "🔗" },
            { id: "media" as const, label: "Media", icon: "🖼️" },
            { id: "mindmap" as const, label: "Mindmap", icon: "🧠" },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${navItemClass(currentPage === id)}`}
            >
              <span className="mr-2">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-inherit">
          <button
            onClick={() => setCurrentPage("settings")}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${navItemClass(currentPage === "settings")}`}
          >
            ⚙️ Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`border-b ${theme === "dark" ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"} px-8 py-4 flex justify-between items-center`}>
          <h2 className="text-xl font-semibold">
            {currentPage === "dashboard" && "Dashboard"}
            {currentPage === "notes" && "My Notes"}
            {currentPage === "links" && "Saved Links"}
            {currentPage === "media" && "Media Gallery"}
            {currentPage === "mindmap" && "Mindmaps"}
            {currentPage === "settings" && "Settings"}
          </h2>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${theme === "dark" ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"}`}
            >
              {theme === "dark" ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>

            {/* User Profile */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${theme === "dark" ? "bg-indigo-600" : "bg-indigo-200 text-indigo-900"}`}>
              U
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          {currentPage === "dashboard" && <DashboardPage theme={theme} onNavigate={setCurrentPage} />}
          {currentPage === "notes" && <NotesPage theme={theme} />}
          {currentPage === "links" && <LinksPage theme={theme} />}
          {currentPage === "media" && <MediaPage theme={theme} />}
          {currentPage === "mindmap" && <MindmapPage theme={theme} />}
          {currentPage === "settings" && <SettingsPage theme={theme} />}
        </main>
      </div>
    </div>
  );
}

interface PageProps {
  theme: Theme;
}

interface DashboardPageProps extends PageProps {
  onNavigate: (page: PageType) => void;
}

function DashboardPage({ theme, onNavigate }: DashboardPageProps) {
  const cardClass =
    theme === "dark"
      ? "bg-slate-900 border-slate-800 hover:border-slate-700"
      : "bg-slate-50 border-slate-200 hover:border-slate-300";

  const buttons: Array<{ icon: string; label: string; action: PageType }> = [
    { icon: "📝", label: "New Note", action: "notes" },
    { icon: "🔗", label: "Save Link", action: "links" },
    { icon: "🖼️", label: "Add Media", action: "media" },
    { icon: "🧠", label: "Create Mindmap", action: "mindmap" },
    { icon: "📋", label: "Quick Capture", action: "notes" },
    { icon: "🏷️", label: "Browse Tags", action: "notes" },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">Quick Add</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {buttons.map(({ icon, label, action }) => (
          <button
            key={action}
            onClick={() => onNavigate(action)}
            className={`p-6 border rounded-lg transition text-center cursor-pointer hover:shadow-lg ${cardClass}`}
          >
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-sm font-medium">{label}</div>
          </button>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className={`p-6 rounded-lg border ${cardClass} text-center text-slate-500`}>
          <p>No items yet. Start by adding a note or link!</p>
        </div>
      </div>
    </div>
  );
}

function NotesPage({ theme }: PageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load notes from localStorage on component mount
    const savedNotes = NotesStorage.getAll();
    setNotes(savedNotes);
    setLoading(false);
  }, []);

  const inputClass =
    theme === "dark"
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400";
  const containerClass =
    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";

  const handleAddNote = () => {
    if (newTitle.trim() || newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newTitle || "Untitled Note",
        content: newNote,
        date: new Date().toLocaleDateString(),
        createdAt: Date.now(),
      };
      const updatedNotes = [note, ...notes];
      setNotes(updatedNotes);
      NotesStorage.add(note);
      setNewNote("");
      setNewTitle("");
    }
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    NotesStorage.delete(id);
  };

  if (loading) {
    return <div className="text-center text-slate-500">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-4`}>
          <input
            type="text"
            placeholder="Note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className={`w-full p-3 border rounded-lg outline-none focus:border-blue-500 ${inputClass}`}
          />
          <textarea
            placeholder="Write your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={5}
            className={`w-full p-3 border rounded-lg outline-none focus:border-blue-500 resize-none ${inputClass}`}
          />
          <button
            onClick={handleAddNote}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            Save Note
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Notes ({notes.length})</h3>
        {notes.length === 0 ? (
          <div className={`p-8 border rounded-lg ${containerClass} text-center text-slate-500`}>
            <p>No notes yet. Create your first note above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(note => (
              <div key={note.id} className={`p-4 border rounded-lg ${containerClass}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{note.title}</h4>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm mb-2 line-clamp-3">{note.content}</p>
                <p className="text-xs text-slate-500">{note.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LinksPage({ theme }: PageProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLinks = LinksStorage.getAll();
    setLinks(savedLinks);
    setLoading(false);
  }, []);

  const inputClass =
    theme === "dark"
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400";
  const containerClass =
    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";

  const getCategoryFromUrl = (url: string): string => {
    const domains: { [key: string]: string } = {
      instagram: "Instagram",
      youtube: "YouTube",
      pinterest: "Pinterest",
      reddit: "Reddit",
      medium: "Medium",
      github: "GitHub",
      twitter: "Twitter",
      linkedin: "LinkedIn",
    };
    for (const [domain, category] of Object.entries(domains)) {
      if (url.toLowerCase().includes(domain)) return category;
    }
    return "Web";
  };

  const handleAddLink = () => {
    if (newUrl.trim()) {
      try {
        const urlObj = new URL(newUrl.startsWith("http") ? newUrl : `https://${newUrl}`);
        const link: Link = {
          id: Date.now().toString(),
          url: urlObj.href,
          title: urlObj.hostname,
          category: getCategoryFromUrl(urlObj.href),
          date: new Date().toLocaleDateString(),
          createdAt: Date.now(),
        };
        const updatedLinks = [link, ...links];
        setLinks(updatedLinks);
        LinksStorage.add(link);
        setNewUrl("");
      } catch {
        alert("Please enter a valid URL");
      }
    }
  };

  const handleDeleteLink = (id: string) => {
    const updatedLinks = links.filter(l => l.id !== id);
    setLinks(updatedLinks);
    LinksStorage.delete(id);
  };

  if (loading) {
    return <div className="text-center text-slate-500">Loading links...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Save a Link</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-4`}>
          <input
            type="url"
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddLink()}
            className={`w-full p-3 border rounded-lg outline-none focus:border-blue-500 ${inputClass}`}
          />
          <button
            onClick={handleAddLink}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            Save Link
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Saved Links ({links.length})</h3>
        {links.length === 0 ? (
          <div className={`p-8 border rounded-lg ${containerClass} text-center text-slate-500`}>
            <p>No links saved yet. Start saving links above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map(link => (
              <div key={link.id} className={`p-4 border rounded-lg ${containerClass} hover:shadow-md transition`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{link.category}</span>
                      <p className="text-sm text-slate-500">{link.date}</p>
                    </div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate block">
                      {link.title}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MediaPage({ theme }: PageProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedMedia = MediaStorage.getAll();
    setMedia(savedMedia);
    setLoading(false);
  }, []);

  const containerClass =
    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";
  const inputClass =
    theme === "dark"
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      Array.from(files).forEach(file => {
        const mediaItem: Media = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type.split("/")[0] as "image" | "video",
          date: new Date().toLocaleDateString(),
          note: newNote,
          createdAt: Date.now(),
        };
        setMedia(prev => [mediaItem, ...prev]);
        MediaStorage.add(mediaItem);
      });
      setNewNote("");
      e.currentTarget.value = "";
    }
  };

  const handleDeleteMedia = (id: string) => {
    const updatedMedia = media.filter(m => m.id !== id);
    setMedia(updatedMedia);
    MediaStorage.delete(id);
  };

  if (loading) {
    return <div className="text-center text-slate-500">Loading media...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Media</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-4`}>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-800 transition">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer">
              <p className="text-2xl mb-2">📸 📹</p>
              <p className="text-sm text-slate-400">Click to upload images or videos</p>
            </label>
          </div>
          <textarea
            placeholder="Add a note about this media (optional)..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            className={`w-full p-3 border rounded-lg outline-none focus:border-blue-500 resize-none ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Media Library ({media.length})</h3>
        {media.length === 0 ? (
          <div className={`p-8 border rounded-lg ${containerClass} text-center text-slate-500`}>
            <p>No media uploaded yet. Start uploading images or videos above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.map(item => (
              <div key={item.id} className={`p-4 border rounded-lg ${containerClass}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{item.type === "image" ? "🖼️" : "🎬"}</span>
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded uppercase">{item.type}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                    {item.note && <p className="text-xs mt-2 text-slate-400">{item.note}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MindmapPage({ theme }: PageProps) {
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedMindmaps = MindmapsStorage.getAll();
    setMindmaps(savedMindmaps);
    setLoading(false);
  }, []);

  const containerClass =
    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";
  const inputClass =
    theme === "dark"
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400";

  const handleCreateMindmap = () => {
    if (newTitle.trim()) {
      const mindmap: Mindmap = {
        id: Date.now().toString(),
        title: newTitle,
        nodes: 1,
        date: new Date().toLocaleDateString(),
        createdAt: Date.now(),
      };
      const updatedMindmaps = [mindmap, ...mindmaps];
      setMindmaps(updatedMindmaps);
      MindmapsStorage.add(mindmap);
      setNewTitle("");
    }
  };

  const handleDeleteMindmap = (id: string) => {
    const updatedMindmaps = mindmaps.filter(m => m.id !== id);
    setMindmaps(updatedMindmaps);
    MindmapsStorage.delete(id);
  };

  if (loading) {
    return <div className="text-center text-slate-500">Loading mindmaps...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Create New Mindmap</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-4`}>
          <input
            type="text"
            placeholder="Mindmap title (e.g., 'Project Planning', 'Learning Path')..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateMindmap()}
            className={`w-full p-3 border rounded-lg outline-none focus:border-blue-500 ${inputClass}`}
          />
          <button
            onClick={handleCreateMindmap}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            Create Mindmap
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Mindmaps ({mindmaps.length})</h3>
        {mindmaps.length === 0 ? (
          <div className={`p-8 border rounded-lg ${containerClass} text-center text-slate-500`}>
            <p>No mindmaps yet. Create your first mindmap above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mindmaps.map(mindmap => (
              <div key={mindmap.id} className={`p-4 border rounded-lg ${containerClass} hover:shadow-md transition cursor-pointer`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🧠</span>
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">{mindmap.nodes} nodes</span>
                    </div>
                    <h4 className="font-semibold">{mindmap.title}</h4>
                    <p className="text-xs text-slate-500">{mindmap.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteMindmap(mindmap.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-3 h-32 border border-slate-700 rounded bg-opacity-50 flex items-center justify-center text-slate-600 text-sm">
                  [Mindmap Canvas]
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage({ theme }: PageProps) {
  type SettingsKeys = keyof typeof initialSettings;
  
  const initialSettings = {
    darkMode: theme === "dark",
    notifications: true,
    autoSync: true,
    defaultCategory: "General",
  };

  const [settings, setSettings] = useState(initialSettings);
  const containerClass =
    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200";

  const handleToggle = (key: SettingsKeys) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-4`}>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Dark Mode</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={() => handleToggle("darkMode")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Notifications</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleToggle("notifications")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Auto Sync</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={() => handleToggle("autoSync")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Account</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-4`}>
          <div>
            <label className="text-sm font-medium block mb-2">Email</label>
            <p className="text-sm text-slate-500">Not logged in yet</p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
            Sign in with Gmail
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Storage</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-4`}>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Used Space</label>
            <p className="text-sm">0 MB / Unlimited</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <button className="p-2 border border-slate-700 rounded hover:bg-slate-800 transition">Export Data</button>
            <button className="p-2 border border-slate-700 rounded hover:bg-slate-800 transition">Clear Cache</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <div className={`p-6 border rounded-lg ${containerClass} space-y-2 text-sm`}>
          <p>SecondBrain v0.1.0</p>
          <p className="text-slate-500">Your personal knowledge management system</p>
          <a href="#" className="text-blue-500 hover:underline">View License</a>
        </div>
      </div>
    </div>
  );
}

export default App;
