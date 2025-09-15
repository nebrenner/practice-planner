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

type DataSnapshot = {
  teams: Team[];
  drills: Drill[];
  practices: Practice[];
  templates: Template[];
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
  exportAllData: () => DataSnapshot;
  importAllData: (data: unknown) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function id() {
  return Date.now();
}

const DB_NAME = 'practice-planner';
const STORE_NAME = 'data';
const KEY = 'state';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const num = Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }
  return null;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function sanitizeList<T>(value: unknown, clone: (item: unknown) => T | null) {
  if (!Array.isArray(value)) return [] as T[];
  const result: T[] = [];
  for (const item of value) {
    const next = clone(item);
    if (next) {
      result.push(next);
    }
  }
  return result;
}

function clonePracticeDrill(value: unknown): PracticeDrill | null {
  if (!isRecord(value)) return null;
  const drillId = toNumber(value.drillId);
  const minutes = toNumber(value.minutes);
  if (drillId == null || minutes == null) return null;
  return { drillId, minutes };
}

function cloneTeam(value: unknown): Team | null {
  if (!isRecord(value)) return null;
  const id = toNumber(value.id);
  const name = toStringOrNull(value.name);
  if (id == null || !name) return null;
  return { id, name };
}

function cloneDrill(value: unknown): Drill | null {
  if (!isRecord(value)) return null;
  const id = toNumber(value.id);
  const name = toStringOrNull(value.name);
  const defaultMinutes = toNumber(value.defaultMinutes);
  if (id == null || !name || defaultMinutes == null) return null;
  const description = typeof value.description === 'string' ? value.description : '';
  return { id, name, defaultMinutes, description };
}

function clonePractice(value: unknown): Practice | null {
  if (!isRecord(value)) return null;
  const id = toNumber(value.id);
  const teamId = toNumber(value.teamId);
  const date = toStringOrNull(value.date);
  const startTime = toStringOrNull(value.startTime);
  if (id == null || teamId == null || !date || !startTime) return null;
  const drills = sanitizeList(value.drills, clonePracticeDrill);
  return { id, teamId, date, startTime, drills };
}

function cloneTemplate(value: unknown): Template | null {
  if (!isRecord(value)) return null;
  const id = toNumber(value.id);
  const name = toStringOrNull(value.name);
  if (id == null || !name) return null;
  const drills = sanitizeList(value.drills, clonePracticeDrill);
  return { id, name, drills };
}

function sanitizeData(input: unknown): DataSnapshot {
  if (!isRecord(input)) {
    return { teams: [], drills: [], practices: [], templates: [] };
  }

  return {
    teams: sanitizeList(input.teams, cloneTeam),
    drills: sanitizeList(input.drills, cloneDrill),
    practices: sanitizeList(input.practices, clonePractice),
    templates: sanitizeList(input.templates, cloneTemplate),
  };
}

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
          const normalized = sanitizeData(data);
          setTeams(normalized.teams);
          setDrills(normalized.drills);
          setPractices(normalized.practices);
          setTemplates(normalized.templates);
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

  const exportAllData = () => ({
    teams: teams.map((team) => ({ ...team })),
    drills: drills.map((drill) => ({ ...drill })),
    practices: practices.map((practice) => ({
      ...practice,
      drills: practice.drills.map((d) => ({ ...d })),
    })),
    templates: templates.map((template) => ({
      ...template,
      drills: template.drills.map((d) => ({ ...d })),
    })),
  });
  const importAllData = (data: unknown) => {
    const normalized = sanitizeData(data);
    setTeams(normalized.teams);
    setDrills(normalized.drills);
    setPractices(normalized.practices);
    setTemplates(normalized.templates);
  };

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
        exportAllData,
        importAllData,
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

