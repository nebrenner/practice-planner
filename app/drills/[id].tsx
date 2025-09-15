import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useData } from '../../src/contexts/DataContext';

export default function EditDrill() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const drillId = Number(id);
  const { drills, updateDrill, removeDrill } = useData();
  const drill = drills.find(d => d.id === drillId);
  const [name, setName] = useState(drill?.name ?? '');
  const [minutes, setMinutes] = useState(
    drill ? String(drill.defaultMinutes) : ''
  );
  const router = useRouter();

  if (!drill) {
    return (
      <View style={styles.container}>
        <Text>Drill not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button
        title="Save"
        onPress={() => {
          updateDrill(drill.id, name, Number(minutes) || 0);
          router.back();
        }}
      />
      <View style={styles.spacer} />
      <Button
        title="Delete"
        color="red"
        onPress={() => {
          removeDrill(drill.id);
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
  },
  spacer: {
    height: 12,
  },
});
