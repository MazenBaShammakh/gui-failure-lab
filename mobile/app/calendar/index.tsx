import type { Href } from "expo-router";
import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface AgendaItem {
    id: string;
    day: string;
    date: string;
    title: string;
    time: string;
    color: string;
}

const AGENDA: AgendaItem[] = [
    {
        id: "a1",
        day: "MON",
        date: "23",
        title: "Design review",
        time: "9:30 AM",
        color: "#1a73e8",
    },
    {
        id: "a2",
        day: "MON",
        date: "23",
        title: "Lunch with Priya",
        time: "12:30 PM",
        color: "#2e7d32",
    },
    {
        id: "a3",
        day: "TUE",
        date: "24",
        title: "Dentist appointment",
        time: "8:00 AM",
        color: "#e53935",
    },
    // { id: 'a4', day: 'WED', date: '25', title: 'Sprint planning', time: '2:00 PM', color: '#6a1b9a' },
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
// June 2026: the 1st falls on a Monday.
const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const LEADING_BLANKS = 1; // offset so day 1 lands under Monday
const TODAY = 24;

export default function CalendarHubScreen() {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <Stack.Screen options={{ title: "Calendar" }} />

            <Text style={styles.monthTitle}>June 2026</Text>

            <View style={styles.weekHeader}>
                {WEEKDAYS.map((d, i) => (
                    <Text key={i} style={styles.weekHeaderCell}>
                        {d}
                    </Text>
                ))}
            </View>

            <View style={styles.grid}>
                {Array.from({ length: LEADING_BLANKS }).map((_, i) => (
                    <View key={`blank-${i}`} style={styles.dayCell} />
                ))}
                {MONTH_DAYS.map((day) => (
                    <View key={day} style={styles.dayCell}>
                        <View
                            style={[
                                styles.dayInner,
                                day === TODAY && styles.dayToday,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    day === TODAY && styles.dayTextToday,
                                ]}
                            >
                                {day}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Agenda</Text>
            {AGENDA.map((item) => (
                <View key={item.id} style={styles.agendaRow}>
                    <View style={styles.agendaDate}>
                        <Text style={styles.agendaDay}>{item.day}</Text>
                        <Text style={styles.agendaDateNum}>{item.date}</Text>
                    </View>
                    <View
                        style={[
                            styles.agendaBar,
                            { backgroundColor: item.color },
                        ]}
                    />
                    <View style={styles.agendaInfo}>
                        <Text style={styles.agendaTitle}>{item.title}</Text>
                        <Text style={styles.agendaTime}>{item.time}</Text>
                    </View>
                </View>
            ))}

            <Link href={"/calendar/new" as Href} asChild>
                <Pressable
                    style={styles.newButton}
                    accessibilityRole="button"
                    accessibilityLabel="New event"
                >
                    <Text style={styles.newButtonText}>+ New event</Text>
                </Pressable>
            </Link>

            <View style={styles.secondaryLinks}>
                <Link href={"/calendar/location" as Href} asChild>
                    <Pressable
                        style={styles.secondaryLink}
                        accessibilityRole="link"
                        accessibilityLabel="Open Location"
                    >
                        <Text style={styles.secondaryLinkText}>Location</Text>
                    </Pressable>
                </Link>
                <Link href={"/calendar/recurring" as Href} asChild>
                    <Pressable
                        style={styles.secondaryLink}
                        accessibilityRole="link"
                        accessibilityLabel="Open Recurring Event"
                    >
                        <Text style={styles.secondaryLinkText}>
                            Recurring Event
                        </Text>
                    </Pressable>
                </Link>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { padding: 20, paddingBottom: 48 },
    monthTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#111",
        marginBottom: 16,
    },

    weekHeader: { flexDirection: "row", marginBottom: 6 },
    weekHeaderCell: {
        flex: 1,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "700",
        color: "#999",
    },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    dayCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
    dayInner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 999,
    },
    dayToday: { backgroundColor: "#e53935" },
    dayText: { fontSize: 14, color: "#333" },
    dayTextToday: { color: "#fff", fontWeight: "800" },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: 24,
        marginBottom: 10,
    },
    agendaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
    },
    agendaDate: { width: 40, alignItems: "center" },
    agendaDay: { fontSize: 11, fontWeight: "700", color: "#999" },
    agendaDateNum: { fontSize: 18, fontWeight: "800", color: "#222" },
    agendaBar: { width: 4, height: 36, borderRadius: 2 },
    agendaInfo: { flex: 1, gap: 2 },
    agendaTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
    agendaTime: { fontSize: 13, color: "#999" },

    newButton: {
        marginTop: 28,
        backgroundColor: "#e53935",
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: "center",
    },
    newButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
    secondaryLinks: { flexDirection: "row", gap: 12, marginTop: 12 },
    secondaryLink: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#1a73e8",
        borderRadius: 24,
        paddingVertical: 13,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    secondaryLinkText: { color: "#1a73e8", fontSize: 15, fontWeight: "700" },
});
