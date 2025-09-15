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

type DataContextType = {
  teams: Team[];
  addTeam: (name: string) => void;
  updateTeam: (id: number, name: string) => void;
  removeTeam: (id: number) => void;
  drills: Drill[];
  addDrill: (name: string, defaultMinutes: number) => void;
  updateDrill: (id: number, name: string, defaultMinutes: number) => void;
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
    { teams?: Team[]; drills?: Drill[]; practices?: Practice[] } | undefined
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

    saveState({ teams, drills, practices }).catch(() => {});
  }, [teams, drills, practices]);

  const addTeam = (name: string) =>
    setTeams((t) => [...t, { id: id(), name }]);
  const updateTeam = (id: number, name: string) =>
    setTeams((t) => t.map((team) => (team.id === id ? { ...team, name } : team)));
  const removeTeam = (id: number) =>
    setTeams((t) => t.filter((team) => team.id !== id));

  const addDrill = (name: string, defaultMinutes: number) =>
    setDrills((d) => [...d, { id: id(), name, defaultMinutes }]);
  const updateDrill = (id: number, name: string, defaultMinutes: number) =>
    setDrills((d) =>
      d.map((drill) =>
        drill.id === id ? { ...drill, name, defaultMinutes } : drill,
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

