import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TemplateForm from '../../../src/components/TemplateForm';
import { useData } from '../../../src/contexts/DataContext';

export default function EditTemplate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const templateId = Number(id);
  const { templates, updateTemplate } = useData();
  const template = templates.find((t) => t.id === templateId);
  const router = useRouter();

  if (!template) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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

