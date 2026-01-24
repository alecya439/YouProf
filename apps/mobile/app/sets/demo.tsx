import { StyleSheet, Text, View, FlatList } from 'react-native';
import { StudySet } from '@nostalgic/shared';

const demoSet: StudySet = {
  id: 'demo',
  title: 'French basics',
  description: 'Simple greetings and essentials.',
  visibility: 'public',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  terms: [
    { id: '1', term: 'Bonjour', definition: 'Hello' },
    { id: '2', term: 'Merci', definition: 'Thank you' },
    { id: '3', term: 'Au revoir', definition: 'Goodbye' }
  ]
};

export default function DemoSetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{demoSet.visibility}</Text>
      <Text style={styles.title}>{demoSet.title}</Text>
      <Text style={styles.subtitle}>{demoSet.description}</Text>
      <View style={styles.actions}>
        <Text style={styles.chip}>Flashcards</Text>
        <Text style={styles.chip}>Learn</Text>
        <Text style={styles.chip}>Test</Text>
      </View>
      <FlatList
        data={demoSet.terms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, marginTop: 14 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.term}>{item.term}</Text>
            <Text style={styles.definition}>{item.definition}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1021',
    padding: 16,
    gap: 8
  },
  label: {
    color: '#8ea0f6',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12
  },
  title: {
    color: '#f7f7fb',
    fontSize: 26,
    fontWeight: '700'
  },
  subtitle: {
    color: '#c9cee7'
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#12193a',
    color: '#f7f7fb',
    fontWeight: '600'
  },
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#12193a'
  },
  term: {
    color: '#f7f7fb',
    fontWeight: '700'
  },
  definition: {
    color: '#c9cee7',
    marginTop: 4
  }
});
