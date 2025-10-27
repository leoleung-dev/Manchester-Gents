# UI & UX Walkthrough

## Global Elements
- **Navigation (`components/NavBar.js`):** Uses the horizontal Manchester Gents logo SVG (includes lettering) as the home link; links to Home, Events, Dashboard, Profile, Admin (if role=ADMIN). Logged-in members see their display name (respecting preferred-name privacy) on the Profile CTA.
- **Footer (`components/Footer.js`):** Contact links, Instagram, privacy policy, copyright.
- **Brand Styling:** Headings use custom Thelorin font (loaded via `next/font/local` from `public/fonts/Thelorin.otf`) with contextual ligatures enabled so script connections remain intact; body text uses Inter (`next/font/google`). Palette defined in CSS variables (`app/globals.css`).

## Pages

### Home (`app/page.js`)
- **Hero banner:** Next event countdown (`HeroBanner + CountdownTimer`). If no upcoming events, displays CTA to register.
- **Upcoming experiences:** List of upcoming events via `EventCard`.
- **Community section:** Three value props with stylised copy.

### Events Index (`app/events/page.js`)
- Grid of published events (`EventCard`).
- Empty state glass panel if no events.

### Event Detail (`app/events/[slug]/page.js`)
- Event metadata and description.
- Palette preview cards using event colour scheme.
- Guest list preview (first 10 attendees).
- RSVP CTA:
  - If not signed in → prompts login.
  - If already registered → shows confirmation + cancel button.
  - If not registered → “Reserve my spot” button with optional “Add special request”.
  - Locked when signup deadline has passed.

### Dashboard (`app/dashboard/page.js`)
- Greeting with Instagram handle.
- Link to profile for managing consents.
- Sections:
  - “Your reservations” (current RSVPs).
  - “Recently announced” (events without a signup from the member).
- Uses `EventCard` for consistency.

### Profile (`app/profile/page.js`)
- `ProfileOverview` shows member snapshot cards (contact, name privacy, consent statuses, latest suited photo) so the page feels like a personal dashboard.
- “Edit profile & consents” CTA reveals `ProfileForm`, which still contains:
  1. **Personal details:** First/last name, optional preferred name (required when hiding first name), share-first-name toggle, phone, and private suited photo upload with an in-app circle cropper.
  2. **Terms & guidelines:** Interactive cards for each consent item (overview reduces this to a single “Agreed” status badge when everything is confirmed).
  3. **Photo preferences:** Yes/No pills for all media questions.
- Saving posts to `/api/profile`, refreshes the page, and collapses back to the overview with the updated timestamp from `consentUpdatedAt`.

### Authentication
- **Login (`app/login/page.js`):** Form for email/Instagram + password; card layout with CTA to register.
- **Register (`app/register/page.js`):** Extended form capturing first/last name, optional preferred name, private suited photo upload (with circular cropper), plus consent toggles. Mirrors profile form components for consistency.

### Admin (`app/admin/page.js`)
- Event creation form (title, slug, schedule, palette).
- Listing of existing events with collapsible forms to edit palettes/details.
- Quick link to the member directory for reviewing attendees.
- Only accessible to admin-role users (checked via NextAuth session).

### Member directory (`app/admin/members/page.js`)
- Table of all registered gents with private reference photo preview, contact details, and consent summary.
- Designed for admin review; photos remain private even though URLs are Cloudinary-hosted.

## Components of Interest
- **`EventSignupButton`:** Client component managing reservation state, special requests, cancellation confirmations, and error messaging.
- **`AuthForm`:** Two exports (RegisterForm, LoginForm) using shared `FormField`.
- **`ProfileOverview`:** Read-first experience summarising member data/consents and toggling the editor.
- **`ProfileForm`:** Mirrors registration layout but focuses on editing name privacy, private reference photo, and consent data.
- **`AdminEventForm`:** Uses color inputs, datetime selectors, handles creation and updates via fetch.

## UX Notes
- Glassmorphism aesthetic for panels to align with brand mood.
- Uppercase headings with tracking to reinforce premium feel.
- Buttons use gradients for primary actions and translucent backgrounds for secondary/danger states.
- States:
  - Disabled buttons utilise reduced opacity and `cursor: not-allowed`.
  - Error messages in red (`#ff9f9f`), success messages in mint (`#9affc7`).
- Mobile considerations:
  - Nav collapses stack.
  - Grid components use auto-fit patterns to adjust columns.
  - Admin/dashboard forms remain vertically stacked.

## Accessibility Considerations
- Buttons are actual `<button>` elements for keyboard support.
- Input labels wrap elements to ensure clickable associations.
- Modal RSVP overlay traps focus visually; if future changes add more modals, ensure focus management (currently simple due to single form).
- Colour contrast primarily high but review when adjusting palette.

## Future UI Enhancements
- Add toast notifications for profile save success.
- Provide RSVP confirmation emails or ICS files.
- Expand dashboard to show past events and quick links to profile.

## Documentation Guidance
- When altering UI flows (e.g., adding new steps, modals, or links), update this file.
- If PALETTE or component naming changes, reflect adjustments in architecture + data docs.
- Screenshots (once available) can be stored under `public/` and referenced here for visual guidance.***
