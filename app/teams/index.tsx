import { Link } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { FlatList, View, Text, Button, StyleSheet } from 'react-native';

export default function TeamsScreen() {
  const { teams, removeTeam } = useData();
  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Link href={`/teams/${item.id}`} style={styles.name}>
              {item.name}
            </Link>
            <Button title="Delete" onPress={() => removeTeam(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text>No teams yet</Text>}
      />
      <Link href="/teams/new" asChild>
        <Button title="Add Team" />
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
