# Soda Laundry Design System

## Color Palette

### Primary Colors
- **Brand Blue**: `#3B5998` - Used for logo and primary brand elements
- **Blue Gradient Start**: `#2347b0` - Dark blue for gradients
- **Blue Gradient End**: `#8eb6dc` - Light blue for gradients

### Secondary Colors
- **Orange**: `#f97316` (orange-500) - Used for dryer-related elements and CTAs
- **Orange Dark**: `#ea580c` (orange-600) - Hover states for orange elements
- **Orange Light**: `#fb923c` (orange-400) - Light orange accents

### Accent Colors
- **Green Success**: `#22c55e` (green-500) - Success states
- **Blue Light**: `#8eb6dc` - Step indicators, light accents

### Neutral Colors
- **Gray 900**: `#111827` - Primary text
- **Gray 700**: `#374151` - Secondary text
- **Gray 600**: `#4b5563` - Tertiary text
- **Gray 500**: `#6b7280` - Muted text
- **Gray 300**: `#d1d5db` - Borders, dividers
- **Gray 200**: `#e5e7eb` - Card borders
- **Gray 100**: `#f3f4f6` - Subtle backgrounds
- **Gray 50**: `#f9fafb` - Very light backgrounds
- **White**: `#ffffff` - Main backgrounds

### Background Gradients
- **Page Background**: `bg-gradient-to-br from-[#2347b0]/5 via-white to-[#8eb6dc]/15`
  - Very subtle gradient with 5-15% opacity for predominantly white appearance
- **Button Gradient (Blue)**: `bg-gradient-to-r from-[#2347b0] to-[#8eb6dc]`
- **Button Gradient (Orange)**: `bg-gradient-to-r from-orange-500 to-orange-400`
- **Selected Card Gradient**: `bg-gradient-to-br from-[#2347b0] to-[#8eb6dc]`

## Typography

### Font Sizes (Using Default Typography)
**IMPORTANT**: Do not use Tailwind font size, font weight, or line-height classes unless specifically changing from defaults.

Default typography is set in `/styles/globals.css`:
- **h1**: Large titles (e.g., "Welcome!", "Payment Successful!")
- **h2**: Section headers (e.g., "How Card Payment Works")
- **h3**: Subsection headers
- **body/p**: Regular text
- **span/div**: Inherits based on context

### When to Override
Only use Tailwind typography classes when:
- Making text smaller/larger than default
- Emphasizing specific text
- Creating special UI elements (badges, labels)

## Spacing & Layout

### Container
- **Max Width**: `max-w-4xl mx-auto`
- **Horizontal Padding**: `px-6`
- **Vertical Padding**: `py-8`

### Card Spacing
- **Card Padding**: `p-4` (small), `p-5` (medium), `p-6` (large)
- **Card Gap**: `space-y-4` (between cards in a list)
- **Inner Gap**: `gap-4` (between elements within a card)

### Bottom Safe Area
- **Bottom Padding**: `pb-32` on main content to account for fixed bottom bar

## Components

### Buttons

#### Primary Button (Blue Gradient)
```tsx
<button className="w-full bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] hover:from-[#1d3a8f] hover:to-[#7aa5cb] text-white py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg">
  Button Text
</button>
```

#### Primary Button (Orange Gradient)
```tsx
<button className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg">
  Button Text
</button>
```

#### Secondary Button (White on Orange)
```tsx
<button className="w-full bg-white text-orange-500 py-3 rounded-xl hover:bg-gray-50 transition-colors">
  Button Text
</button>
```

#### Ghost Button
```tsx
<button className="w-full text-white hover:text-white/80 transition-colors">
  Button Text
</button>
```

#### Icon Button
```tsx
<button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
  <Icon className="w-5 h-5 text-[#3B5998]" />
</button>
```

### Cards

#### Standard Card (One Per Line)
```tsx
<div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
  {/* Card content */}
</div>
```

#### Selected Card (Blue Border)
```tsx
<div className="bg-white rounded-2xl border-3 border-[#3B5998] shadow-lg p-5">
  {/* Card content */}
</div>
```

#### Clickable Card
```tsx
<button className="w-full bg-white rounded-2xl border-2 border-gray-200 hover:border-[#3B5998] p-5 text-left transition-all">
  {/* Card content */}
</button>
```

#### Accordion Card (Expandable)
```tsx
<div className="bg-white rounded-2xl border-2 border-gray-200">
  <button className="w-full p-5 flex items-center justify-between">
    <span>Card Title</span>
    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {isOpen && (
    <div className="px-5 pb-5 border-t border-gray-200">
      {/* Expanded content */}
    </div>
  )}
</div>
```

### Badges

#### Capacity Badge (Blue Gradient)
```tsx
<div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] text-white">
  40 lb
</div>
```

#### Status Badge (Orange)
```tsx
<div className="px-3 py-1 rounded-full bg-orange-400 text-white">
  Available
</div>
```

#### Section Header Badge
```tsx
<div className="bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] text-white px-4 py-2 rounded-full">
  Section Title
</div>
```

### Step Indicators

#### Blue Step
```tsx
<div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8eb6dc] text-white flex items-center justify-center">
  1
</div>
```

#### Orange Step
```tsx
<div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center">
  2
</div>
```

#### Brand Blue Step
```tsx
<div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3B5998] text-white flex items-center justify-center">
  1
</div>
```

### Section Headers

#### With Divider
```tsx
<div className="flex items-center gap-3 mb-4">
  <div className="bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] text-white px-4 py-2 rounded-full">
    Section Title
  </div>
  <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
</div>
```

### Input Fields

#### Standard Input
```tsx
<input
  type="text"
  placeholder="Placeholder"
  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#3B5998] transition-colors"
/>
```

#### Input with Icon
```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
  <input
    type="text"
    placeholder="Placeholder"
    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#3B5998] transition-colors"
  />
</div>
```

### Header

#### Standard Header with Logo
```tsx
<header className="bg-white shadow-sm">
  <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center relative">
    <button className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
      <ArrowLeft className="w-5 h-5 text-[#3B5998]" />
    </button>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 flex items-center justify-center">
        <img src={logoIcon} alt="Soda Laundry" className="w-6 h-6" />
      </div>
      <span className="text-[#3B5998] font-semibold">Soda Laundry</span>
    </div>
  </div>
</header>
```

#### Header with Menu
```tsx
<header className="bg-white shadow-sm">
  <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
    <div className="w-10"></div>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 flex items-center justify-center">
        <img src={logoIcon} alt="Soda Laundry" className="w-6 h-6" />
      </div>
      <span className="text-[#3B5998] font-semibold">Soda Laundry</span>
    </div>
    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
      <Menu className="w-5 h-5 text-[#3B5998]" />
    </button>
  </div>
</header>
```

### Bottom Action Bar

```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
  <div className="max-w-4xl mx-auto px-6 py-4">
    <button className="w-full bg-gradient-to-r from-[#2347b0] to-[#8eb6dc] hover:from-[#1d3a8f] hover:to-[#7aa5cb] text-white py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg">
      Continue
    </button>
  </div>
</div>
```

## Interaction Patterns

### Clickable Cards with Quantity Controls
Retail items use clickable cards where clicking anywhere adds the item:
- Click card → Show quantity controls (-, count, +)
- Quantity at 0 → Show only the card (clickable to add)
- No separate "+ Add" buttons

### Selected States
- **Selected cards**: Border changes to `border-[#3B5998]` with `border-3` and `shadow-lg`
- **Selected options**: Blue gradient background with white text
- **Hover states**: Scale transform `hover:scale-[1.02]` for buttons

### Expandable Accordions
- Used for configuration screens
- Chevron icon rotates 180° when expanded
- Content appears below with border-top separator

## Layout Patterns

### Vertical List
- **One card per line**
- **Compact card heights**
- **Consistent spacing**: `space-y-4` between cards
- Each card shows key information without excessive whitespace

### Grid Layout (Exceptions)
Only use grid when showing multiple options that benefit from side-by-side comparison:
- Never for main navigation cards
- Rarely used in this app

## Border Radius

- **Cards**: `rounded-2xl` (16px)
- **Buttons**: `rounded-2xl` (16px) for primary, `rounded-xl` (12px) for secondary
- **Badges**: `rounded-full`
- **Inputs**: `rounded-xl` (12px)

## Shadows

- **Cards**: Default `shadow-sm`, selected state `shadow-lg`
- **Buttons**: `shadow-lg` for emphasis
- **Header**: `shadow-sm`
- **Bottom Bar**: `shadow-lg`

## Icons

- **Source**: lucide-react
- **Size**: Generally `w-5 h-5` or `w-6 h-6`
- **Color**: Matches context (blue for washers, orange for dryers)

## Animation & Transitions

- **Standard transition**: `transition-colors` or `transition-all`
- **Button hover**: `transform hover:scale-[1.02]`
- **Icon rotation**: `transition-transform ${isOpen ? 'rotate-180' : ''}`
- Keep animations subtle and performant
