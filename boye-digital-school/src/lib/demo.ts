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

export const bookingUrl = 'https://www.boyedigital.com.ng/service-booking';
