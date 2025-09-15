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
import { showDrillDescription } from '../utils/showDrillDescription';

export type TemplateFormProps = {
  initialName?: string;
  initialDrills?: PracticeDrill[];
  onSave: (name: string, drills: PracticeDrill[]) => void;
};

export default function TemplateForm({
  initialName = '',
  initialDrills,
  onSave,
}: TemplateFormProps) {
  const { drills } = useData();
  const [name, setName] = useState(initialName);
  const [items, setItems] = useState<{ drillId: number; minutes: string }[]>(
    (initialDrills ?? []).map((d) => ({
      drillId: d.drillId,
      minutes: String(d.minutes),
    })),
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
      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

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
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => addDrill(item)}
              style={styles.suggestion}
            >
              <Text style={styles.suggestionTitle}>
                {item.name} ({item.defaultMinutes}m)
              </Text>
              {item.description ? (
                <Text style={styles.suggestionDescription}>
                  {item.description}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      <FlatList
        data={items}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => {
          const drill = drills.find((d) => d.id === item.drillId);
          return (
            <View style={styles.drillRow}>
              <TouchableOpacity
                style={styles.drillNameButton}
                onPress={() => showDrillDescription(drill)}
                disabled={!drill}
              >
                <Text style={styles.drillName}>
                  {drill?.name ?? 'Unknown drill'}
                </Text>
              </TouchableOpacity>
              <TextInput
                value={item.minutes}
                onChangeText={(text) => updateMinutes(index, text)}
                keyboardType="numeric"
                style={styles.minutesInput}
              />
              <View style={styles.buttons}>
                <Button title="Up" onPress={() => moveUp(index)} />
                <Button title="Down" onPress={() => moveDown(index)} />
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
            items.map((i) => ({ drillId: i.drillId, minutes: Number(i.minutes) || 0 }))
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
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
  },
  total: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestion: {
    padding: 8,
    backgroundColor: '#eee',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontWeight: 'bold',
  },
  suggestionDescription: {
    marginTop: 4,
    color: '#555',
  },
  drillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  drillNameButton: {
    flex: 1,
    marginRight: 8,
  },
  drillName: {
    flex: 1,
    flexShrink: 1,
  },
  minutesInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    marginRight: 8,
  },
  buttons: {
    flexDirection: 'row',
  },
});

