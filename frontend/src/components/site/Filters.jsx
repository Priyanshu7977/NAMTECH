import { router } from '../../router/navigation';
import Icon from '../Icon';

/** Visit the current listing with new query parameters, keeping scroll and state. */
export function visit(url, params) {
    router.get(url, params, { preserveScroll: true, preserveState: true, replace: true });
}

/** Tab links that switch a listing's main filter (rendered as links so they work without JavaScript). */
export function FilterTabs({ items, active, href, label }) {
    return (
        <nav className="nt-tabs nt-tabs--links" aria-label={label}>
            {items.map(([key, text]) => (
                <a key={key || 'all'} href={href(key)} aria-current={active === key ? 'page' : undefined} onClick={(e) => {
                    e.preventDefault();
                    router.get(href(key), {}, { preserveScroll: true, preserveState: false });
                }}>
                    {text}
                </a>
            ))}
        </nav>
    );
}

/** Checkbox group used in listing sidebars. */
export function CheckboxGroup({ legend, name, options, selected, onChange }) {
    if (!options.length) return null;
    const toggle = (value) => onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    return (
        <fieldset className="nt-checkgroup">
            <legend>{legend}</legend>
            {options.map(([value, label]) => (
                <div className="form-check" key={value}>
                    <input className="form-check-input" type="checkbox" id={`${name}-${value}`} checked={selected.includes(String(value))} onChange={() => toggle(String(value))} />
                    <label className="form-check-label" htmlFor={`${name}-${value}`}>{label}</label>
                </div>
            ))}
        </fieldset>
    );
}

export function SidebarToggle({ children, label = 'Filter' }) {
    return (
        <details className="nt-sidebar-filter" open>
            <summary>
                <Icon name="gear" strokeWidth={1.6} />
                {label}
            </summary>
            <div className="nt-sidebar-filter__body">{children}</div>
        </details>
    );
}
