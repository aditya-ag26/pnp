# Paws & Poses

## Goal

Build a premium, modern landing page for Paws & Poses using React Three Fiber.

This is NOT a portfolio website.

It should feel like a premium product website with beautiful 3D interactions.

The website should be heavily inspired by the attached reference screenshots while using the provided custom 3D assets instead of recreating the reference assets.

The overall experience should be elegant, smooth and minimal.

Avoid flashy effects.

The user should feel like they are scrolling through one continuous floating world.

---

# Current Scope

Only build the landing page.

Do NOT build any additional pages.

The landing page includes:

- Hero section
- Puppy Yoga section
- Sip & Paint section
- Owner/About section
- Footer

Navigation links can remain placeholders.

---

# Assets

Project folder:

assets/

textured/
untextured/
final/

Use:

assets/final/full_environment.glb

This GLB contains:

- Hero Island
- Yoga Island
- Paint Island
- Clouds

Use the textured assets.

The images inside the assets folder belong to the owner and should be used in the Owner section.

---

# Design References

The attached screenshots are the primary design reference.

Follow them very closely.

Things to match:

- spacing
- typography
- composition
- pastel color palette
- overall feeling
- amount of white space
- proportions

The original Paws & Poses website is only for branding, logos, content and theme.

The attached screenshots take priority for layout and styling.

---

# Font

Use Jost throughout the website.

---

# Color Palette

Warm cream background.

Soft pastel colors.

Clay aesthetic.

Very low saturation.

Nothing vibrant.

---

# 3D Scene

There should only be ONE Three.js scene.

ONE PerspectiveCamera.

ONE Canvas.

The islands exist together inside one world.

Do not swap scenes.

Do not recreate islands manually.

Load the provided GLB.

---

# Camera

One camera only.

Camera animation is controlled entirely in React.

No Blender animation.

No camera switching.

---

# Scroll Experience

Scrolling should feel premium.

Do NOT simply move the camera.

The transition should combine:

- subtle camera movement
- island rotation
- island translation
- HTML fade transitions
- floating animation

Experiment until it feels natural.

The islands should feel alive.

Avoid dramatic movement.

---

# Hero

The Hero section should closely resemble the provided reference.

Left:

Logo

Headline

Paragraph

CTA

Right:

Hero island.

The island occupies roughly the same visual area as the reference.

---

# Yoga

As the user scrolls:

Hero rotates away.

Yoga rotates in.

Camera subtly follows.

Update the HTML content.

---

# Paint

Same idea.

Smooth transition from Yoga.

---

# Owner Section

Use the owner photographs from the assets folder.

Recreate the layout from the reference.

Maintain the same rounded card style.

---

# Footer

Follow the reference closely.

Large rounded footer.

Brown background.

Newsletter field.

Navigation.

Social icons.

---

# Motion

Use GSAP.

Movement should use easing.

No abrupt transitions.

Everything should feel calm.

---

# Floating Animation

Entire islands should float gently.

Clouds drift slowly.

Nothing exaggerated.

---

# Performance

Target:

60 FPS

Avoid unnecessary renders.

Use demand rendering where appropriate.

Use Suspense.

Lazy load heavy assets.

Optimize shadows.

---

# Responsive

Desktop first.

Tablet.

Mobile.

Maintain composition across breakpoints.

---

# Code Quality

Component based.

Reusable.

Typed.

Clean.

Avoid giant files.

Organize by feature.
