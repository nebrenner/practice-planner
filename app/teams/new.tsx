import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '../../src/contexts/DataContext';

export default function NewTeam() {
  const [name, setName] = useState('');
  const { addTeam } = useData();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Team Name</Text>
        <TextInput
          placeholder="Team name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      </View>
      <Button
        title="Save"
        onPress={() => {
          addTeam(name);
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
});
