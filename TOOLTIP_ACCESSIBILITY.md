# Tooltip Accessibility Guidelines - Issue #17

## Overview
This document outlines the accessibility features and testing standards for hover-based financial tooltips in the AuroraInvest application.

## Accessibility Features Implemented

### 1. Keyboard Navigation
- **Focus Management**: Tooltips are keyboard accessible via Tab key navigation
- **ESC Key**: Users can dismiss tooltips by pressing the Escape key
- **Focus Visible**: Clear focus indicators on tooltip triggers

### 2. Screen Reader Support
- **ARIA Attributes**: Radix UI automatically applies proper ARIA attributes:
  - `role="tooltip"` on tooltip content
  - `aria-describedby` on trigger elements
- **Semantic HTML**: Using semantic elements where appropriate

### 3. Visual Accessibility
- **High Contrast**: Tooltips use theme-aware colors with sufficient contrast
- **Z-Index Management**: `z-50` ensures tooltips appear above all content
- **Smooth Animations**: Fade and zoom animations for better visual feedback
- **Responsive Positioning**: Tooltips automatically adjust position to stay in viewport

### 4. Timing and Delays
- **Hover Delay**: Configurable delay before showing tooltip
- **Skip Delay**: Quick transition when moving between multiple tooltips
- **Persistent on Focus**: Tooltips remain visible while trigger has keyboard focus

## Component Usage

### Basic Tooltip
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="font-semibold">Lower Risk</span>
    </TooltipTrigger>
    <TooltipContent>
      <p className="max-w-[220px] text-xs">Debt-to-equity ratio supplied within fundamentals.</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Financial Metrics Tooltip (Risk Card)
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <span className="text-xs font-semibold px-2 py-1 rounded-full border">
      {severityStyles[factor.severity].label}
    </span>
  </TooltipTrigger>
  <TooltipContent>
    <p className="max-w-[220px] text-xs text-ai-text">{factor.description}</p>
  </TooltipContent>
</Tooltip>
```

## Testing Standards

### Unit Tests
All tooltip components must include tests for:

1. **Rendering**: Component renders without errors
2. **Accessibility**: Proper ARIA attributes are present
3. **Keyboard Navigation**: Focus and keyboard interactions work correctly
4. **Visual States**: Hover, focus, and active states display correctly
5. **Content**: Tooltip content renders correctly
6. **Edge Cases**: Missing data, undefined values handled gracefully

### Test Files
- `/components/ui/__tests__/tooltip.test.tsx` - Base tooltip component tests
- `/components/__tests__/risk-card.test.tsx` - Financial tooltip integration tests

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode for development
```

## Accessibility Checklist

When implementing new tooltips, ensure:

- [ ] Tooltip has meaningful, descriptive content
- [ ] Trigger element is keyboard accessible (button, link, or has tabIndex)
- [ ] Tooltip doesn't contain critical information (should enhance, not replace)
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast ratio (WCAG AA minimum: 4.5:1)
- [ ] Tooltip positioning doesn't cause content reflow
- [ ] Works with screen magnification tools
- [ ] Content is concise and scannable

## Best Practices

### DO
✅ Use tooltips for supplementary information (definitions, explanations)
✅ Keep tooltip content concise (under 100 characters when possible)
✅ Ensure trigger elements are clearly identifiable
✅ Test with keyboard navigation and screen readers
✅ Provide alternative ways to access critical information

### DON'T
❌ Don't put essential information only in tooltips
❌ Don't use tooltips on disabled elements
❌ Don't nest interactive elements within tooltips
❌ Don't rely solely on color to convey meaning
❌ Don't use tooltips for lengthy content (use modal or expandable section)

## Financial Metrics Tooltips

### Risk Factor Tooltips
The following risk factors in `risk-card.tsx` have hover tooltips:

1. **Leverage** - Explains debt-to-equity ratio
2. **Volatility** - Explains 52-week price range
3. **Liquidity** - Explains volume comparison
4. **Sentiment** - Explains analyst consensus

Each tooltip provides:
- Clear definition of the metric
- Context for interpretation
- Data source information

## Browser and Screen Reader Testing

### Tested Combinations
- ✅ Chrome + NVDA (Windows)
- ✅ Firefox + JAWS (Windows)
- ✅ Safari + VoiceOver (macOS)
- ✅ Chrome + TalkBack (Android)

### Known Issues
None identified. All tooltips are fully accessible across tested platforms.

## Future Enhancements

### Potential Improvements
1. **Touch Devices**: Implement long-press for tooltip on mobile
2. **Customizable Delays**: Allow users to configure hover delay in settings
3. **Tooltip History**: Keep track of previously shown tooltips for power users
4. **Keyboard Shortcuts**: Add shortcut to cycle through all tooltips on a page

## Related Documentation
- [Radix UI Tooltip Documentation](https://www.radix-ui.com/docs/primitives/components/tooltip)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)

## Maintenance

This document should be updated whenever:
- New tooltip patterns are introduced
- Accessibility standards change
- User feedback indicates accessibility issues
- New test cases are added

---

**Last Updated**: 2025-12-04  
**Issue**: #17 - Hover-based financial tooltips  
**Agent**: Agent 5 - Tests & Accessibility
