import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";

// Theme context
type Theme = "dark" | "light";

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
  const [currentPage, setCurrentPage] = useState<"dashboard" | "notes" | "links" | "media" | "mindmap" | "settings">(
    "dashboard"
  );

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
          {currentPage === "dashboard" && <DashboardPage theme={theme} />}
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

function DashboardPage({ theme }: PageProps) {
  const cardClass =
    theme === "dark"
      ? "bg-slate-900 border-slate-800 hover:border-slate-700"
      : "bg-slate-50 border-slate-200 hover:border-slate-300";

  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">Quick Add</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: "📝", label: "New Note", action: "note" },
          { icon: "🔗", label: "Save Link", action: "link" },
          { icon: "🖼️", label: "Add Media", action: "media" },
          { icon: "🧠", label: "Create Mindmap", action: "mindmap" },
          { icon: "📋", label: "Quick Capture", action: "capture" },
          { icon: "🏷️", label: "Browse Tags", action: "tags" },
        ].map(({ icon, label, action }) => (
          <button
            key={action}
            className={`p-6 border rounded-lg transition text-center cursor-pointer ${cardClass}`}
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
  return (
    <div>
      <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
        Notes section coming soon...
      </p>
    </div>
  );
}

function LinksPage({ theme }: PageProps) {
  return (
    <div>
      <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
        Links section coming soon...
      </p>
    </div>
  );
}

function MediaPage({ theme }: PageProps) {
  return (
    <div>
      <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
        Media gallery coming soon...
      </p>
    </div>
  );
}

function MindmapPage({ theme }: PageProps) {
  return (
    <div>
      <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
        Mindmap editor coming soon...
      </p>
    </div>
  );
}

function SettingsPage({ theme }: PageProps) {
  return (
    <div>
      <p className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>
        Settings page coming soon...
      </p>
    </div>
  );
}

export default App;
