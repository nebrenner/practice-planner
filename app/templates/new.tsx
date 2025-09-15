import { useLocalSearchParams, useRouter } from 'expo-router';
import TemplateForm from '../../src/components/TemplateForm';
import { useData } from '../../src/contexts/DataContext';

export default function NewTemplate() {
  const { practice } = useLocalSearchParams<{ practice?: string }>();
  const { addTemplate, practices } = useData();
  const router = useRouter();
  const initialDrills = practice
    ? practices.find(p => p.id === practice)?.drills
    : undefined;
  return (
    <TemplateForm
      initialDrills={initialDrills}
      onSave={(name, drills) => {
        addTemplate(name, drills);
        router.back();
      }}
    />
  );
}
