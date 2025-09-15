import { useRouter } from 'expo-router';
import PracticeForm from '../../src/components/PracticeForm';
import { useData } from '../../src/contexts/DataContext';

export default function NewPractice() {
  const { addPractice } = useData();
  const router = useRouter();
  return (
    <PracticeForm
      onSave={(teamId, date, startTime, drills) => {
        addPractice(teamId, date, startTime, drills);
        router.back();
      }}
    />
  );
}
