import { useFaultMode } from "@/lib/fault-mode";
import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface Props {
    faultActive?: boolean;
}

const LYRICS = [
    "Ocean breeze, carry me home",
    "Waves that whisper, never alone",
    "Salt air on the coastline road",
    "Ocean breeze, carry me home",
];

export default function ActionableTextStyledStaticScreen({
    faultActive: faultActiveProp,
}: Props) {
    const faultActiveCtx = useFaultMode();
    const faultActive = faultActiveProp ?? faultActiveCtx;
    const [lyricsVisible, setLyricsVisible] = useState(false);

    return (
        <View
            style={styles.container}
            testID={
                faultActive
                    ? "defect:M_ACTIONABLE_TEXT_STYLED_STATIC"
                    : undefined
            }
        >
            <Stack.Screen options={{ title: "Now Playing" }} />

            <View style={styles.albumArt}>
                <Text style={styles.albumEmoji}>🎶</Text>
            </View>

            <Text style={styles.trackTitle}>Ocean Breeze</Text>
            <Text style={styles.artistName}>Solar Winds</Text>

            <View style={styles.metaRow}>
                <Text style={styles.duration}>4:12</Text>
                {/* Baseline: "Show lyrics" is styled like a link (accent color,
            underline) so its affordance is visible. Faulty: identical real
            Pressable/onPress, but styled exactly like the plain gray duration
            caption next to it — visually inert, functionally live. */}
                <Pressable
                    onPress={() => setLyricsVisible((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={
                        lyricsVisible ? "Hide lyrics" : "Lyrics"
                    }
                    hitSlop={8}
                >
                    <Text
                        style={
                            faultActive
                                ? styles.lyricsLinkFaulty
                                : styles.lyricsLinkBaseline
                        }
                    >
                        {lyricsVisible ? "Hide lyrics" : "Lyrics"}
                    </Text>
                </Pressable>
            </View>

            {lyricsVisible && (
                <ScrollView
                    style={styles.lyricsBox}
                    contentContainerStyle={styles.lyricsContent}
                >
                    {LYRICS.map((line, i) => (
                        <Text key={i} style={styles.lyricsLine}>
                            {line}
                        </Text>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        padding: 24,
        gap: 16,
    },
    albumArt: {
        width: 180,
        height: 180,
        borderRadius: 16,
        backgroundColor: "#1e1e1e",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        shadowColor: "#000",
        shadowOpacity: 0.6,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },
    albumEmoji: { fontSize: 70 },
    trackTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        textAlign: "center",
    },
    artistName: { fontSize: 14, color: "#aaa", textAlign: "center" },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginTop: 4,
    },
    duration: { fontSize: 12, color: "#666" },
    // Baseline affordance: accent color + underline reads as tappable.
    lyricsLinkBaseline: {
        fontSize: 12,
        color: "#1db954",
        textDecorationLine: "underline",
        fontWeight: "600",
    },
    // Faulty: identical size/weight to the inert duration caption — no visual
    // distinction from static text even though onPress is fully wired.
    lyricsLinkFaulty: {
        fontSize: 12,
        color: "#666",
    },
    lyricsBox: {
        width: "100%",
        maxHeight: 220,
        marginTop: 8,
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
    },
    lyricsContent: { padding: 18, gap: 10 },
    lyricsLine: {
        fontSize: 15,
        color: "#ddd",
        lineHeight: 22,
        textAlign: "center",
    },
});
