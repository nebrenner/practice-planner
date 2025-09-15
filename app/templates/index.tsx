import { Link } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { FlatList, View, Text, Button, StyleSheet } from 'react-native';

export default function TemplatesScreen() {
  const { templates, removeTemplate } = useData();
  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Link href={`/templates/${item.id}`} style={styles.name}>
              {item.name}
            </Link>
            <Button title="Delete" onPress={() => removeTemplate(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text>No templates yet</Text>}
      />
      <Link href="/templates/new" asChild>
        <Button title="Add Template" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
  },
});

