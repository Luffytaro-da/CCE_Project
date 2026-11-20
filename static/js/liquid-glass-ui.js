import React, { useState } from "https://esm.sh/react@19.1.0";
import { createRoot } from "https://esm.sh/react-dom@19.1.0/client";
import { LiquidGlassTabBar } from "https://esm.sh/@ogtirth/liquid-glass-oss@0.1.0?deps=react@19.1.0,react-dom@19.1.0";

const mount = document.getElementById("liquidGlassTabbarMount");

if (mount) {
    const items = [
        { id: "all", label: "All Tasks" },
        { id: "pending", label: "Pending" },
        { id: "completed", label: "Completed" },
        { id: "high-priority", label: "High Priority" }
    ];

    function TaskFilterMaterial() {
        const [value, setValue] = useState("all");

        const handleValueChange = (nextValue) => {
            setValue(nextValue);
            const legacyButton = document.querySelector(`[data-filter="${nextValue}"]`);
            if (legacyButton) legacyButton.click();
        };

        return React.createElement(LiquidGlassTabBar, {
            backgroundImage: "/static/liquid-glass-background.svg",
            items,
            value,
            variant: "prism",
            settings: {
                refraction: 0.72,
                chromaticAberration: 0.05,
                tintStrength: 0.18,
                liquidMotion: 0.18
            },
            onValueChange: handleValueChange,
            "aria-label": "Task filters",
            className: "taskflow-liquid-tabbar"
        });
    }

    try {
        createRoot(mount).render(React.createElement(TaskFilterMaterial));
        document.body.classList.add("liquid-glass-ready");
    } catch (error) {
        console.warn("LiquidGlass UI unavailable; using standard task filters.", error);
    }
}
