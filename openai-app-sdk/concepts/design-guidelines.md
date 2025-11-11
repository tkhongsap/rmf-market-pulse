---
source_url: https://developers.openai.com/apps-sdk/concepts/design-guidelines
extracted_date: 2025-11-11
section: concepts
title: Design Guidelines
---

# App Design Guidelines

## Overview

Apps are developer-built experiences integrated into ChatGPT that extend functionality through lightweight cards, carousels, fullscreen views, and other display modes. They maintain ChatGPT's clarity, trust, and voice while adding value.

**Resource**: [Figma component library](https://www.figma.com/community/file/1560064615791108827/apps-in-chatgpt-components-templates)

## Best Practices

### Principles

Apps should embody five core attributes:

- **Conversational**: Seamlessly fit into dialogue flow
- **Intelligent**: Understand context and anticipate intent
- **Simple**: Focus on single clear actions with minimal information
- **Responsive**: Feel fast and lightweight
- **Accessible**: Support assistive technologies and diverse users

### Boundaries

"ChatGPT controls system-level elements such as voice, chrome, styles, navigation, and composer. Developers provide value by customizing content, brand presence, and actions inside the system framework."

### Good Use Cases

Apps work best for conversational, time-bound tasks with visual simplicity:
- Booking rides or reservations
- Ordering food
- Checking availability
- Tracking deliveries

Apps should answer affirmatively to these questions:
- Does it fit naturally into conversation?
- Is it time-bound with clear endpoints?
- Is information valuable in the moment?
- Can it be summarized simply in one card?
- Does it differentiate ChatGPT's capabilities?

### Poor Use Cases

Avoid designing tools that:
- Display long-form static content
- Require complex multi-step workflows
- Contain ads or upsells
- Surface sensitive private information in cards
- Duplicate ChatGPT system functions

## Display Modes

### Inline

Appears directly in conversation flow, always before the model response.

**Structure**:
- App name and icon label
- Lightweight embedded content
- Model-generated follow-up response

#### Inline Card

Single-purpose widgets for quick confirmations or small data displays.

**When to use**:
- Single actions (confirm booking)
- Structured data (map, order summary)
- Self-contained widgets (audio player)

**Layout elements**:
- Title (for document-based content)
- Expand button (for fullscreen rich media)
- Show more disclosure (for multiple results)
- Edit controls (for ChatGPT response refinement)
- Maximum two primary actions at bottom

**Rules of thumb**:
- Limit primary actions to two (one primary, one optional)
- No deep navigation or multiple drill-ins
- Prevent internal scrolling; auto-fit content
- Avoid replicating ChatGPT features

#### Inline Carousel

Multiple cards presented side-by-side for scanning similar options.

**When to use**:
- Small lists of similar items (restaurants, playlists)
- Items with visual content and metadata

**Layout elements**:
- Image (required for each item)
- Title explaining content
- Metadata (maximum two lines)
- Optional badge for context
- Single CTA per item

**Rules of thumb**:
- Keep 3–8 items per carousel
- Three-line metadata maximum
- Consistent visual hierarchy across cards

### Fullscreen

Immersive experiences for multi-step workflows or deep exploration. The ChatGPT composer remains overlaid.

**When to use**:
- Rich tasks requiring more space (interactive maps, editing canvas)
- Browsing detailed content (real estate listings, menus)

**Layout**:
- System close button
- Content area
- Native ChatGPT composer overlay

**Interaction**:
- Chat sheet maintains conversational context
- Composer input shows streaming indicator ("shimmers")
- Model responses display as ephemeral snippets above composer

**Rules of thumb**:
- Design UX compatible with system composer
- Use fullscreen to deepen engagement, not replicate native apps

### Picture-in-Picture (PiP)

Persistent floating window for ongoing or live sessions (games, videos).

**When to use**:
- Activities running parallel with conversation (games, live collaboration)
- Widgets responding to chat input

**Interaction**:
- Stays fixed on scroll
- Remains pinned until dismissed or session ends
- Returns to inline position when complete

**Rules of thumb**:
- Ensure PiP can update from user interactions
- Auto-close when session ends
- Avoid overloading with static content

## Visual Design Guidelines

### Color

"System-defined palettes ensure actions and responses always feel consistent with ChatGPT."

**Rules of thumb**:
- Use system colors for text, icons, dividers
- Brand accents on logos or icons only—don't override backgrounds
- Avoid custom gradients or patterns
- Use brand accent colors on primary buttons inside app modes

### Typography

ChatGPT uses platform-native fonts (SF Pro on iOS, Roboto on Android).

**Rules of thumb**:
- Inherit system font stack
- Use partner styling (bold, italic) only within content areas
- Limit font size variation; prefer body and body-small

### Spacing & Layout

**Rules of thumb**:
- Use system grid spacing for cards and collections
- Maintain consistent padding; avoid edge-to-edge text
- Respect system corner radius specifications
- Maintain visual hierarchy with headline, supporting text, CTA

### Icons & Imagery

**Rules of thumb**:
- Use system icons or custom monochromatic outlined iconography
- Don't include logos in responses—ChatGPT appends them automatically
- Follow enforced aspect ratios to prevent distortion

### Accessibility

"Every partner experience should be usable by the widest possible audience. Accessibility is a requirement, not an option."

**Rules of thumb**:
- Maintain minimum WCAG AA contrast ratios
- Provide alt text for all images
- Support text resizing without breaking layouts

## Tone & Proactivity

### Content Guidelines

- Keep content concise and scannable
- Remain context-driven; respond to user requests
- Avoid spam, jargon, or promotional language
- Focus on helpfulness and clarity over brand personality

### Proactivity Rules

**Allowed**: Contextual nudges tied to user intent (order pickup notifications, ride arrival alerts)

**Not allowed**: Unsolicited promotions, upsells, or re-engagement attempts without clear context

### Transparency

"Always show why and when your tool is resurfacing. Provide enough context so users understand the purpose of the nudge."

Proactivity should feel like conversation continuation, not interruption.
