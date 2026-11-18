import { Breadcrumbs } from './Common';
import SectionRenderer from './sections/SectionRenderer';

/** Listing pages show their CMS hero/intro sections (if any) above the generated listing. */
export default function ListingShell({ title, sections, breadcrumbs, children }) {
    const hasHero = sections?.[0]?.type === 'page_hero';
    return (
        <>
            {hasHero ? (
                <SectionRenderer sections={sections.slice(0, 1)} page={{ title }} />
            ) : (
                <header className="nt-page-hero nt-page-hero--plain on-dark">
                    <div className="container">
                        <h1>{title}</h1>
                    </div>
                </header>
            )}
            <Breadcrumbs items={breadcrumbs} />
            {hasHero ? <SectionRenderer sections={sections.slice(1)} page={{ title }} /> : <SectionRenderer sections={sections} page={{ title }} />}
            {children ? (
                <section className="nt-section pt-4">
                    <div className="container">{children}</div>
                </section>
            ) : null}
        </>
    );
}
