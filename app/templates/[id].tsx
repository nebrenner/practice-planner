import { View, Text, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';

export default function TemplateView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { templates, drills, removeTemplate } = useData();
  const template = templates.find(t => t.id === id);
  const router = useRouter();

  if (!template) {
    return (
      <View style={styles.container}>
        <Text>Template not found</Text>
      </View>
    );
  }

  let current = 0;
  const schedule = template.drills.map(pd => {
    const drill = drills.find(d => d.id === pd.drillId);
    const start = current;
    current += pd.minutes;
    return { drill, minutes: pd.minutes, start };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{template.name}</Text>
      {schedule.map((s, idx) => (
        <Text key={idx} style={styles.row}>
          {s.start}m - {s.drill?.name} ({s.minutes}m)
        </Text>
      ))}
      <View style={styles.buttons}>
        <Link href={`/templates/${template.id}/edit`} asChild>
          <Button title="Edit" />
        </Link>
        <Button
          title="Delete"
          color="red"
          onPress={() => {
            removeTemplate(template.id);
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
