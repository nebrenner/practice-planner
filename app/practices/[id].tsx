import { View, Text, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';

export default function PracticeView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const practiceId = Number(id);
  const { practices, teams, drills, removePractice } = useData();
  const practice = practices.find((p) => p.id === practiceId);
  const router = useRouter();

  if (!practice) {
    return (
      <View style={styles.container}>
        <Text>Practice not found</Text>
      </View>
    );
  }

  const team = teams.find((t) => t.id === practice.teamId);
  const start = new Date(`${practice.date}T${practice.startTime}`);
  let current = new Date(start);
  const schedule = practice.drills.map((pd) => {
    const drill = drills.find((d) => d.id === pd.drillId);
    const startTime = new Date(current);
    current = new Date(current.getTime() + pd.minutes * 60000);
    return { drill, minutes: pd.minutes, startTime };
  });

  function formatTime(date: Date) {
    return date.toTimeString().slice(0, 5);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {team?.name} - {practice.date} {practice.startTime}
      </Text>
      {schedule.map((s, idx) => (
        <Text key={idx} style={styles.row}>
          {formatTime(s.startTime)} - {s.drill?.name} ({s.minutes}m)
        </Text>
      ))}
      <View style={styles.buttons}>
        <Link href={`/practices/${practice.id}/edit`} asChild>
          <Button title="Edit" />
        </Link>
        <Button
          title="Delete"
          color="red"
          onPress={() => {
            removePractice(practice.id);
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    marginBottom: 8,
  },
  buttons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
