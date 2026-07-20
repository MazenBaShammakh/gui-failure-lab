import { useFaultMode } from "@/lib/fault-mode";
import { Stack } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
    faultActive?: boolean;
}

interface Entry {
    id: string;
    label: string;
    date: string;
}

const PAGE_SIZE = 8;
const TOTAL_ENTRIES = 64;

// Oldest entry is id "e24" ("Account created"), newest is "e1".
const ALL_ENTRIES: Entry[] = Array.from({ length: TOTAL_ENTRIES }, (_, i) => {
    const n = i + 1;
    if (n === TOTAL_ENTRIES) {
        return { id: `e${n}`, label: "Account created", date: "Jan 2, 2025" };
    }
    return {
        id: `e${n}`,
        label: `Activity event #${TOTAL_ENTRIES - n + 1}`,
        date: `2025 · entry ${TOTAL_ENTRIES - n + 1}`,
    };
});

export default function UnboundedScrollNoTerminalStateScreen({
    faultActive: faultActiveProp,
}: Props) {
    const faultActiveCtx = useFaultMode();
    const faultActive = faultActiveProp ?? faultActiveCtx;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [opened, setOpened] = useState<Entry | null>(null);

    const entries = ALL_ENTRIES.slice(0, visibleCount);
    const hasMore = visibleCount < TOTAL_ENTRIES;

    const onLoadMore = () => {
        setVisibleCount((c) => Math.min(TOTAL_ENTRIES, c + PAGE_SIZE));
    };

    return (
        <View
            style={styles.container}
            testID={
                faultActive
                    ? "defect:M_UNBOUNDED_SCROLL_NO_TERMINAL_STATE"
                    : undefined
            }
        >
            <Stack.Screen options={{ title: "Activity Log" }} />

            {opened && (
                <View style={styles.banner} accessibilityLiveRegion="polite">
                    <Text style={styles.bannerText}>
                        Opened: {opened.label}
                    </Text>
                </View>
            )}

            <FlatList
                data={entries}
                keyExtractor={(e) => e.id}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => setOpened(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${item.label}`}
                        style={styles.row}
                    >
                        <Text style={styles.rowLabel}>{item.label}</Text>
                        <Text style={styles.rowDate}>{item.date}</Text>
                    </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListFooterComponent={
                    hasMore ? (
                        <Pressable
                            onPress={onLoadMore}
                            accessibilityRole="button"
                            accessibilityLabel="Load older entries"
                            style={styles.loadMoreButton}
                        >
                            <Text style={styles.loadMoreText}>
                                Load older entries
                            </Text>
                        </Pressable>
                    ) : !faultActive ? (
                        // Baseline: once the oldest entry has loaded, a clear terminal
                        // marker tells the agent there's nothing further to fetch.
                        <Text style={styles.terminalMarker}>
                            — Beginning of history —
                        </Text>
                    ) : (
                        // Faulty: the same finite list, but no end-of-content signal is
                        // ever rendered — the footer just goes blank, indistinguishable
                        // from "still loading" or "temporarily out of items".
                        <View style={styles.blankFooter} />
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    banner: { backgroundColor: "#fce4ec", padding: 14 },
    bannerText: { color: "#c2185b", fontSize: 14, fontWeight: "600" },
    row: { paddingHorizontal: 20, paddingVertical: 14, gap: 3 },
    rowLabel: { fontSize: 15, fontWeight: "600", color: "#111" },
    rowDate: { fontSize: 12, color: "#999" },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#eee",
        marginLeft: 20,
    },
    loadMoreButton: { alignItems: "center", paddingVertical: 18 },
    loadMoreText: { fontSize: 14, fontWeight: "700", color: "#c2185b" },
    terminalMarker: {
        textAlign: "center",
        fontSize: 13,
        color: "#999",
        paddingVertical: 20,
    },
    blankFooter: { height: 20 },
});
