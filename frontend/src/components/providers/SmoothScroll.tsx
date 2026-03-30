"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.12,
                duration: 1.0,
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 1.5,
                infinite: false,
                autoResize: true,
            }}
        >
            {children}
        </ReactLenis>
    );
}
