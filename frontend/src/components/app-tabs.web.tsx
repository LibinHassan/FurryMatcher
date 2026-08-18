import { useRouter } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { StyleSheet, Text } from 'react-native';

export default function AppTabs() {
  const router = useRouter();
  return (
    <Tabs style={styles.container}>
        <TabList style={styles.tabList}>
        <TabTrigger name="index" href="/" style={styles.tab}>
          <Text style={styles.tabText}>Home</Text>
          </TabTrigger>
          <TabTrigger name="about" href="/about" style={styles.tab}>
            <Text style={styles.tabText}>About</Text>
          </TabTrigger>
          <TabTrigger name="matches" href="/matches" style={styles.tab}>
            <Text style={styles.tabText}>Matches</Text>
          </TabTrigger>
          <TabTrigger name="browse" href="/browse" style={styles.tab}> 
            <Text style={styles.tabText}>Browse</Text>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" style={styles.tab}>
            <Text style={styles.tabText}>Profile</Text>
          </TabTrigger>
        </TabList>
        <TabSlot style={styles.slot} />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slot: { flex: 1 },
tabList: {
  flexDirection: 'row',
  backgroundColor: '#FFFDF0',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
innerTabList: {
  flexDirection:'row',
},
tab: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: 12,
},
tabText: {
  color: '#E8520A',
  fontWeight: '600',
  fontSize: 13,
},
});
