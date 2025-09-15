import { useLocalSearchParams, useRouter } from 'expo-router';
import TemplateForm from '../../../src/components/TemplateForm';
import { useData } from '../../../src/contexts/DataContext';
import { View, Text } from 'react-native';

export default function EditTemplate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { templates, updateTemplate } = useData();
  const template = templates.find(t => t.id === id);
  const router = useRouter();

  if (!template) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Template not found</Text>
      </View>
    );
  }

  return (
    <TemplateForm
      initialName={template.name}
      initialDrills={template.drills}
      onSave={(name, drills) => {
        updateTemplate(template.id, name, drills);
        router.back();
      }}
    />
  );
}
