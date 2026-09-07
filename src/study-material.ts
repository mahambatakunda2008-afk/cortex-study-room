export type MaterialConcept = {
  name: string;
  evidence: string;
};

export type MaterialExtraction = {
  title: string;
  concepts: MaterialConcept[];
  sections: string[];
};

const headingPattern = /^(?:#{1,3}\s+|(?:chapter|section|topic|unit)\s+\d*\s*[:.-]?\s*)/i;

function clean(line: string): string {
  return line.replace(/^[-*•]\s+/, '').replace(/\s+/g, ' ').trim();
}

/**
 * Lightweight, dependency-free extraction for pasted or locally loaded study material.
 * It deliberately preserves source wording instead of inventing syllabus content.
 */
export function extractStudyMaterial(source: string): MaterialExtraction {
  const lines = source.split(/\r?\n/).map(clean).filter(Boolean);
  const title = lines[0] ?? 'Study material';
  const sections: string[] = [];
  const concepts: MaterialConcept[] = [];
  let current = '';

  for (const line of lines) {
    if (headingPattern.test(line)) {
      const heading = line.replace(headingPattern, '').trim();
      if (heading) {
        current = heading;
        sections.push(heading);
      }
      continue;
    }

    const isCandidate = line.length >= 3 && line.length <= 120 && (
      /\b(define|definition|principle|law|theory|equation|formula|process|concept|method|causes?|effects?|properties|structure|function|algorithm)\b/i.test(line) ||
      /^[A-Z][^.!?]{2,70}$/.test(line)
    );

    if (isCandidate) {
      concepts.push({name: current ? `${current}: ${line}` : line, evidence: line});
    }
  }

  return {
    title,
    sections: [...new Set(sections)],
    concepts: concepts.slice(0, 40),
  };
}

export function materialToPrompt(material: MaterialExtraction): string {
  const concepts = material.concepts.map(c => `- ${c.name}`).join('\n');
  const sections = material.sections.join(', ');
  return [
    `Source title: ${material.title}`,
    sections ? `Sections: ${sections}` : '',
    concepts ? `Source-derived concepts:\n${concepts}` : 'No reliable concept headings were detected.',
    'Use only the supplied source when grounding claims; do not silently invent missing syllabus content.',
  ].filter(Boolean).join('\n\n');
}
