import { useRouter, useLocalSearchParams } from 'expo-router';
import TemplateForm from '../../src/components/TemplateForm';
import { useData } from '../../src/contexts/DataContext';

export default function NewTemplate() {
  const { addTemplate, practices } = useData();
  const { practiceId } = useLocalSearchParams<{ practiceId?: string }>();
  const practice = practices.find((p) => p.id === Number(practiceId));
  const router = useRouter();
  return (
    <TemplateForm
      initialDrills={practice?.drills}
      onSave={(name, drills) => {
        addTemplate(name, drills);
        router.back();
      }}
    />
  );
}

