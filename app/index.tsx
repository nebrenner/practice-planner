import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Practice Planner</Text>
      <Text>Plan practices and run sessions offline.</Text>
      <View style={styles.links}>
        <Link href="teams" style={styles.link}>
          Manage Teams
        </Link>
        <Link href="drills" style={styles.link}>
          Manage Drills
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  links: {
    marginTop: 24,
    width: '100%',
  },
  link: {
    fontSize: 18,
    color: 'blue',
    marginVertical: 8,
  },
});
