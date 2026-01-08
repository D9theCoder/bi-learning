# Rewards Page UI/UX Improvements

Enhance the rewards page with gamified elements including product images, improved modals, confetti effects, and better confirmation dialogs while maintaining the original Indonesian language design.

## User Review Required

> [!IMPORTANT] > **Image Strategy**: The plan uses Lorem Picsum for placeholder images. If you prefer to use actual reward images or a different image service, please let me know.

> [!NOTE] > **Sound Effects**: The plan includes an optional sound effect implementation. Please confirm if you'd like to include sound effects for successful redemptions.

---

## Proposed Changes

### Frontend Components

#### [MODIFY] [reward-card.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/rewards/reward-card.tsx)

**Changes:**

- Add product image display using Lorem Picsum as placeholder
  - Image URL format: `https://picsum.photos/seed/${reward.id}/400/300`
  - Add image container with proper aspect ratio (4:3)
  - Include fallback/loading states
- Replace generic `SuccessModal` with new enhanced `RewardSuccessModal`
- Update confirmation dialog to show:
  - Current balance
  - Item cost
  - Remaining balance after purchase (calculated: `balance - cost`)
- Improve visual hierarchy with better spacing and typography
- Add hover animations using framer-motion for card interactivity

---

#### [NEW] [reward-success-modal.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/rewards/reward-success-modal.tsx)

**Purpose:** A specialized success modal for reward redemptions with gamified elements.

**Features:**

- Fun celebratory illustration/icon (using lucide-react icons like `PartyPopper`, `Sparkles`, `Gift`)
- Display reward details:
  - Reward name and rarity badge
  - Points spent
  - Previous balance → New balance
- Animated entrance using framer-motion
- Trigger confetti effect on mount
- Celebratory color scheme matching reward rarity

---

#### [MODIFY] [index.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/pages/rewards/index.tsx)

**Changes:**

- Pass user's current balance as prop to each `RewardCard` component
- This enables the card to calculate and display remaining balance in the confirmation dialog

---

### Type Definitions

#### [MODIFY] [index.d.ts](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/types/index.d.ts)

**Changes:**

- Add optional `image_url?: string` to the `Reward` interface
- This allows backend to provide custom images in the future while using placeholder images for now

---

### Utilities

#### [NEW] [confetti.ts](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/lib/confetti.ts)

**Purpose:** Centralized confetti utility functions for consistent animations across the app.

**Features:**

- `fireConfetti()`: Main confetti animation function
- `fireRewardConfetti(rarity)`: Rarity-specific confetti colors
  - Common: gray/silver tones
  - Rare: blue tones
  - Epic: purple tones
  - Legendary: gold/yellow tones
- Configurable parameters (particle count, spread, origin position)

---

### Additional Enhancements

#### Card Interactions

- Add hover scale effect (scale to 1.02)
- Add subtle shadow transition on hover
- Smooth transitions using framer-motion

#### Rarity Badge Styling

- Add glow effect matching rarity color
- Subtle animation on hover
- Better contrast for text visibility

#### Mobile Optimizations

- Ensure touch-friendly tap targets (min 44px)
- Optimize image sizes for mobile bandwidth
- Test modal responsiveness on small screens

---

## Verification Plan

### Automated Tests

Currently, this project doesn't have frontend tests. Consider adding tests in the future using Vitest or React Testing Library.

### Browser Testing

**Test the complete redemption flow:**

1. **Start the development server** (if not already running):

   ```bash
   npm run dev
   ```

2. **Navigate to the rewards page**:

   - Open browser to the application URL
   - Log in as a student (students have access to rewards)
   - Navigate to `/rewards` page

3. **Verify product images**:

   - Each reward card should display a placeholder image from Lorem Picsum
   - Images should have consistent aspect ratio (4:3)
   - Images should load properly or show a fallback state

4. **Test redemption flow** (select a reward you have enough points for):

   - Click "Redeem" button on a reward card
   - **Verify Confirmation Dialog** shows:
     - Reward name
     - Cost in points
     - Current balance
     - Remaining balance (current - cost)
   - Click "Confirm Redeem"
   - **Verify Success Modal** displays:
     - Fun celebration icon/illustration
     - Reward details (name, rarity)
     - Points spent
     - Balance transition (before → after)
   - **Verify Confetti Effect** fires when modal appears
   - Confetti colors should match reward rarity

5. **Test responsive design**:

   - Resize browser to mobile width (375px, 768px, 1024px)
   - Verify cards stack properly
   - Verify modals are readable and functional
   - Verify images scale appropriately

6. **Test hover interactions** (desktop only):
   - Hover over reward cards → should see subtle scale and shadow effects
   - Hover over rarity badges → should see glow effect

### Manual Verification Steps

> [!TIP] > **Testing with Insufficient Points**: To test the "Insufficient Points" state, you can temporarily reduce your points balance in the database, or test with a reward that costs more points than you have.

**Checklist:**

- [ ] Product images load correctly for all rewards
- [ ] Confirmation dialog shows correct balance calculations
- [ ] Success modal appears with celebration elements
- [ ] Confetti fires on successful redemption
- [ ] Confetti colors match reward rarity
- [ ] Points balance updates correctly in UI after redemption
- [ ] Hover effects work smoothly on desktop
- [ ] Layout is responsive on mobile devices
- [ ] Modal is accessible (can be closed with Esc key)
- [ ] No console errors in browser dev tools

### Edge Cases to Test

- Redeeming the last item in stock → verify stock updates
- Redeeming when you have exactly enough points
- Attempting to redeem with insufficient points → button should be disabled
- Multiple rapid redemptions (if enabled)
