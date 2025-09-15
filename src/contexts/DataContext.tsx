import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

export type Team = {
  id: string;
  name: string;
};

export type Drill = {
  id: string;
  name: string;
  defaultMinutes: number;
};

export type PracticeDrill = {
  drillId: string;
  minutes: number;
};

export type Practice = {
  id: string;
  teamId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  drills: PracticeDrill[];
};

export type Template = {
  id: string;
  name: string;
  drills: PracticeDrill[];
};

type DataContextType = {
  teams: Team[];
  addTeam: (name: string) => void;
  updateTeam: (id: string, name: string) => void;
  removeTeam: (id: string) => void;
  drills: Drill[];
  addDrill: (name: string, defaultMinutes: number) => void;
  updateDrill: (id: string, name: string, defaultMinutes: number) => void;
  removeDrill: (id: string) => void;
  practices: Practice[];
  addPractice: (
    teamId: string,
    date: string,
    startTime: string,
    drills: PracticeDrill[]
  ) => void;
  updatePractice: (
    id: string,
    teamId: string,
    date: string,
    startTime: string,
    drills: PracticeDrill[]
  ) => void;
  removePractice: (id: string) => void;
  templates: Template[];
  addTemplate: (name: string, drills: PracticeDrill[]) => void;
  updateTemplate: (id: string, name: string, drills: PracticeDrill[]) => void;
  removeTemplate: (id: string) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function id() {
  return Date.now().toString();
}

const DB_NAME = 'practice-planner';
const STORE_NAME = 'data';
const KEY = 'state';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readState(db: IDBDatabase) {
  return new Promise<
    |
      {
        teams?: Team[];
        drills?: Drill[];
        practices?: Practice[];
        templates?: Template[];
      }
    | undefined
  >(resolve => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(undefined);
  });
}

async function saveState(data: {
  teams: Team[];
  drills: Drill[];
  practices: Practice[];
  templates: Template[];
}) {
  const db = await openDb();
  return new Promise<void>(resolve => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Load any saved data on first render
  useEffect(() => {
    if (typeof indexedDB === 'undefined') return;

    let cancelled = false;

    async function load() {
      try {
        const db = await openDb();
        const data = await readState(db);
        if (!cancelled && data) {
          setTeams(data.teams ?? []);
          setDrills(data.drills ?? []);
          setPractices(data.practices ?? []);
          setTemplates(data.templates ?? []);
        }
      } catch {}
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof indexedDB === 'undefined') return;

    saveState({ teams, drills, practices, templates }).catch(() => {});
  }, [teams, drills, practices, templates]);

  const addTeam = (name: string) => setTeams(t => [...t, { id: id(), name }]);
  const updateTeam = (id: string, name: string) =>
    setTeams(t => t.map(team => (team.id === id ? { ...team, name } : team)));
  const removeTeam = (id: string) =>
    setTeams(t => t.filter(team => team.id !== id));

  const addDrill = (name: string, defaultMinutes: number) =>
    setDrills(d => [...d, { id: id(), name, defaultMinutes }]);
  const updateDrill = (id: string, name: string, defaultMinutes: number) =>
    setDrills(d =>
      d.map(drill =>
        drill.id === id ? { ...drill, name, defaultMinutes } : drill
      )
    );
  const removeDrill = (id: string) =>
    setDrills(d => d.filter(drill => drill.id !== id));

  const addPractice = (
    teamId: string,
    date: string,
    startTime: string,
    drills: PracticeDrill[]
  ) =>
    setPractices(p => [...p, { id: id(), teamId, date, startTime, drills }]);
  const updatePractice = (
    id: string,
    teamId: string,
    date: string,
    startTime: string,
    drills: PracticeDrill[]
  ) =>
    setPractices(p =>
      p.map(pr =>
        pr.id === id ? { ...pr, teamId, date, startTime, drills } : pr
      )
    );
  const removePractice = (id: string) =>
    setPractices(p => p.filter(pr => pr.id !== id));

  const addTemplate = (name: string, drills: PracticeDrill[]) =>
    setTemplates(t => [...t, { id: id(), name, drills }]);
  const updateTemplate = (
    id: string,
    name: string,
    drills: PracticeDrill[],
  ) =>
    setTemplates(t =>
      t.map(tmp => (tmp.id === id ? { ...tmp, name, drills } : tmp)),
    );
  const removeTemplate = (id: string) =>
    setTemplates(t => t.filter(tmp => tmp.id !== id));

  return (
    <DataContext.Provider
      value={{
        teams,
        addTeam,
        updateTeam,
        removeTeam,
        drills,
        addDrill,
        updateDrill,
        removeDrill,
        practices,
        addPractice,
        updatePractice,
        removePractice,
        templates,
        addTemplate,
        updateTemplate,
        removeTemplate,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

