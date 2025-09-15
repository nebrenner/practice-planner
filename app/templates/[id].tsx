import { View, Text, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { showDrillDescription } from '../../src/utils/showDrillDescription';

export default function TemplateView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const templateId = Number(id);
  const { templates, drills, removeTemplate } = useData();
  const template = templates.find((t) => t.id === templateId);
  const router = useRouter();

  if (!template) {
    return (
      <View style={styles.container}>
        <Text>Template not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{template.name}</Text>
      {template.drills.map((td, idx) => {
        const drill = drills.find((d) => d.id === td.drillId);
        return (
          <View key={idx} style={styles.row}>
            <Text style={styles.rowText}>
              {drill?.name ?? 'Unknown drill'} ({td.minutes}m)
            </Text>
            <View style={styles.descriptionButton}>
              <Button
                title="View Description"
                onPress={() => showDrillDescription(drill)}
                disabled={!drill}
              />
            </View>
          </View>
        );
      })}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  descriptionButton: {
    marginLeft: 4,
  },
  buttons: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

