import { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import PracticeForm from '../../src/components/PracticeForm';
import { useData, PracticeDrill } from '../../src/contexts/DataContext';

export default function NewPractice() {
  const { addPractice, templates } = useData();
  const [templateDrills, setTemplateDrills] = useState<PracticeDrill[] | undefined>(
    undefined,
  );
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      {templates.length > 0 && (
        <View style={styles.templates}>
          <Text style={styles.templatesTitle}>Start from Template:</Text>
          <FlatList
            data={templates}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            renderItem={({ item }) => (
              <View style={styles.templateButton}>
                <Button
                  title={item.name}
                  onPress={() => {
                    setTemplateDrills(item.drills);
                    setFormKey((k) => k + 1);
                  }}
                />
              </View>
            )}
          />
        </View>
      )}
      <PracticeForm
        key={formKey}
        initialDrills={templateDrills}
        onSave={(teamId, date, startTime, drills) => {
          addPractice(teamId, date, startTime, drills);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  templates: {
    padding: 16,
  },
  templatesTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  templateButton: {
    marginRight: 8,
  },
});
