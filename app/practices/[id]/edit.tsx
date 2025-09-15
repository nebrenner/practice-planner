import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PracticeForm from '../../../src/components/PracticeForm';
import { useData } from '../../../src/contexts/DataContext';

export default function EditPractice() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { practices, updatePractice } = useData();
  const practice = practices.find((p) => p.id === id);
  const router = useRouter();

  if (!practice) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Practice not found</Text>
      </View>
    );
  }

  return (
    <PracticeForm
      initialTeamId={practice.teamId}
      initialDate={practice.date}
      initialStartTime={practice.startTime}
      initialDrills={practice.drills}
      onSave={(teamId, date, startTime, drills) => {
        updatePractice(practice.id, teamId, date, startTime, drills);
        router.back();
      }}
    />
  );
}
