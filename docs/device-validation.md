# Real-device accessibility validation

Status: protocol prepared; actual iPad/VoiceOver results not yet supplied.
Automated axe, keyboard, WebKit and native Safari tests remain separate evidence.
No real quote or email is required for this protocol.

Record the release SHA from `/api/release`, device, OS/browser version, date,
text-size/display settings and tester before starting. Repeat in light and dark.

1. With VoiceOver, traverse the homepage headings, landmarks, navigation, service
   area/contact section and footer. Confirm meaningful names, sensible order and
   decorative imagery skipped. Activate the skip link and verify main is reached.
2. Visit About, Services, Pricing, Quote, Review and Privacy using touch and an
   attached keyboard. Verify Tab/Shift+Tab, visible focus, Enter activation and
   no keyboard trap. Check navigation after back/forward cache restoration.
3. On Quote, read every field label, required state and grouped option. Leave the
   hidden spam trap untouched. Submit an empty form only: confirm native required
   errors are announced and the relevant control is reachable. Do not submit a
   populated real form to test this protocol. Success/retry paths are mocked in CI.
4. Increase text size and zoom to 200%, then test a 320 CSS-pixel equivalent width
   for reflow. Check clipped labels, horizontal page scrolling, fixed elements
   obscuring focus, contact email wrapping and scrollable header reachability.
5. Enable Reduce Motion, change theme while on a page, rotate portrait/landscape,
   and verify menus, links, focus and readable contrast remain usable.
6. Record failures with route, exact steps and screenshot where helpful. Never
   record customer data. Record pass/fail/not-tested for each step; not-tested is
   not a pass. Attach evidence to the current roadmap before closing CBC-06.
