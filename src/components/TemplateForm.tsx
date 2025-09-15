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

export type TemplateFormProps = {
  initialName?: string;
  initialDrills?: PracticeDrill[];
  onSave: (name: string, drills: PracticeDrill[]) => void;
};

export default function TemplateForm({
  initialName,
  initialDrills,
  onSave,
}: TemplateFormProps) {
  const { drills } = useData();
  const [name, setName] = useState(initialName ?? '');
  const [items, setItems] = useState<{ drillId: string; minutes: string }[]>(
    (initialDrills ?? []).map(d => ({ drillId: d.drillId, minutes: String(d.minutes) }))
  );
  const [search, setSearch] = useState('');

  const suggestions = drills.filter(
    d =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      !items.some(i => i.drillId === d.id)
  );

  const totalMinutes = items.reduce(
    (sum, i) => sum + (Number(i.minutes) || 0),
    0
  );

  function addDrill(d: Drill) {
    setItems(prev => [
      ...prev,
      { drillId: d.id, minutes: String(d.defaultMinutes) },
    ]);
    setSearch('');
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setItems(prev => {
      const next = [...prev];
      const tmp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = tmp;
      return next;
    });
  }

  function moveDown(index: number) {
    setItems(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      const tmp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = tmp;
      return next;
    });
  }

  function updateMinutes(index: number, value: string) {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], minutes: value };
      return next;
    });
  }

  function remove(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Template Name"
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
          keyExtractor={item => item.id}
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
          const drill = drills.find(d => d.id === item.drillId);
          return (
            <View style={styles.drillRow}>
              <Text style={styles.drillName}>{drill?.name}</Text>
              <TextInput
                value={item.minutes}
                onChangeText={v => updateMinutes(index, v)}
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
            name,
            items.map(i => ({
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

