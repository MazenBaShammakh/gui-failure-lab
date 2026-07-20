import { useFaultMode } from "@/lib/fault-mode";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
    faultActive?: boolean;
}

interface TaskItem {
    id: string;
    label: string;
}

const TASKS: TaskItem[] = [
    { id: "t1", label: "Review pull request #47" },
    { id: "t2", label: "Update onboarding docs" },
    { id: "t3", label: "Submit expense report" },
    { id: "t4", label: "Schedule 1:1 with Priya" },
    { id: "t5", label: "Renew domain registration" },
];

const ROW_HEIGHT = 56;
const LIST_TOP = 100; // header + "Last synced" banner height above the list
const TARGET_INDEX = TASKS.findIndex((t) => t.id === "t3");

export default function PopupAfterSnapshotScreen({
    faultActive: faultActiveProp,
}: Props) {
    const faultActiveCtx = useFaultMode();
    const faultActive = faultActiveProp ?? faultActiveCtx;
    const [done, setDone] = useState<Record<string, boolean>>({});
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (!faultActive) return;
        // ~1.5s after mount — past a typical agent snapshot — a "Sync complete"
        // toast is injected at the exact screen coordinates of the target
        // checkbox, so a tap planned against the pre-popup snapshot lands on the
        // toast instead of the checkbox underneath.
        const timer = setTimeout(() => setToastVisible(true), 3000);
        return () => clearTimeout(timer);
    }, [faultActive]);

    const toggle = (id: string) =>
        setDone((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <View
            style={styles.container}
            testID={faultActive ? "defect:M_POPUP_AFTER_SNAPSHOT" : undefined}
        >
            <Stack.Screen options={{ title: "Sync" }} />

            <View style={styles.syncBanner}>
                <Text style={styles.syncBannerText}>Last synced: just now</Text>
            </View>

            <View>
                {TASKS.map((t) => (
                    <Pressable
                        key={t.id}
                        onPress={() => toggle(t.id)}
                        accessibilityRole="checkbox"
                        accessibilityLabel={t.label}
                        accessibilityState={{ checked: !!done[t.id] }}
                        style={styles.row}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                done[t.id] && styles.checkboxChecked,
                            ]}
                        >
                            {done[t.id] && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                        <Text
                            style={[
                                styles.rowLabel,
                                done[t.id] && styles.rowLabelDone,
                            ]}
                        >
                            {t.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {toastVisible && (
                <Pressable
                    onPress={() => setToastVisible(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss sync complete notification"
                    style={[
                        styles.toast,
                        { top: LIST_TOP + TARGET_INDEX * ROW_HEIGHT },
                    ]}
                >
                    <Text style={styles.toastText}>Sync complete ✓</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    syncBanner: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#eee",
    },
    syncBannerText: { fontSize: 13, color: "#888", fontWeight: "600" },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        height: 56,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#f0f0f0",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#00897b",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: { backgroundColor: "#00897b" },
    checkmark: { color: "#fff", fontSize: 15, fontWeight: "800" },
    rowLabel: { fontSize: 15, color: "#111" },
    rowLabelDone: { color: "#999", textDecorationLine: "line-through" },
    toast: {
        position: "absolute",
        left: 16,
        right: 16,
        height: 56,
        backgroundColor: "#00897b",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
    },
    toastText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
