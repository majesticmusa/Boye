import { z } from 'zod';

export const subjects = ['Mathematics', 'English', 'Biology'] as const;
export const demoRequest = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('tutor'),
    subject: z.enum(subjects),
    question: z.string().trim().min(1).max(400),
  }).strict(),
  z.object({ action: z.enum(['visit', 'booking']) }).strict(),
  z.object({
    action: z.literal('feedback'),
    school: z.string().trim().min(2).max(120),
    representative: z.string().trim().min(2).max(100),
    email: z.string().trim().max(254).email(),
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,25}$/).or(z.literal('')),
    feedback: z.string().trim().min(5).max(1200),
    consent: z.literal(true),
    followUp: z.boolean(),
    website: z.literal(''),
  }).strict(),
]);

export type DemoSubject = (typeof subjects)[number];

export const demoLessons = {
  Mathematics: {
    slug: 'mathematics',
    description: 'Try a sample SS1 lesson.',
    question: 'How do I solve 2x + 5 = 17?',
    answer: 'Subtract 5 from both sides to keep the equation balanced. That gives $2x = 12$. Divide both sides by 2, so $x = 6$. Check it: $2(6) + 5 = 17$. Now try $3x + 4 = 19$.',
  },
  English: {
    slug: 'english',
    description: 'Explore grammar and comprehension.',
    question: 'How can I identify the main idea in a paragraph?',
    answer: 'First ask what the paragraph is about. Then ask what the writer wants you to know about that topic. In “Ada waters her tomato plants daily and checks their leaves for pests,” the topic is Ada’s tomato plants. The main idea is that Ada cares for her tomato plants regularly. Watering and checking the leaves are supporting details.',
  },
  Biology: {
    slug: 'biology',
    description: 'Explore science explanations.',
    question: 'How does photosynthesis help a plant grow?',
    answer: 'A plant uses light energy, water and carbon dioxide to make glucose. It can use glucose for energy and to make materials for new cells. Oxygen is released in the process. Why might a plant grow more slowly if it gets very little light?',
  },
} satisfies Record<DemoSubject, { slug: string; description: string; question: string; answer: string }>;

export const bookingUrl = 'https://www.boyedigital.com.ng/service-booking';
