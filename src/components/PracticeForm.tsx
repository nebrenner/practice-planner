import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useData, Drill, PracticeDrill } from '../contexts/DataContext';

export type PracticeFormProps = {
  initialTeamId?: string;
  initialDate?: string;
  initialStartTime?: string;
  initialDrills?: PracticeDrill[];
  onSave: (
    teamId: string,
    date: string,
    startTime: string,
    drills: PracticeDrill[],
  ) => void;
};

export default function PracticeForm({
  initialTeamId,
  initialDate,
  initialStartTime,
  initialDrills,
  onSave,
}: PracticeFormProps) {
  const { teams, drills } = useData();
  const [teamId, setTeamId] = useState(initialTeamId ?? teams[0]?.id ?? '');
  const [date, setDate] = useState(initialDate ?? '');
  const [startTime, setStartTime] = useState(initialStartTime ?? '');
  const [items, setItems] = useState<{ drillId: string; minutes: string }[]>(
    (initialDrills ?? []).map((d) => ({ drillId: d.drillId, minutes: String(d.minutes) }))
  );
  const [search, setSearch] = useState('');

  const suggestions = drills.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      !items.some((i) => i.drillId === d.id)
  );

  const totalMinutes = items.reduce(
    (sum, i) => sum + (Number(i.minutes) || 0),
    0
  );

  function addDrill(d: Drill) {
    setItems((prev) => [
      ...prev,
      { drillId: d.id, minutes: String(d.defaultMinutes) },
    ]);
    setSearch('');
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      const tmp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = tmp;
      return next;
    });
  }

  function moveDown(index: number) {
    setItems((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      const tmp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = tmp;
      return next;
    });
  }

  function updateMinutes(index: number, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], minutes: value };
      return next;
    });
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Team</Text>
      <View style={styles.teamList}>
        {teams.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTeamId(t.id)}
            style={[
              styles.teamOption,
              teamId === t.id && styles.teamOptionSelected,
            ]}
          >
            <Text>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <TextInput
        placeholder="Start Time (HH:MM)"
        value={startTime}
        onChangeText={setStartTime}
        style={styles.input}
      />

      <Text style={styles.total}>Total Minutes: {totalMinutes}</Text>

      <TextInput
        placeholder="Add drill"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />
      {search.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => addDrill(item)}
              style={styles.suggestion}
            >
              <Text>
                {item.name} ({item.defaultMinutes}m)
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => {
          const drill = drills.find((d) => d.id === item.drillId);
          return (
            <View style={styles.drillRow}>
              <Text style={styles.drillName}>{drill?.name}</Text>
              <TextInput
                value={item.minutes}
                onChangeText={(v) => updateMinutes(index, v)}
                keyboardType="numeric"
                style={styles.minutesInput}
              />
              <View style={styles.rowButtons}>
                <Button title="↑" onPress={() => moveUp(index)} />
                <Button title="↓" onPress={() => moveDown(index)} />
                <Button title="X" onPress={() => remove(index)} />
              </View>
            </View>
          );
        }}
      />

      <Button
        title="Save"
        onPress={() =>
          onSave(
            teamId,
            date,
            startTime,
            items.map((i) => ({
              drillId: i.drillId,
              minutes: Number(i.minutes) || 0,
            }))
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontWeight: 'bold',
  },
  teamList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  teamOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  teamOptionSelected: {
    backgroundColor: '#def',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
  },
  total: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  suggestion: {
    padding: 8,
    backgroundColor: '#eee',
    marginBottom: 4,
  },
  drillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  drillName: {
    flex: 1,
  },
  minutesInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    marginRight: 8,
  },
  rowButtons: {
    flexDirection: 'row',
  },
});
