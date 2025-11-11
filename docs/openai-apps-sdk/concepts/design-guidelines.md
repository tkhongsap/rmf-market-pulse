# App Design Guidelines for ChatGPT Apps SDK

**Source:** https://developers.openai.com/apps-sdk/concepts/design-guidelines

## Overview
Apps are developer-created experiences integrated into ChatGPT that extend functionality through lightweight cards, carousels, and fullscreen views while maintaining conversational flow and system consistency.

## Core Principles

The framework emphasizes five key design principles:

1. **Conversational**: Experiences should integrate seamlessly into ChatGPT's natural dialogue
2. **Intelligent**: Tools must understand conversation context and anticipate user needs
3. **Simple**: Each interaction focuses on a single clear action with minimal information
4. **Responsive**: Fast, lightweight tools that enhance rather than overwhelm conversation
5. **Accessible**: Support for diverse users, including those using assistive technologies

## Use Case Evaluation

### Good Fit
Apps work best for time-bound, action-oriented tasks that fit naturally in conversation. Examples include:
- Booking and reservations
- Food ordering
- Availability checking
- Delivery tracking
- Quick information lookups

These tasks benefit from visual summarization with clear calls-to-action.

### Poor Fit
Avoid designing apps for:
- Long-form static content better suited to websites
- Complex multi-step workflows exceeding display constraints
- Advertisements or unsolicited promotions
- Sensitive information exposed to nearby viewers
- Duplication of ChatGPT's native functions

## Display Modes

### Inline
The default surface appearing directly in conversation flow before model responses. Includes:
- **Icon & label**: App identification
- **Content area**: Lightweight widget with app data
- **Follow-up**: Brief model-generated suggestions for next steps

**Inline cards** work for single actions or small structured datasets. Limited to two primary actions maximum, with no nested scrolling or internal navigation.

**Inline carousels** present 3–8 similar items side-by-side with images, titles, and metadata (three lines maximum). Each item supports one optional call-to-action.

### Fullscreen
Immersive experiences for rich tasks requiring deeper exploration, such as interactive maps or detailed content browsing. The ChatGPT composer remains overlay-visible, enabling conversational continuation within the expanded view.

Key interaction pattern: chat sheet maintains conversation context alongside the fullscreen surface, with response snippets appearing above the composer.

### Picture-in-Picture (PiP)
Persistent floating windows for parallel activities like games, quizzes, live collaboration, or video sessions. PiP remains visible during conversation and updates dynamically based on user prompts. Automatically dismisses when sessions end.

## Visual Design Guidelines

### Color
System-defined palettes maintain consistency. Partners may use brand accent colors on primary buttons and badges but should not override system colors for text, backgrounds, or structural elements.

### Typography
Apps inherit platform-native system fonts (SF Pro on iOS, Roboto on Android). Avoid custom typefaces; use partner styling only within content areas for emphasis.

### Spacing & Layout
Maintain system grid spacing for cards and collections. Ensure consistent padding, preserve system-specified corner radii, and establish clear visual hierarchy between headlines, supporting text, and calls-to-action.

### Icons & Imagery
Employ monochromatic, outlined iconography consistent with ChatGPT's visual language. App logos appear separately via system attribution. All imagery must follow enforced aspect ratios.

### Accessibility
Maintain WCAG AA contrast ratios, provide alt text for images, and support text resizing without layout breaks.

## Tone & Communication

ChatGPT controls overall voice while partners provide contextual content within that framework. Guidelines include:

- Keep content "concise and scannable"
- Maintain context-driven relevance to user requests
- Avoid jargon, spam, or promotional language
- Focus on helpfulness and clarity

### Proactivity Rules
Contextual nudges tied to user intent are acceptable (order status, arrival notifications). Unsolicited promotions or re-engagement attempts without clear context violate guidelines.

All proactive surfacing should explain its purpose and feel like a natural conversation continuation rather than an interruption.
