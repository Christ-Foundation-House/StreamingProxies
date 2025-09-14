# ClientOnly Component

The `ClientOnly` component prevents React hydration mismatches by only rendering children on the client side after the component has mounted.

## When to Use

Use `ClientOnly` for components that:

- Render time-sensitive data (timestamps, dates, "time ago" text)
- Access browser APIs (localStorage, navigator, window)
- Have different server and client initial states
- Display real-time data that may differ between server and client
- Use third-party libraries that don't support SSR

## Basic Usage

```tsx
import { ClientOnly } from '@/components';

// Basic usage - nothing shown during SSR
<ClientOnly>
  <TimeDisplay />
</ClientOnly>

// With fallback content during SSR
<ClientOnly fallback={<div>Loading...</div>}>
  <RealTimeComponent />
</ClientOnly>

// With loading state and delay for smooth transitions
<ClientOnly 
  fallback={<Skeleton />}
  loading={<Spinner />}
  delay={100}
>
  <ComplexComponent />
</ClientOnly>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Content to render only on client side |
| `fallback` | `ReactNode` | `null` | Content shown during SSR and initial hydration |
| `loading` | `ReactNode` | `null` | Content shown during delay period |
| `delay` | `number` | `0` | Delay in ms before showing children |
| `showLoadingDuringDelay` | `boolean` | `true` | Whether to show loading during delay |

## Common Patterns

### Time-Sensitive Components

```tsx
// Wrap components that show current time or relative timestamps
<ClientOnly fallback={<span>Loading time...</span>}>
  <span>Last updated: {formatTimeAgo(lastUpdate)}</span>
</ClientOnly>
```

### Browser API Usage

```tsx
// Components that use localStorage, navigator, etc.
<ClientOnly fallback={<div>Loading preferences...</div>}>
  <UserPreferences />
</ClientOnly>
```

### Real-Time Data

```tsx
// Components with WebSocket connections or polling
<ClientOnly 
  fallback={<div>Connecting...</div>}
  loading={<div>Establishing connection...</div>}
  delay={200}
>
  <LiveDataFeed />
</ClientOnly>
```

### Third-Party Libraries

```tsx
// Libraries that don't support SSR
<ClientOnly fallback={<div>Loading chart...</div>}>
  <Chart data={chartData} />
</ClientOnly>
```

## useIsClient Hook

For simple conditional rendering based on client/server environment:

```tsx
import { useIsClient } from '@/components';

function MyComponent() {
  const isClient = useIsClient();
  
  return (
    <div>
      <p>Environment: {isClient ? 'Client' : 'Server'}</p>
      {isClient && <ClientSpecificFeature />}
    </div>
  );
}
```

## Best Practices

1. **Always provide meaningful fallback content** - Don't leave users with blank spaces
2. **Use skeleton loaders** for better perceived performance
3. **Keep fallback content similar in size** to prevent layout shifts
4. **Consider using delays** for smooth transitions on fast connections
5. **Test both server and client rendering** to ensure good UX

## Examples

See the `TimeDisplay` component and `ClientOnlyExamples` for complete working examples.

## Requirements Addressed

This component addresses the following requirements from the spec:

- **Requirement 1.1**: Prevents hydration mismatch errors
- **Requirement 1.3**: Ensures consistent rendering between server and client
- **Requirement 1.4**: Handles initial loading states properly

## Implementation Notes

- Uses `useEffect` to detect client-side mounting
- Supports optional delays for smooth transitions
- Provides both component and hook APIs for flexibility
- Fully typed with TypeScript for better developer experience