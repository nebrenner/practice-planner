import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';

export default function NewDrill() {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [description, setDescription] = useState('');
  const { addDrill } = useData();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Drill Name</Text>
        <TextInput
          placeholder="Drill name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Minutes</Text>
        <TextInput
          placeholder="Minutes"
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
        />
      </View>
      <Button
        title="Save"
        onPress={() => {
          addDrill(name, Number(minutes) || 0, description.trim());
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
