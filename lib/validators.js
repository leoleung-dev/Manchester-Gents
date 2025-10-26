import { z } from 'zod';

const consentError = { errorMap: () => ({ message: 'All terms must be accepted.' }) };

const optionalString = (schema) =>
  z
    .union([schema, z.literal(''), z.null()])
    .transform((value) => (value ? value : null))
    .optional();

export const registerSchema = z.object({
  email: z.string().email(),
  instagramHandle: z
    .string()
    .min(2)
    .regex(/^[a-z0-9_.]+$/i, 'Instagram username can only include letters, numbers, periods, and underscores.'),
  password: z.string().min(6),
  name: z.string().optional(),
  fullName: z.string().min(1, 'Please provide your full name.'),
  shareFirstName: z.boolean(),
  phoneNumber: optionalString(z.string().min(7, 'Please provide at least 7 digits.')),
  termsConsentCulture: z.literal(true, consentError),
  termsSafeSpace: z.literal(true, consentError),
  termsNoHate: z.literal(true, consentError),
  termsPrivacy: z.literal(true, consentError),
  termsGuidelines: z.literal(true, consentError),
  generalPhotoConsent: z.boolean(),
  groupFaceConsent: z.boolean(),
  otherFaceConsent: z.boolean(),
  taggingConsent: z.boolean()
});

export const eventSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/i),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  signupDeadline: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  published: z.boolean().optional()
});

export const eventSignupSchema = z.object({
  specialRequests: optionalString(
    z.string().max(1000, 'Special requests should be under 1000 characters.')
  ).optional()
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, 'Please provide your full name.'),
  shareFirstName: z.boolean(),
  name: z.string().optional(),
  phoneNumber: optionalString(z.string().min(7, 'Please provide at least 7 digits.')),
  termsConsentCulture: z.literal(true, consentError),
  termsSafeSpace: z.literal(true, consentError),
  termsNoHate: z.literal(true, consentError),
  termsPrivacy: z.literal(true, consentError),
  termsGuidelines: z.literal(true, consentError),
  generalPhotoConsent: z.boolean(),
  groupFaceConsent: z.boolean(),
  otherFaceConsent: z.boolean(),
  taggingConsent: z.boolean()
});
