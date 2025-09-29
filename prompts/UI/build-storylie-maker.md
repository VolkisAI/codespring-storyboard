create these UI for me:
follow this PRD:
### 📁 `/components/storyline/*` — Product-Requirements Document

*All four step-panes live on **`/storyline/page.tsx`** and render one-at-a-time inside a full-bleed container.  We keep every pane in the DOM (for Framer-Motion exit / enter animation) but show only the active one.*

---

## 🎨 Design-tokens

| Token        | Hex                                             | Use                                                     |
| ------------ | ----------------------------------------------- | ------------------------------------------------------- |
| **White**    | `#FFFFFF`                                       | Primary surface & text on dark bg                       |
| **Charcoal** | `#1E2424` (≈ the dark swatch in your wireframe) | Cards, page background, text on light bg                |
| **Green**    | `#C5F547` (≈ the striped lime)                  | Accent only – CTA buttons, selection rings, hover glows |

*Typography* – ShadCN default `font-sans` (Inter),  `text-base` regular, `text-sm` captions, `text-xl/2xl` headlines.
*Radii* – `rounded-2xl` for main cards (matches the 24 px corner you drew).
*Spacing* – `px-6 py-8` outer padding per pane, internal gaps `gap-6`, thumbnail grid `gap-4`.
*Motion* – **0.4 s** cubic `ease-[cubic-bezier(.16,1,.3,1)]` slide-in/out with Framer’s `<Slide>`; subtle `scale-.98` on press.

---

## 1 · `UploadPane.tsx`

| Area               | Layout spec                                                                                                                                                       | Notes                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Drop-zone card** | `w-full max-w-[540px] h-[300px] bg-charcoal/5 border-2 border-dashed border-charcoal/20 rounded-2xl flex flex-col items-center justify-center`                    | Shows an **UploadCloud** icon (`size=40`, `stroke-charcoal/60`) + “Drop MP4 or click”.  On dragOver border turns **green**. |
| **Style picker**   | `mt-8 flex flex-row gap-4`                                                                                                                                        | A ShadCN `<Select>` with three items (Realistic / Anime / Sketch).  Selected item has `ring-2 ring-green`.                  |
| **Next CTA**       | Primary ShadCN `<Button>` fixed bottom-center on small screens (`class="fixed bottom-6 inset-x-0 mx-auto w-11/12 sm:static"`).  Background **green**, black text. |                                                                                                                             |

**UX Flow**

1. Selecting a file fades in a slim progress bar (`h-1 bg-green`) that animates to 100 %.
2. When the server returns the transcript id, Framer slides this pane left (`x:-100%`) while sliding in **TranscriptPane** (`x:0`).

---

## 2 · `TranscriptPane.tsx`

```
┌────────────────────────────────┐
│ flex            gap-8          │
│ ┌──────────────┐ ┌───────────┐ │
│ │Left column    │ │Right col  │ │
│ └──────────────┘ └───────────┘ │
└────────────────────────────────┘
```

| Column           | Component tree                                       | Key details                                                                                                                                                  |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Left (60 %)**  | `<ScrollArea>` → map `segments` → **TranscriptCard** | `TranscriptCard`: charcoal text on white, `px-4 py-3 rounded-xl mb-3 border border-charcoal/10`.  Checkbox at left; hover border-green.                      |
| **Right (40 %)** | map `segments` (same order) → **PromptField**        | `PromptField`: ShadCN `<Textarea>` (`rows=2 md:rows=3`) inside a `border rounded-xl hover:border-green`, plus a tiny style-override `<Select>` to its right. |

Bottom sticky bar (`class="sticky bottom-0 bg-white border-t py-4 flex justify-end"`) houses **Generate Images** button (green). The button is disabled (`opacity-50`) until ≥1 segment is checked.

**Interaction**

* Click a TranscriptCard → it scroll-jumps the matching PromptField into center and flashes `ring-green`.
* Press **Generate** → Pane keeps mounted but opacity drops to 40 %, each PromptField shows an inline spinner.  As soon as the first image arrives, **ImagePane** slides in from the bottom.

---

## 3 · `ImagePane.tsx`

**Top half** – Masonry grid of finished images (`grid-cols-3 sm:grid-cols-4`, `gap-4`). **ImageCard**

| ImageCard        | Spec                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container        | `relative group rounded-2xl overflow-hidden shadow-sm`                                                                                                                              |
| Img              | `object-cover w-full h-[140px]`                                                                                                                                                     |
| Overlay on hover | `absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity` → **Regenerate** (ghost) & **Select** (green) buttons |

**Bottom film-strip** – **StorylineBar** (fixed to viewport bottom):

```
<ScrollArea horizontal>
  <Thumbnail v-for="segment">
</ScrollArea>
```

Thumbnail spec: `w-20 h-20 rounded-xl border-2 border-transparent hover:border-green transition`.  When “selected”, border turns **green** and scale-105.

**Next CTA** – Right-end of bar shows **Generate Clips** pill button (green). Disabled if nothing selected.

---

## 4 · `VideoPane.tsx`

Grid becomes a three-column layout where each **ClipCard** replaces the static `<img>` with `<video muted loop poster={thumb}>`.

ClipCard overlay on hover adds **Play / Pause** icon (lucide `PlayCircle`).  Clicking a card toggles play; double-click opens a modal **ClipInspector** (larger video + Download / Replace).

StorylineBar now renders the same thumbnails but swaps `<img>` for `<video muted loop>` and surfaces job status chips (queued / processing / done).

---

## Shared helpers

| File                    | Responsibility                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **`Stepper.tsx`**       | Holds `activeStep` state & exposes `goNext`, `goBack`.  Wraps panes with `<AnimatePresence>` to orchestrate slide-left / slide-right. |
| **`PrimaryButton.tsx`** | ShadCN `<Button>` variant with `bg-green text-charcoal hover:shadow-[0_0_0_3px_rgba(197,245,71,0.4)]`.                                |
| **`LoadingBar.tsx`**    | Indeterminate bar (`class="absolute bottom-0 left-0 h-1 bg-green animate-[indeterminate_2s_linear_infinite]"`).                       |
| **`Toast.tsx`**         | Success & error toasts (`bg-charcoal text-white`, accent line `bg-green w-1`).                                                        |

---

## Click-through summary

1. **UploadPane** → user drops video → bar fills → **Stepper.goNext()**.
2. **TranscriptPane** fades in; user checks segments & writes prompts → **Generate Images**.

   * Pane stays but dims; on first image complete: **Stepper.goNext()**.
3. **ImagePane** lists images; user selects desired stills → **Generate Clips**.

   * Film-strip shows live status chips; on first clip ready: **Stepper.goNext()**.
4. **VideoPane** streams clips; user can play, download, or replace.  Once all clips status = done, a floating **Compile Story** button animates in (pulse-green shadow).

Every transition is accompanied by a Framer `motion.div` with `initial={{opacity:0, x:60}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-60}}`.

---

#### Folder scaffold

```
components/
└─ storyline/
   ├─ UploadPane.tsx
   ├─ TranscriptPane.tsx
   ├─ ImagePane.tsx
   ├─ VideoPane.tsx
   ├─ StorylineBar.tsx
   ├─ Stepper.tsx
   ├─ TranscriptCard.tsx
   ├─ PromptField.tsx
   ├─ ImageCard.tsx
   ├─ ClipCard.tsx
   ├─ LoadingBar.tsx
   ├─ PrimaryButton.tsx
   └─ Toast.tsx
```

Follow this PRD and you’ll have a coherent, on-brand, white-charcoal-green UI that mirrors your wireframes and guides the user smoothly from upload to final clips.


We will use ShadCN UI and framer motion

And make sure to also make the colours and UI follow closely to the wireframes and images ive given you.. The colours should . make sure to be detailed about UI and UX, spacing, margins, sizes, colours etc  - refering to the layout of each of these sections in the images 1,2,3,4

I want the colours to be WHITE, CHARCOAL and GREEN, you can see the colours in the input, make sure to include these colours in the prompt, green will be used a lot less for highlights, selections, buttons and hover glows etc.



Create me these files and design the UI for me, make sure it all works