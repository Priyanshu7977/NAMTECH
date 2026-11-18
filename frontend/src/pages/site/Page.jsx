import Layout from '../../components/site/Layout';
import { Breadcrumbs } from '../../components/site/Common';
import SectionRenderer from '../../components/site/sections/SectionRenderer';

export default function Page({ page, sections }) {
    const isHome = page.template === 'home';
    const firstIsHero = sections?.[0]?.type === 'page_hero' || sections?.[0]?.type === 'home_hero';

    return (
        <>
            {!firstIsHero ? (
                <header className={`nt-page-hero nt-page-hero--plain on-dark`}>
                    <div className="container">
                        <h1>{page.title}</h1>
                    </div>
                </header>
            ) : null}
            {!isHome && firstIsHero ? (
                <>
                    <SectionRenderer sections={sections.slice(0, 1)} page={page} />
                    <Breadcrumbs items={page.breadcrumbs} />
                    <SectionRenderer sections={sections.slice(1)} page={page} />
                </>
            ) : (
                <>
                    {!isHome ? <Breadcrumbs items={page.breadcrumbs} /> : null}
                    <SectionRenderer sections={sections} page={page} />
                </>
            )}
        </>
    );
}

Page.layout = (page) => <Layout>{page}</Layout>;
