import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface License {
  id: string;
  name: string;
  pkg: string;
  body: string;
}

// "MIT License" deliberately sits far enough down that it is NOT visible without
// scrolling. In faulty mode the only way to reach it is by scrolling the inner
// fixed-height box.
const LICENSES: License[] = [
  { id: 'apache', name: 'Apache-2.0 License', pkg: 'react-native', body: 'Licensed under the Apache License, Version 2.0.' },
  { id: 'bsd3', name: 'BSD-3-Clause License', pkg: 'react', body: 'Redistribution and use in source and binary forms…' },
  { id: 'isc', name: 'ISC License', pkg: 'inherits', body: 'Permission to use, copy, modify, and/or distribute…' },
  { id: 'apache2', name: 'Apache-2.0 License', pkg: 'expo-router', body: 'Licensed under the Apache License, Version 2.0.' },
  { id: 'bsd2', name: 'BSD-2-Clause License', pkg: 'normalize-path', body: 'Redistribution and use in source and binary forms…' },
  { id: 'gpl3', name: 'GPL-3.0 License', pkg: 'readline-sync', body: 'This program is free software: you can redistribute it…' },
  { id: 'mpl', name: 'MPL-2.0 License', pkg: 'certifi', body: 'This Source Code Form is subject to the terms of the MPL.' },
  { id: 'zlib', name: 'Zlib License', pkg: 'pako', body: 'This software is provided as-is, without any warranty.' },
  // Target — far down the list, never visible without scrolling.
  { id: 'mit', name: 'MIT License', pkg: '@react-native-async-storage/async-storage', body: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction…' },
  { id: 'unlicense', name: 'The Unlicense', pkg: 'tiny-emitter', body: 'This is free and unencumbered software released into the public domain.' },
  { id: 'cc0', name: 'CC0-1.0 License', pkg: 'spdx-license-ids', body: 'The person who associated a work with this deed has dedicated the work to the public domain.' },
];

export default function NestedScrollTrapScreen({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;
  const [openedId, setOpenedId] = useState<string | null>(null);

  const openLicense = (lic: License) => {
    setOpenedId(lic.id);
    Alert.alert(lic.name, `${lic.pkg}\n\n${lic.body}`);
  };

  const renderRow = (lic: License) => (
    <Pressable
      key={lic.id}
      onPress={() => openLicense(lic)}
      accessibilityRole="button"
      accessibilityLabel={`${lic.name}, ${lic.pkg}`}
      style={({ pressed }) => [styles.licenseRow, pressed && styles.licenseRowPressed]}
    >
      <View style={styles.licenseText}>
        <Text style={styles.licenseName}>{lic.name}</Text>
        <Text style={styles.licensePkg} numberOfLines={1}>
          {lic.pkg}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <View
      style={styles.container}
      testID={faultActive ? 'defect:M_NESTED_SCROLL_TRAP' : undefined}
    >
      <Stack.Screen options={{ title: 'Open-source licenses' }} />

      <ScrollView
        style={styles.outer}
        contentContainerStyle={styles.outerContent}
        nestedScrollEnabled
      >
        <Text style={styles.heading}>Open-source licenses</Text>
        <Text style={styles.intro}>
          This app is built with open-source software. We are grateful to the
          maintainers of the libraries below. Tap any entry to read its full
          license text.
        </Text>

        {faultActive ? (
          // Faulty: licenses live inside a fixed-height inner ScrollView. The
          // outer page does not scroll past it, so "MIT License" (far down the
          // inner list) is only reachable by scrolling the inner box.
          <View style={styles.innerWrap}>
            <Text style={styles.innerLabel}>Licenses</Text>
            <ScrollView
              style={styles.innerScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {LICENSES.map(renderRow)}
            </ScrollView>
          </View>
        ) : (
          // Baseline: licenses are part of the normal outer page scroll, so MIT
          // is reachable by ordinary scrolling.
          <View style={styles.flatList}>{LICENSES.map(renderRow)}</View>
        )}

        <Text style={styles.footnote}>
          Showing {LICENSES.length} packages. Last updated June 2026.
        </Text>
      </ScrollView>

      {openedId && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            Opened: {LICENSES.find((l) => l.id === openedId)?.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f3f7' },
  outer: { flex: 1 },
  outerContent: { padding: 16, paddingBottom: 32 },

  heading: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8 },
  intro: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },

  innerWrap: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  innerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  innerScroll: { height: 180 },

  flatList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },

  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    gap: 12,
  },
  licenseRowPressed: { backgroundColor: '#f5f5f5' },
  licenseText: { flex: 1, gap: 2 },
  licenseName: { fontSize: 15, fontWeight: '600', color: '#111' },
  licensePkg: { fontSize: 12, color: '#999' },
  chevron: { fontSize: 22, color: '#ccc' },

  footnote: { fontSize: 12, color: '#aaa', marginTop: 16, marginLeft: 4 },

  statusBar: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusText: { fontSize: 13, color: '#555' },
});
