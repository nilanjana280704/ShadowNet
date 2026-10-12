/**
 * EmergencyContactsScreen — contacts grouped by relationship (family, friends,
 * doctors, neighbours, volunteers) with quick call (placeholder), quick message,
 * and a priority contact.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { spacing } from '../../theme';
import {
  Badge,
  IconButton,
  ListItem,
  ScreenWrapper,
  ScrollWrapper,
  SectionHeader,
  Text,
} from '../../components';
import { initEmergency, prioritySet, showToast } from '../../redux';
import { EmergencyContactsService } from './services';

function EmergencyContactsScreen({ navigation }) {
  const dispatch = useDispatch();
  const byId = useSelector((s) => s.emergencyContacts.byId);
  const ids = useSelector((s) => s.emergencyContacts.ids);

  useEffect(() => {
    dispatch(initEmergency());
  }, [dispatch]);

  const contacts = ids.map((id) => byId[id]).filter(Boolean);
  const sections = EmergencyContactsService.grouped(contacts);

  const call = (contact) => dispatch(showToast({ message: `Calling ${contact.name}… (placeholder)`, severity: 'info' }));
  const message = () => navigation.navigate('Messages', { screen: 'ChatList' });

  return (
    <ScreenWrapper animatedBackground={false}>
      <View style={styles.header}>
        <IconButton icon="back" variant="ghost" color="secondary" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <Text variant="headingM" color="primary">
          Emergency contacts
        </Text>
      </View>

      <ScrollWrapper contentContainerStyle={styles.content}>
        {sections.map((section) => (
          <View key={section.group} style={styles.section}>
            <SectionHeader title={section.meta.label} />
            {EmergencyContactsService.sort(section.contacts).map((contact) => (
              <ListItem
                key={contact.id}
                icon={section.meta.icon}
                iconColor={section.meta.tone}
                title={contact.name}
                subtitle={contact.relation}
                trailing={
                  <View style={styles.actions}>
                    {contact.priority ? <Badge label="Priority" tone="primary" /> : null}
                    <IconButton icon="phoneCall" size="sm" color="success" accessibilityLabel={`Call ${contact.name}`} onPress={() => call(contact)} />
                    <IconButton icon="message" size="sm" color="accent" accessibilityLabel={`Message ${contact.name}`} onPress={message} />
                  </View>
                }
                onPress={() => dispatch(prioritySet(contact.id))}
              />
            ))}
          </View>
        ))}
        <Text variant="caption" color="muted" align="center" style={styles.hint}>
          Tap a contact to make them your priority contact.
        </Text>
      </ScrollWrapper>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
  section: { marginTop: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hint: { marginTop: spacing.lg },
});

export default EmergencyContactsScreen;
