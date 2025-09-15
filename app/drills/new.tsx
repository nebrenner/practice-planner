import { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
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
      <TextInput
        placeholder="Drill name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Minutes"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
      />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
