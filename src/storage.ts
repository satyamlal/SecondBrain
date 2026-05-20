export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: number;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  category: string;
  date: string;
  createdAt: number;
}

export interface Media {
  id: string;
  name: string;
  type: "image" | "video";
  date: string;
  note: string;
  createdAt: number;
}

export interface Mindmap {
  id: string;
  title: string;
  nodes: number;
  date: string;
  createdAt: number;
}

const STORAGE_KEYS = {
  NOTES: "secondbrain:notes",
  LINKS: "secondbrain:links",
  MEDIA: "secondbrain:media",
  MINDMAPS: "secondbrain:mindmaps",
};

// Notes Storage
export const NotesStorage = {
  getAll: (): Note[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load notes:", error);
      return [];
    }
  },

  save: (notes: Note[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  },

  add: (note: Note): void => {
    const notes = NotesStorage.getAll();
    notes.unshift(note);
    NotesStorage.save(notes);
  },

  delete: (id: string): void => {
    const notes = NotesStorage.getAll();
    const filtered = notes.filter(n => n.id !== id);
    NotesStorage.save(filtered);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.NOTES);
  },
};

// Links Storage
export const LinksStorage = {
  getAll: (): Link[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LINKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load links:", error);
      return [];
    }
  },

  save: (links: Link[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    } catch (error) {
      console.error("Failed to save links:", error);
    }
  },

  add: (link: Link): void => {
    const links = LinksStorage.getAll();
    links.unshift(link);
    LinksStorage.save(links);
  },

  delete: (id: string): void => {
    const links = LinksStorage.getAll();
    const filtered = links.filter(l => l.id !== id);
    LinksStorage.save(filtered);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.LINKS);
  },
};

// Media Storage
export const MediaStorage = {
  getAll: (): Media[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load media:", error);
      return [];
    }
  },

  save: (media: Media[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
    } catch (error) {
      console.error("Failed to save media:", error);
    }
  },

  add: (item: Media): void => {
    const media = MediaStorage.getAll();
    media.unshift(item);
    MediaStorage.save(media);
  },

  delete: (id: string): void => {
    const media = MediaStorage.getAll();
    const filtered = media.filter(m => m.id !== id);
    MediaStorage.save(filtered);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MEDIA);
  },
};

// Mindmaps Storage
export const MindmapsStorage = {
  getAll: (): Mindmap[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MINDMAPS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load mindmaps:", error);
      return [];
    }
  },

  save: (mindmaps: Mindmap[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.MINDMAPS, JSON.stringify(mindmaps));
    } catch (error) {
      console.error("Failed to save mindmaps:", error);
    }
  },

  add: (mindmap: Mindmap): void => {
    const mindmaps = MindmapsStorage.getAll();
    mindmaps.unshift(mindmap);
    MindmapsStorage.save(mindmaps);
  },

  delete: (id: string): void => {
    const mindmaps = MindmapsStorage.getAll();
    const filtered = mindmaps.filter(m => m.id !== id);
    MindmapsStorage.save(filtered);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MINDMAPS);
  },
};

export const StorageUtils = {
  clearAll: (): void => {
    NotesStorage.clear();
    LinksStorage.clear();
    MediaStorage.clear();
    MindmapsStorage.clear();
  },

  getStorageSize: (): string => {
    let size = 0;
    for (const key in STORAGE_KEYS) {
      const data = localStorage.getItem(Object.values(STORAGE_KEYS)[Object.keys(STORAGE_KEYS).indexOf(key)]);
      if (data) size += data.length;
    }
    return `${(size / 1024).toFixed(2)} KB`;
  },
};
