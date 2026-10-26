# 🏕️ Camping 360° | Wilderness Adventure

> **SE3041: Digital Video Production and Delivery**  
> **Assignment 01 — Diorama Creation & 360° Object Motion Picture Presentation**  
> *BSc (Hons) in Information Technology Specializing in Interactive Media*  
> *Year 3, Semester 2 (2026)*

---

## 📖 Overview

**Camping 360°** is an interactive web showcase presenting the physical diorama build, 360-degree turntable object motion captures, official promotional video, and complete production storyboard for the **Wilderness Adventure** assignment.

### 🌟 Key Features
- **Interactive 360° Studio:** High-frame-rate canvas 2D turntable engine with inertia physics, mouse drag / touch swipe scrubbing, custom lighting shaders (Dark Studio, Cyber Glow, Clean), and interactive hotspots.
- **Official Promo Video:** Full 1080p HD promotional video presentation (`Wildness_Adventures.mp4`, 34 seconds).
- **Wilderness Adventure Storyboard:** High-resolution 9-panel diorama production storyboard sequence detailing camera framing, shot durations, transitions, and VFX compositing specifications.
- **Physical Scale Model Galleries:** Macro reference captures across multiple categories:
  - *Jungle Camping Environment*
  - *Camping Net* (Scale Model Prop)
  - *Lego Style Jeep 4x4*
  - *Red Trail Jeep*
- **Responsive & Dark Botanical UI:** Premium glassmorphism, fluid animations, and mobile/tablet optimization.

---

## 👥 Project Team & Work Distribution

| IT Number | Student Name | Works & Responsibilities |
| :--- | :--- | :--- |
| **IT23764170** | Augustine S.E | Website & jungle camping environment diorama Build |
| **IT23827844** | Fonseka W A T D | Build Objects Jeeps, Camping net, Kayak boat + 360 degree capture |
| **IT23675766** | Loshana.a | Storyboard & Video |

---

## 🎬 Storyboard Sequence (43s Blueprint)

1. **Shot 01 (5s):** River Adventure *(Rear tracking shot | Fade in; cut to 2 | Paddle ripples)*
2. **Shot 02 (4s):** Rocky River Crossing *(Low wheel close-up | Cut to 3 | Water splashes)*
3. **Shot 03 (5s):** Beside the Waterfall *(Three-quarter view; pan | Dissolve to 4 | Fine waterfall mist)*
4. **Shot 04 (3s):** Hidden Stream *(Static close-up | Cut to 5 | Water highlights)*
5. **Shot 05 (4s):** Another Explorer Arrives *(Front tracking shot | Cut to 6 | Light tyre dust)*
6. **Shot 06 (5s):** Tackling the Rough Trail *(Low side view | Cut to 7 | Subtle camera shake)*
7. **Shot 07 (5s):** Meeting by the Stream *(Wide shot | Dissolve to 8 | Soft waterfall spray)*
8. **Shot 08 (5s):** Setting Up Camp *(Eye-level medium shot | Dusk dissolve to 9 | Gradual light change)*
9. **Shot 09 (7s):** Campfire Celebration *(Wide shot; pull back | Fade to black | Fire glow & embers)*

---

## 🚀 How to Run Locally

1. **Clone or Download the repository:**
   ```bash
   git clone https://github.com/Edmund0007/camping-360-diorama.git
   cd camping-360-diorama
   ```

2. **Start the local HTTP streaming server:**
   ```bash
   node server.js
   ```

3. **Open in your browser:**
   ```
   http://localhost:3000/
   ```

---

## 🛠️ Technology Stack
- **Frontend:** Vanilla HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism, CSS Grid & Flexbox)
- **Interactive Engine:** HTML5 Canvas 2D + Exponential Smoothing Lerp Physics
- **Server:** Node.js HTTP Streaming Server with Byte-Range Video Playback (`206 Partial Content`)
- **Typography:** Plus Jakarta Sans, Outfit, Inter (Google Fonts)

---

© 2026 Camping 360° SE3041 Presentation Deck. All rights reserved.
