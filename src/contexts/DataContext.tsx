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

type DataContextType = {
  teams: Team[];
  addTeam: (name: string) => void;
  updateTeam: (id: string, name: string) => void;
  removeTeam: (id: string) => void;
  drills: Drill[];
  addDrill: (name: string, defaultMinutes: number) => void;
  updateDrill: (id: string, name: string, defaultMinutes: number) => void;
  removeDrill: (id: string) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function id() {
  return Date.now().toString();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);

  // Load any saved data on first render
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('practice-planner:data');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          teams?: Team[];
          drills?: Drill[];
        };
        setTeams(parsed.teams ?? []);
        setDrills(parsed.drills ?? []);
      }
    } catch {}
  }, []);

  // Persist whenever data changes
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      'practice-planner:data',
      JSON.stringify({ teams, drills })
    );
  }, [teams, drills]);

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

  return (
    <DataContext.Provider
      value={{ teams, addTeam, updateTeam, removeTeam, drills, addDrill, updateDrill, removeDrill }}
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

