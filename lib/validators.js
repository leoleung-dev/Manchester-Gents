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
  firstName: z.string().min(1, 'Please provide your first name.'),
  lastName: z.string().min(1, 'Please provide your last name.'),
  preferredName: optionalString(z.string().min(1, 'Preferred name must have at least one character.')),
  shareFirstName: z.boolean(),
  phoneNumber: optionalString(z.string().min(7, 'Please provide at least 7 digits.')),
  profilePhotoUrl: optionalString(z.string()),
  profilePhotoOriginalUrl: optionalString(z.string()),
  termsConsentCulture: z.literal(true, consentError),
  termsSafeSpace: z.literal(true, consentError),
  termsNoHate: z.literal(true, consentError),
  termsPrivacy: z.literal(true, consentError),
  termsGuidelines: z.literal(true, consentError),
  generalPhotoConsent: z.boolean(),
  groupFaceConsent: z.boolean(),
  otherFaceConsent: z.boolean(),
  taggingConsent: z.boolean()
}).superRefine((data, ctx) => {
  if (data.shareFirstName === false && !data.preferredName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide a preferred name if you do not want your first name displayed.',
      path: ['preferredName']
    });
  }
});

export const eventSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/i),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  groupChatLink: optionalString(
    z
      .string()
      .url('Group chat link must be a valid URL starting with http or https.')
  ),
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
  firstName: z.string().min(1, 'Please provide your first name.'),
  lastName: z.string().min(1, 'Please provide your last name.'),
  preferredName: optionalString(z.string().min(1, 'Preferred name must have at least one character.')),
  shareFirstName: z.boolean(),
  phoneNumber: optionalString(z.string().min(7, 'Please provide at least 7 digits.')),
  profilePhotoUrl: optionalString(z.string()),
  profilePhotoOriginalUrl: optionalString(z.string()),
  termsConsentCulture: z.literal(true, consentError),
  termsSafeSpace: z.literal(true, consentError),
  termsNoHate: z.literal(true, consentError),
  termsPrivacy: z.literal(true, consentError),
  termsGuidelines: z.literal(true, consentError),
  generalPhotoConsent: z.boolean(),
  groupFaceConsent: z.boolean(),
  otherFaceConsent: z.boolean(),
  taggingConsent: z.boolean()
}).superRefine((data, ctx) => {
  if (data.shareFirstName === false && !data.preferredName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide a preferred name if you do not want your first name displayed.',
      path: ['preferredName']
    });
  }
});
