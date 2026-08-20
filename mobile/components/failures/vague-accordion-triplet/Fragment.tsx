import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useFaultMode } from '@/lib/fault-mode';

interface Props {
  faultActive?: boolean;
}

interface Section {
  id: string;
  /** Faulty: all three collapse onto the same uninformative word. */
  faultyTitle: string;
  /** Baseline: says what is inside. */
  baselineTitle: string;
  body: string[];
}

const SECTIONS: Section[] = [
  {
    id: 'benefits',
    faultyTitle: 'More',
    baselineTitle: 'Benefits & perks',
    body: ['28 days holiday', 'Learning budget €1,500/yr', 'Hybrid — 2 days on site'],
  },
  {
    id: 'process',
    faultyTitle: 'More',
    baselineTitle: 'Interview process',
    body: ['Intro call (30m)', 'Portfolio review (60m)', 'Team interview (90m)'],
  },
  {
    // The one the task needs.
    id: 'contact',
    faultyTitle: 'More',
    baselineTitle: 'Ask the hiring manager a question',
    body: [],
  },
];

/**
 * X19 · M_VAGUE_ACCORDION_TRIPLET — F-NAV-01 Important Links Hidden in Subtle
 * Menu. Third observation of the type; hosted on Position detail
 * (M_NONCLICKABLE_APPLY).
 *
 * Mechanism — AMBIGUITY ACROSS SIBLINGS. The three observations isolate three
 * different reasons an important link goes undiscovered:
 *   · M_HIDDEN_NAV_SUBTLE_MENU (F5.1, /banking/support): DEPTH. Two levels down,
 *     but each step is descriptively named, so the path is predictable once found.
 *   · X18 (/mail/labels): EMPTINESS. One level down, but the entry point is an
 *     unlabelled glyph that predicts nothing.
 *   · X19 (here): AMBIGUITY. Three sibling accordions, all titled "More", only one
 *     of which holds the action. Each is individually plausible, none is
 *     distinguishable, and the agent must open them in turn to find out — a linear
 *     search it has no reason to expect and no cue to terminate.
 *
 * Both channels see three identical containers. The failure is not that the link
 * is invisible but that finding it requires exhaustive expansion, which an agent
 * working to a step budget will usually abandon before reaching the third.
 *
 *   Baseline: each section is titled for its contents, so the target is a direct
 *             read.
 *   Faulty:   all three read "More".
 *
 *   Fails:    vision-only AND text-only.
 *
 * Isolation: appended below the job description. The host's defect is the
 * non-clickable "Apply now" button at the bottom of the card; this task asks a
 * question instead of applying and never presses it.
 */
export default function VagueAccordionTripletFragment({ faultActive: faultActiveProp }: Props) {
  const faultActiveCtx = useFaultMode();
  const faultActive = faultActiveProp ?? faultActiveCtx;

  const [openId, setOpenId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <View style={styles.wrap} testID={faultActive ? 'defect:M_VAGUE_ACCORDION_TRIPLET' : undefined}>
      {SECTIONS.map((section) => {
        const isOpen = openId === section.id;
        const title = faultActive ? section.faultyTitle : section.baselineTitle;
        return (
          <View key={section.id} style={styles.section}>
            <Pressable
              onPress={() => setOpenId(isOpen ? null : section.id)}
              accessibilityRole="button"
              accessibilityLabel={title}
              accessibilityState={{ expanded: isOpen }}
              style={styles.sectionHeader}
            >
              <Text style={styles.sectionTitle}>{title}</Text>
              <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
            </Pressable>

            {isOpen && (
              <View style={styles.sectionBody}>
                {section.body.map((line) => (
                  <Text key={line} style={styles.bodyLine}>
                    • {line}
                  </Text>
                ))}

                {section.id === 'contact' &&
                  (sent ? (
                    <Text style={styles.sentNote} accessibilityLiveRegion="polite">
                      ✓ Your question was sent to the hiring manager.
                    </Text>
                  ) : (
                    <>
                      <TextInput
                        style={styles.input}
                        value={question}
                        onChangeText={setQuestion}
                        placeholder="Your question…"
                        placeholderTextColor="#9e9e9e"
                        accessibilityLabel="Your question for the hiring manager"
                        multiline
                      />
                      <Pressable
                        style={styles.sendBtn}
                        onPress={() => question.trim() && setSent(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Send question to hiring manager"
                      >
                        <Text style={styles.sendBtnText}>Send question</Text>
                      </Pressable>
                    </>
                  ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, gap: 8 },
  section: {
    backgroundColor: '#f7f8fa',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#37474f' },
  chevron: { fontSize: 14, color: '#90a4ae' },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 6 },
  bodyLine: { fontSize: 13, color: '#546e7a', lineHeight: 20 },
  input: {
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#dcdce0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: '#111',
    minHeight: 60,
    marginTop: 2,
  },
  sendBtn: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  sentNote: { fontSize: 13, color: '#2e7d32', fontWeight: '700' },
});
