import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useData } from '../../src/contexts/DataContext';

export default function EditTeam() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);
  const { teams, updateTeam, removeTeam } = useData();
  const team = teams.find(t => t.id === teamId);
  const [name, setName] = useState(team?.name ?? '');
  const router = useRouter();

  if (!team) {
    return (
      <View style={styles.container}>
        <Text>Team not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Team Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />
      </View>
      <Button
        title="Save"
        onPress={() => {
          updateTeam(team.id, name);
          router.back();
        }}
      />
      <View style={styles.spacer} />
      <Button
        title="Delete"
        color="red"
        onPress={() => {
          removeTeam(team.id);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },
  spacer: {
    height: 12,
  },
});
