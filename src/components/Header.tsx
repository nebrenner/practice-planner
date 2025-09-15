import { Link, usePathname } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function Header() {
  const pathname = usePathname();
  let listLink = null;
  if (pathname.startsWith('/teams') && pathname !== '/teams') {
    listLink = (
      <Link href="/teams" style={styles.link}>
        Teams
      </Link>
    );
  } else if (pathname.startsWith('/drills') && pathname !== '/drills') {
    listLink = (
      <Link href="/drills" style={styles.link}>
        Drills
      </Link>
    );
  } else if (pathname.startsWith('/practices') && pathname !== '/practices') {
    listLink = (
      <Link href="/practices" style={styles.link}>
        Practices
      </Link>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="/" style={styles.link}>
        Home
      </Link>
      {listLink}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  link: {
    fontSize: 18,
    color: 'blue',
  },
});
