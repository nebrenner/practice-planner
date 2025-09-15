import { Link } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';
import { FlatList, View, Text, Button, StyleSheet } from 'react-native';

export default function PracticesScreen() {
  const { practices, removePractice, teams } = useData();
  const sorted = [...practices].sort(
    (a, b) =>
      new Date(`${b.date}T${b.startTime}`).getTime() -
      new Date(`${a.date}T${a.startTime}`).getTime()
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const team = teams.find((t) => t.id === item.teamId);
          return (
            <View style={styles.row}>
              <Link href={`/practices/${item.id}`} style={styles.name}>
                {item.date} {item.startTime} - {team?.name}
              </Link>
              <Button title="Delete" onPress={() => removePractice(item.id)} />
            </View>
          );
        }}
        ListEmptyComponent={<Text>No practices yet</Text>}
      />
      <Link href="/practices/new" asChild>
        <Button title="Add Practice" />
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
