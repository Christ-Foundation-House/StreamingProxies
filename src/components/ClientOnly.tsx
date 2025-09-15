'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyProps {
    /**
     * The content to render only on the client side
     */
    children: ReactNode;

    /**
     * Optional fallback content to show during server-side rendering
     * and initial client-side hydration. If not provided, nothing is rendered.
     */
    fallback?: ReactNode;

    /**
     * Optional loading content to show while transitioning from fallback to children
     */
    loading?: ReactNode;

    /**
     * Delay in milliseconds before showing children (useful for smooth transitions)
     * @default 0
     */
    delay?: number;

    /**
     * Whether to show a loading state during the delay period
     * @default true
     */
    showLoadingDuringDelay?: boolean;
}

/**
 * ClientOnly component prevents hydration mismatches by only rendering
 * children on the client side after the component has mounted.
 * 
 * This is particularly useful for:
 * - Components that render time-sensitive data (timestamps, dates)
 * - Components that depend on browser APIs
 * - Components with dynamic content that differs between server and client
 * - Real-time data components that may have different initial states
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ClientOnly>
 *   <TimeDisplay />
 * </ClientOnly>
 * 
 * // With fallback
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <RealTimeData />
 * </ClientOnly>
 * 
 * // With smooth transition
 * <ClientOnly 
 *   fallback={<Skeleton />}
 *   loading={<Spinner />}
 *   delay={100}
 * >
 *   <ComplexComponent />
 * </ClientOnly>
 * ```
 */
export function ClientOnly({
    children,
    fallback = null,
    loading = null,
    delay = 0,
    showLoadingDuringDelay = true
}: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const [isDelayComplete, setIsDelayComplete] = useState(delay === 0);

    useEffect(() => {
        // Mark as mounted to indicate we're on the client side
        setHasMounted(true);

        // Handle delay if specified
        if (delay > 0) {
            const timer = setTimeout(() => {
                setIsDelayComplete(true);
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [delay]);

    // During server-side rendering, always show fallback
    if (!hasMounted) {
        return <>{fallback}</>;
    }

    // On client side, but still within delay period
    if (!isDelayComplete) {
        return <>{showLoadingDuringDelay && loading ? loading : fallback}</>;
    }

    // Client-side rendering after delay (if any) is complete
    return <>{children}</>;
}

/**
 * Hook to check if the component is running on the client side.
 * Useful for conditional rendering based on client/server environment.
 * 
 * @returns boolean indicating if the component has mounted on the client
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isClient = useIsClient();
 *   
 *   return (
 *     <div>
 *       {isClient ? (
 *         <ClientSpecificComponent />
 *       ) : (
 *         <ServerFallback />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsClient(): boolean {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}

export default ClientOnly;