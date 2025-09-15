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
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function id() {
  return Date.now().toString();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);

  // Load any saved data on first render
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('practice-planner:data');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          teams?: Team[];
          drills?: Drill[];
          practices?: Practice[];
        };
        setTeams(parsed.teams ?? []);
        setDrills(parsed.drills ?? []);
        setPractices(parsed.practices ?? []);
      }
    } catch {}
  }, []);

  // Persist whenever data changes
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      'practice-planner:data',
      JSON.stringify({ teams, drills, practices })
    );
  }, [teams, drills, practices]);

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

