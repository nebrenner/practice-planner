import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

export type Team = {
  id: number;
  name: string;
};

export type Drill = {
  id: number;
  name: string;
  defaultMinutes: number;
  description: string;
};

export type PracticeDrill = {
  drillId: number;
  minutes: number;
};

export type Practice = {
  id: number;
  teamId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  drills: PracticeDrill[];
};

export type Template = {
  id: number;
  name: string;
  drills: PracticeDrill[];
};

type DataContextType = {
  teams: Team[];
  addTeam: (name: string) => void;
  updateTeam: (id: number, name: string) => void;
  removeTeam: (id: number) => void;
  drills: Drill[];
  addDrill: (
    name: string,
    defaultMinutes: number,
    description: string,
  ) => void;
  updateDrill: (
    id: number,
    name: string,
    defaultMinutes: number,
    description: string,
  ) => void;
  removeDrill: (id: number) => void;
  practices: Practice[];
  addPractice: (
    teamId: number,
    date: string,
    startTime: string,
    drills: PracticeDrill[],
  ) => void;
  updatePractice: (
    id: number,
    teamId: number,
    date: string,
    startTime: string,
    drills: PracticeDrill[],
  ) => void;
  removePractice: (id: number) => void;
  templates: Template[];
  addTemplate: (name: string, drills: PracticeDrill[]) => void;
  updateTemplate: (
    id: number,
    name: string,
    drills: PracticeDrill[],
  ) => void;
  removeTemplate: (id: number) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function id() {
  return Date.now();
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
    { teams?: Team[]; drills?: Drill[]; practices?: Practice[]; templates?: Template[] } |
      undefined
  >((resolve) => {
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
          setDrills(
            (data.drills ?? []).map((drill) => ({
              ...drill,
              description: drill.description ?? '',
            })),
          );
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

  const addTeam = (name: string) =>
    setTeams((t) => [...t, { id: id(), name }]);
  const updateTeam = (id: number, name: string) =>
    setTeams((t) => t.map((team) => (team.id === id ? { ...team, name } : team)));
  const removeTeam = (id: number) =>
    setTeams((t) => t.filter((team) => team.id !== id));

  const addDrill = (
    name: string,
    defaultMinutes: number,
    description: string,
  ) =>
    setDrills((d) => [
      ...d,
      { id: id(), name, defaultMinutes, description },
    ]);
  const updateDrill = (
    id: number,
    name: string,
    defaultMinutes: number,
    description: string,
  ) =>
    setDrills((d) =>
      d.map((drill) =>
        drill.id === id
          ? { ...drill, name, defaultMinutes, description }
          : drill,
      ),
    );
  const removeDrill = (id: number) =>
    setDrills((d) => d.filter((drill) => drill.id !== id));

  const addPractice = (
    teamId: number,
    date: string,
    startTime: string,
    drills: PracticeDrill[],
  ) =>
    setPractices((p) => [
      ...p,
      { id: id(), teamId, date, startTime, drills },
    ]);
  const updatePractice = (
    id: number,
    teamId: number,
    date: string,
    startTime: string,
    drills: PracticeDrill[],
  ) =>
    setPractices((p) =>
      p.map((pr) =>
        pr.id === id ? { ...pr, teamId, date, startTime, drills } : pr,
      ),
    );
  const removePractice = (id: number) =>
    setPractices((p) => p.filter((pr) => pr.id !== id));

  const addTemplate = (name: string, drills: PracticeDrill[]) =>
    setTemplates((t) => [...t, { id: id(), name, drills }]);
  const updateTemplate = (
    id: number,
    name: string,
    drills: PracticeDrill[],
  ) =>
    setTemplates((t) =>
      t.map((tpl) => (tpl.id === id ? { ...tpl, name, drills } : tpl)),
    );
  const removeTemplate = (id: number) =>
    setTemplates((t) => t.filter((tpl) => tpl.id !== id));

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

