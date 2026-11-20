# FIRST NOBLE STEP — Student Registration

A responsive student registration form built with React, TypeScript, Vite, and Tailwind CSS. The supplied logo, local fonts, and original alpine print are preserved.

## Features

- Required name, email, WhatsApp number, correspondence address, institution, degree program, and current semester with inline validation.
- WhatsApp numbers saved as entered, without an automatic dialing prefix, and a semester selector limited to 1–8.
- University card and payment proof attachments (JPG, PNG, WebP, or PDF, up to 5 MB each).
- The supplied public/private institution fees, payment notice, and Faysal Bank account details.
- A registration reference, downloadable record, and personal archive with original document downloads and confirmed deletion.
- Keyboard-accessible dialogs, autofill, visible focus states, reduced-motion support, and mobile layouts.

## Storage

Registrations and both original documents are stored together in this browser's IndexedDB database `first-noble-step.registrations.v1`. They are **not emailed or sent to a server**. Saving a record does not verify a payment or trigger a confirmation email. The interface and privacy note explain this behavior. Removing a registration deletes its attachments; clearing site data clears the archive. No API keys or external services are needed.

## Development

```sh
npm install
npm run dev
```

## Production checks

```sh
npm run lint
npm run build
```

The production site is generated in `dist/`.
