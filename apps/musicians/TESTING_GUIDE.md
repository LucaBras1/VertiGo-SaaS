# Testing Guide: Drag & Drop Setlist Ordering

## How to Test the Implementation

### 1. Start the Development Server

```bash
cd apps/musicians
pnpm dev
```

The app will be available at http://localhost:3007

### 2. Test New Setlist Creation

1. Navigate to **Dashboard > Setlisty**
2. Click **Nový setlist** button
3. Fill in the setlist name (e.g., "Test Setlist")
4. Add songs from the repertoire panel on the right
5. **Test drag & drop:**
   - Click and hold the grip icon (⋮⋮) on any song
   - Drag the song up or down
   - Notice the visual feedback (shadow, border, slight rotation)
   - Drop the song in a new position
   - Verify position numbers update automatically
6. **Test remove:**
   - Click the X button on any song
   - Verify it's removed from the list
7. Submit the form and verify the order is saved

### 3. Test Edit Setlist

1. Navigate to an existing setlist
2. Click **Upravit** button
3. **Test drag & drop:**
   - Reorder songs using drag & drop
   - Verify visual feedback during drag
   - Verify position numbers update
4. Add new songs from the repertoire
5. Remove songs using the X button
6. Save changes and verify order persists

### 4. Visual Feedback Checklist

During drag, verify:
- [ ] Song card scales up slightly (105%)
- [ ] Card has a slight rotation (1deg)
- [ ] Primary color border appears
- [ ] Shadow becomes more prominent
- [ ] Background changes to white
- [ ] Cursor changes to "grabbing"

### 5. Accessibility Testing

- [ ] Tab to navigate between elements
- [ ] Grip icon has proper aria-label
- [ ] Remove button has proper aria-label with song name
- [ ] Screen reader announces song position

### 6. Responsive Testing

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)

### 7. Touch Device Testing

On mobile/tablet:
- [ ] Touch and hold to drag
- [ ] Smooth drag experience
- [ ] Drop works correctly
- [ ] Visual feedback on touch

### 8. Edge Cases

- [ ] Empty state displays correctly (no songs)
- [ ] Single song (no drag needed)
- [ ] Many songs (scrolling + drag)
- [ ] Drag to first position
- [ ] Drag to last position
- [ ] Drag and cancel (drop outside)

### 9. Performance

- [ ] Drag is smooth without lag
- [ ] No console errors
- [ ] No console warnings
- [ ] Position numbers update instantly
- [ ] Form submission is fast

### 10. Database Verification

After creating/editing a setlist:
1. Open Prisma Studio: `pnpm prisma:studio`
2. Check the `SetlistSong` table
3. Verify the `order` field reflects the correct positions

## Expected Behavior

### New Setlist Page
- Songs can be reordered before submission
- Order is preserved when form is submitted
- Each song has `order: index` in the payload

### Edit Setlist Page
- Songs load in correct order from database
- Reordering updates the state
- Order is preserved when saved
- API receives updated order values

## Troubleshooting

### Drag doesn't work
- Check browser console for errors
- Verify @hello-pangea/dnd is installed
- Try clearing browser cache

### Position numbers don't update
- Check that `onReorder` callback is firing
- Verify state is updating in React DevTools

### Order doesn't persist
- Check network tab for API request payload
- Verify `order` field is being sent
- Check backend API handling

### Visual feedback not showing
- Check CSS classes are applied
- Verify Tailwind is compiling correctly
- Check for CSS conflicts

## Demo Scenario

1. Create a new setlist called "Wedding Reception"
2. Add these songs:
   - "Shallow" by Lady Gaga
   - "Perfect" by Ed Sheeran
   - "Thinking Out Loud" by Ed Sheeran
   - "A Thousand Years" by Christina Perri
3. Drag "Perfect" to the top position
4. Drag "A Thousand Years" between "Shallow" and "Thinking Out Loud"
5. Final order should be:
   1. Perfect
   2. Shallow
   3. A Thousand Years
   4. Thinking Out Loud
6. Save and verify order persists

## Screenshots to Capture

1. Before drag (default state)
2. During drag (visual feedback)
3. After reorder (new positions)
4. Empty state
5. Mobile view
