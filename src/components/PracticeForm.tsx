import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useData, Drill, PracticeDrill } from '../contexts/DataContext';
import { formatDate, formatTime, parseDate, parseTime } from '../utils/date';
// DateTimePicker is not available on web, so require dynamically
const DateTimePicker =
  Platform.OS === 'web'
    ? null
    : (
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('@react-native-community/datetimepicker').default as any
      );

export type PracticeFormProps = {
  initialTeamId?: number;
  initialDate?: string;
  initialStartTime?: string;
  initialDrills?: PracticeDrill[];
  onSave: (
    teamId: number,
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
  const isWeb = Platform.OS === 'web';
  const [teamId, setTeamId] = useState<number>(
    initialTeamId ?? teams[0]?.id ?? 0,
  );
  const [date, setDate] = useState<Date>(
    initialDate ? parseDate(initialDate) : new Date()
  );
  const [startTime, setStartTime] = useState<Date>(
    initialStartTime ? parseTime(initialStartTime) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
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
      
      {isWeb ? (
        <TextInput
          style={styles.input}
          value={formatDate(date)}
          placeholder="YYYY-MM-DD"
          onChangeText={(text) => setDate(parseDate(text))}
        />
      ) : (
        <View style={styles.picker}>
          <Button
            title={`Date: ${formatDate(date)}`}
            onPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && DateTimePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </View>
      )}

      {isWeb ? (
        <TextInput
          style={styles.input}
          value={formatTime(startTime)}
          placeholder="HH:MM"
          onChangeText={(text) => setStartTime(parseTime(text))}
        />
      ) : (
        <View style={styles.picker}>
          <Button
            title={`Start Time: ${formatTime(startTime)}`}
            onPress={() => setShowTimePicker(true)}
          />
          {showTimePicker && DateTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={(_, selected) => {
                setShowTimePicker(false);
                if (selected) setStartTime(selected);
              }}
            />
          )}
        </View>
      )}
      
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
            formatDate(date),
            formatTime(startTime),
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
  picker: {
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
