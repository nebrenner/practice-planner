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
  KeyboardAvoidingView,
} from 'react-native';
import { useData, Drill, PracticeDrill } from '../contexts/DataContext';
import { formatDate, formatTime, parseDate, parseTime } from '../utils/date';
import { showDrillDescription } from '../utils/showDrillDescription';
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
  const initialStart = initialStartTime
    ? parseTime(initialStartTime)
    : new Date();
  const [startTime, setStartTime] = useState<Date>(initialStart);
  const [startTimeInput, setStartTimeInput] = useState<string>(
    formatTime(initialStart)
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

  function handleStartTimeChange(text: string) {
    const sanitized = text.replace(/[^\d:]/g, '');
    const hasColon = sanitized.includes(':');
    const endsWithColon = sanitized.endsWith(':');
    let hoursPart = '';
    let minutesPart = '';

    if (hasColon) {
      const firstColon = sanitized.indexOf(':');
      hoursPart = sanitized.slice(0, firstColon);
      minutesPart = sanitized.slice(firstColon + 1).replace(/:/g, '');
    } else {
      hoursPart = sanitized;
      if (sanitized.length > 2) {
        minutesPart = sanitized.slice(2);
        hoursPart = sanitized.slice(0, 2);
      }
    }

    hoursPart = hoursPart.slice(0, 2);
    minutesPart = minutesPart.slice(0, 2);

    let normalized = hoursPart;

    if (
      (hasColon || sanitized.length > 2) &&
      (hoursPart.length > 0 || sanitized.startsWith(':') || endsWithColon)
    ) {
      normalized += ':';
    }

    normalized += minutesPart;

    if (endsWithColon && minutesPart.length < 2 && !normalized.endsWith(':')) {
      normalized += ':';
    }

    if (!hasColon && sanitized.length <= 2) {
      normalized = hoursPart;
    }

    setStartTimeInput(normalized);

    const match = /^(\d{1,2}):(\d{2})$/.exec(normalized);
    if (!match) {
      return;
    }

    const [hoursText, minutesText] = match.slice(1);
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      setStartTime(parseTime(`${hoursText}:${minutesText}`));
    }
  }

  function handleStartTimeBlur() {
    const formatted = formatTime(startTime);
    if (startTimeInput !== formatted) {
      setStartTimeInput(formatted);
    }
  }

  const headerComponent = (
    <View>
      <View style={styles.field}>
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
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Practice Date</Text>
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
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Start Time</Text>
        {isWeb ? (
          <TextInput
            style={styles.input}
            value={startTimeInput}
            placeholder="HH:MM"
            onChangeText={handleStartTimeChange}
            onBlur={handleStartTimeBlur}
            maxLength={5}
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
                  if (selected) {
                    setStartTime(selected);
                    setStartTimeInput(formatTime(selected));
                  }
                }}
              />
            )}
          </View>
        )}
      </View>

      <Text style={styles.total}>Total Minutes: {totalMinutes}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Search Drills</Text>
        <TextInput
          placeholder="Add drill"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>
      {search.length > 0 && (
        <View style={styles.suggestionsWrapper}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
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
          ))}
        </View>
      )}
    </View>
  );

  const footerComponent = (
    <View style={styles.footer}>
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
            })),
          )
        }
      />
    </View>
  );

  const keyboardBehavior =
    Platform.OS === 'ios'
      ? 'padding'
      : Platform.OS === 'android'
        ? 'height'
        : undefined;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={keyboardBehavior}>
      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
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
              <View style={styles.minutesContainer}>
                <Text style={styles.minutesLabel}>Minutes</Text>
                <TextInput
                  value={item.minutes}
                  onChangeText={(v) => updateMinutes(index, v)}
                  keyboardType="numeric"
                  style={styles.minutesInput}
                />
              </View>
              <View style={styles.rowButtons}>
                <Button title="↑" onPress={() => moveUp(index)} />
                <Button title="↓" onPress={() => moveDown(index)} />
                <Button title="X" onPress={() => remove(index)} />
              </View>
            </View>
          );
        }}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 64,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
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
    marginBottom: 0,
  },
  picker: {
    marginTop: 4,
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
  suggestionsWrapper: {
    marginBottom: 16,
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
    width: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    marginRight: 0,
  },
  minutesContainer: {
    width: 70,
    marginRight: 8,
  },
  minutesLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rowButtons: {
    flexDirection: 'row',
  },
  footer: {
    marginTop: 16,
  },
});
