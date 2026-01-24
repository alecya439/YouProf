import { Link } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nostalgic</Text>
      <Text style={styles.title}>Study that feels playful</Text>
      <Text style={styles.subtitle}>Create sets, flip flashcards, and drill yourself on the go.</Text>
      <View style={styles.actions}>
        <Pressable style={styles.primary}>
          <Text style={styles.primaryText}>Create a set</Text>
        </Pressable>
        <Link href="/sets/demo" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryText}>Try a demo</Text>
          </Pressable>
        </Link>
      </View>
      <View style={styles.cardGrid}>
        {[
          { title: 'Flashcards', desc: 'Swipe to reveal and mark known/unknown.' },
          { title: 'Learn', desc: 'Multiple choice drill for accuracy.' },
          { title: 'Test', desc: 'Typing mode to cement recall.' }
        ].map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1021',
    padding: 24,
    gap: 12
  },
  label: {
    color: '#8ea0f6',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#f7f7fb'
  },
  subtitle: {
    color: '#c9cee7',
    marginTop: 4
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  primary: {
    backgroundColor: '#9ef5c0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999
  },
  primaryText: {
    color: '#0b1021',
    fontWeight: '700'
  },
  secondary: {
    borderColor: '#f7f7fb',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999
  },
  secondaryText: {
    color: '#f7f7fb',
    fontWeight: '700'
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  },
  card: {
    width: '48%',
    minWidth: 150,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#12193a'
  },
  cardTitle: {
    color: '#f7f7fb',
    fontWeight: '600',
    marginBottom: 6
  },
  cardDesc: {
    color: '#c9cee7'
  }
});
