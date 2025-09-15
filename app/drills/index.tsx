import { Link } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { FlatList, View, Text, Button, StyleSheet } from 'react-native';

export default function DrillsScreen() {
  const { drills, removeDrill } = useData();
  return (
    <View style={styles.container}>
      <FlatList
        data={drills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Link href={`/drills/${item.id}`} style={styles.name}>
              {item.name} ({item.defaultMinutes}m)
            </Link>
            <Button title="Delete" onPress={() => removeDrill(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text>No drills yet</Text>}
      />
      <Link href="/drills/new" asChild>
        <Button title="Add Drill" />
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
