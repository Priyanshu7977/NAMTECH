import { useId, useRef, useState } from 'react';

/**
 * WAI-ARIA tabs with automatic activation (arrow keys, Home/End).
 * Inactive panels are hidden but stay in the DOM (and in server-rendered HTML).
 */
export default function Tabs({ tabs, initial = 0, label, className = '' }) {
    const [active, setActive] = useState(Math.min(initial, Math.max(0, tabs.length - 1)));
    const refs = useRef([]);
    const id = useId();

    const focus = (i) => {
        const next = (i + tabs.length) % tabs.length;
        setActive(next);
        refs.current[next]?.focus();
    };

    return (
        <div className={className}>
            <div className="nt-tabs" role="tablist" aria-label={label}>
                {tabs.map((tab, i) => (
                    <button
                        key={tab.key}
                        ref={(el) => (refs.current[i] = el)}
                        type="button"
                        role="tab"
                        id={`${id}-tab-${i}`}
                        aria-selected={i === active}
                        aria-controls={`${id}-panel-${i}`}
                        tabIndex={i === active ? 0 : -1}
                        onClick={() => setActive(i)}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowRight') focus(i + 1);
                            else if (e.key === 'ArrowLeft') focus(i - 1);
                            else if (e.key === 'Home') focus(0);
                            else if (e.key === 'End') focus(tabs.length - 1);
                            else return;
                            e.preventDefault();
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {tabs.map((tab, i) => (
                <div key={tab.key} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} hidden={i !== active} tabIndex={0}>
                    {tab.content}
                </div>
            ))}
        </div>
    );
}
