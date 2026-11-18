import usePage from '../../../hooks/usePage';
import { useState } from 'react';
import Carousel from '../../Carousel';
import Icon, { ArrowDot } from '../../Icon';
import { Media } from '../../ResponsiveImage';
import SmartLink from '../../SmartLink';
import Tabs from '../../Tabs';
import { IconCard, PersonCard, PostCard, ProgramCard, SimpleCard } from '../Cards';
import { Cta, RichText, SectionHeading } from '../Common';
import EnquiryForm from '../EnquiryForm';
import { SplitHead, toneClass } from './InnerSections';
import { GalleryGrid, TourEmbed, VideoEmbed } from './MediaEmbeds';

function HeroMeta({ items }) {
    if (!items?.length) return null;
    return (
        <ul className="nt-meta-list nt-meta-list--row nt-page-hero__meta">
            {items.map((m, i) => (
                <li key={i}>
                    <Icon name={m.icon || 'check'} strokeWidth={1.6} />
                    {m.text}
                </li>
            ))}
        </ul>
    );
}

function HeroStats({ statistics }) {
    if (!statistics?.length) return null;
    return (
        <dl className="nt-page-hero__stats">
            {statistics.map((stat) => (
                <div key={stat.label}>
                    <dt className="visually-hidden">{stat.label}</dt>
                    <dd className="m-0">
                        <strong data-countup={stat.value}>{stat.value}</strong>
                        <span>{stat.label}</span>
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function PageHero({ data, page, first }) {
    const title = data.title || page?.title;
    const Heading = first ? 'h1' : 'h2';
    const buttons =
        (data.cta_label && data.cta_url) || (data.secondary_label && data.secondary_url) ? (
            <div className="d-flex flex-wrap gap-3 mt-3 nt-hero-in" style={{ '--d': 3 }}>
                <Cta label={data.cta_label} url={data.cta_url} variant={data.layout === 'plain' ? '' : 'light'} />
                {data.secondary_label && data.secondary_url ? (
                    <SmartLink href={data.secondary_url} className={`nt-btn ${data.layout === 'plain' ? 'nt-btn--outline' : 'nt-btn--ghost'}`}>
                        {data.secondary_label}
                    </SmartLink>
                ) : null}
            </div>
        ) : null;

    if (data.layout === 'plain') {
        return (
            <section className="nt-plain-hero">
                <div className="container">
                    {data.eyebrow ? <p className="nt-pill nt-hero-in">{data.eyebrow}</p> : null}
                    <Heading className="nt-hero-in" style={{ '--d': 1 }}>{title}</Heading>
                    {data.body ? <p className="nt-plain-hero__body nt-hero-in" style={{ '--d': 2 }}>{data.body}</p> : null}
                    <HeroMeta items={data.meta} />
                    {buttons}
                </div>
                {data.image ? (
                    <div className="container mt-4">
                        <Media image={data.image} sizes="100vw" priority={first} className="nt-plain-hero__media" />
                    </div>
                ) : null}
            </section>
        );
    }

    return (
        <section className="nt-page-hero on-dark">
            <div className="nt-page-hero__grid">
                <div className="nt-page-hero__content">
                    {data.eyebrow ? <p className="nt-pill align-self-start nt-hero-in">{data.eyebrow}</p> : null}
                    <Heading className="nt-hero-in" style={{ '--d': 1 }}>{title}</Heading>
                    {data.body ? <p className="nt-page-hero__body nt-hero-in" style={{ '--d': 2 }}>{data.body}</p> : null}
                    <HeroMeta items={data.meta} />
                    {buttons}
                    <HeroStats statistics={data.statistics} />
                </div>
                {data.image ? (
                    <div className="nt-page-hero__media">
                        <Media image={data.image} sizes="(min-width: 992px) 50vw, 100vw" priority={first} />
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export function Intro({ data }) {
    return (
        <section className={`nt-section ${toneClass(data.tone)}`}>
            <div className="container">
                <div className="row g-4 g-lg-5">
                    <div className="col-lg-5">
                        {data.icon ? <Icon name={data.icon} strokeWidth={1} className="nt-intro__icon" /> : null}
                        <SectionHeading eyebrow={data.eyebrow} heading={data.heading} className="mb-0" />
                    </div>
                    <div className="col-lg-7">
                        <RichText html={data.body} />
                        <Cta label={data.cta_label} url={data.cta_url} variant={data.tone === 'purple' ? 'light' : ''} className="mt-4" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function RichTextSection({ data }) {
    const toc = data.toc_items ?? [];
    if (data.toc && toc.length) {
        return (
            <section className="nt-section">
                <div className="container">
                    <div className="row g-5">
                        <aside className="col-lg-3" aria-label="Sections">
                            <nav className="nt-toc">
                                <p className="nt-toc__title">Sections</p>
                                <ol>
                                    {toc.map((t) => (
                                        <li key={t.id}>
                                            <a href={`#${t.id}`}>{t.text}</a>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </aside>
                        <div className="col-lg-9">
                            {data.heading ? <h2 className="nt-h2">{data.heading}</h2> : null}
                            <RichText html={data.body} />
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    return (
        <section className="nt-section">
            <div className="container" style={{ maxWidth: data.width === 'wide' ? undefined : '52rem' }}>
                {data.heading ? <h2 className="nt-h2">{data.heading}</h2> : null}
                <RichText html={data.body} />
            </div>
        </section>
    );
}

export function ImageText({ data }) {
    const left = data.image_position !== 'right';
    const layout = data.layout || 'side';

    if (layout === 'panel') {
        return (
            <section className={`nt-image-panel ${left ? '' : 'nt-image-panel--reverse'}`}>
                <Media image={data.image} sizes="(min-width: 992px) 55vw, 100vw" className="nt-image-panel__media" />
                <div className="nt-image-panel__text on-dark">
                    <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
                    <RichText html={data.body} />
                    <Cta label={data.cta_label} url={data.cta_url} variant="light" className="mt-4" />
                </div>
            </section>
        );
    }

    return (
        <section className={`nt-section ${toneClass(data.tone)} ${layout === 'staggered' ? 'nt-staggered' : ''}`}>
            <div className="container">
                <div className={`row g-4 g-lg-5 align-items-center ${layout === 'staggered' ? 'nt-staggered__row' : ''}`}>
                    <div className={`col-lg-6 ${left ? '' : 'order-lg-2'}`}>
                        <Media image={data.image} sizes="(min-width: 992px) 50vw, 100vw" className="nt-zoom" style={{ aspectRatio: '4 / 3' }} />
                    </div>
                    <div className="col-lg-6">
                        <div className={layout === 'staggered' ? 'nt-staggered__text' : ''}>
                            <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
                            <RichText html={data.body} />
                            <Cta label={data.cta_label} url={data.cta_url} className="mt-4" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CardGrid({ data }) {
    const tone = data.tone || 'white';
    const columns = Number(data.columns || 3);
    const style = data.style || (tone === 'purple' ? 'filled' : 'outlined');
    const cards = data.cards ?? [];

    return (
        <section className={`nt-section ${toneClass(tone)}`}>
            <div className="container">
                <SplitHead data={{ ...data, tone }} />
                {style === 'joined' || style === 'joined_light' ? (
                    <div className={`nt-joined-cards nt-stagger ${style === 'joined_light' ? 'nt-joined-cards--light' : ''}`} style={{ '--cols': columns }}>
                        {cards.map((card, i) => (
                            <div className="nt-joined-card" key={i}>
                                <Icon name={card.icon || 'graduation'} strokeWidth={1.1} />
                                <h3>{card.link_url ? <SmartLink href={card.link_url} className="stretched-link">{card.title}</SmartLink> : card.title}</h3>
                                {card.body ? <p>{card.body}</p> : null}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`row g-4 row-cols-1 row-cols-md-2 row-cols-lg-${columns} nt-stagger`}>
                        {cards.map((card, i) => (
                            <div className="col" key={i}>
                                <IconCard icon={card.icon} title={card.title} body={card.body} url={card.link_url} outlined={style === 'outlined'} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export function StatsBand({ data }) {
    if (!data.statistics?.length) return null;
    if (data.layout === 'dividers') {
        return (
            <section className="nt-section">
                <div className="container">
                    <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
                    <dl className="nt-stat-dividers nt-stagger">
                        {data.statistics.map((stat) => (
                            <div key={stat.label}>
                                <dt>{stat.label}</dt>
                                <dd data-countup={stat.value}>{stat.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>
        );
    }
    return (
        <section className="nt-section nt-tone-lavender">
            <div className="container">
                <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
                <dl className="row g-4 m-0 nt-stagger">
                    {data.statistics.map((stat) => (
                        <div key={stat.label} className="col-6 col-lg-3 d-flex flex-column-reverse">
                            <dt className="fw-normal">{stat.label}</dt>
                            <dd className="m-0 nt-stat-figure" data-countup={stat.value}>
                                {stat.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}

function MediaCard({ item, layout, linkLabel }) {
    const label = linkLabel || 'Read';
    const link = item.link_url ? (
        <SmartLink href={item.link_url} className="nt-link-arrow">
            {label}
            <span className="visually-hidden">: {item.title}</span> <ArrowDot />
        </SmartLink>
    ) : null;

    switch (layout) {
        case 'showcase':
            return (
                <figure className="nt-showcase-card">
                    <Media image={item.image} sizes="(min-width: 992px) 60vw, 90vw" />
                    <figcaption>
                        <h3>{item.title}</h3>
                        {item.body ? <p>{item.body}</p> : null}
                        {link}
                    </figcaption>
                </figure>
            );
        case 'horizontal':
            return (
                <article className="nt-hcard">
                    <div className="nt-hcard__text">
                        {item.icon ? <Icon name={item.icon} strokeWidth={1.1} /> : null}
                        {item.tag ? <span className="nt-tag align-self-start">{item.tag}</span> : null}
                        <h3>{item.title}</h3>
                        {item.subtitle ? <p className="nt-hcard__sub">{item.subtitle}</p> : null}
                        {item.body ? <p>{item.body}</p> : null}
                        {link}
                    </div>
                    <Media image={item.image} sizes="(min-width: 992px) 30vw, 90vw" className="nt-hcard__media" />
                </article>
            );
        case 'story':
            return (
                <article className="nt-story-panel">
                    <Media image={item.image} sizes="(min-width: 992px) 45vw, 90vw" className="nt-story-panel__media" />
                    <div className="nt-story-panel__body">
                        {item.tag ? <span className="nt-tag align-self-start">{item.tag}</span> : null}
                        <h3>{item.title}</h3>
                        {item.subtitle ? <p className="nt-hcard__sub">{item.subtitle}</p> : null}
                        {item.body ? <p>{item.body}</p> : null}
                        {item.meta ? (
                            <p className="nt-story-card__highlight">
                                <Icon name="trend" />
                                {item.meta}
                            </p>
                        ) : null}
                        {link}
                    </div>
                </article>
            );
        case 'logo':
            return (
                <article className="nt-logo-card">
                    <Media image={item.image} sizes="(min-width: 992px) 30vw, 85vw" className="nt-logo-card__media" />
                    <div className="nt-logo-card__body">
                        {item.logo ? <img src={item.logo.src} alt={item.logo.alt} width={item.logo.width} height={item.logo.height} loading="lazy" className="nt-logo-card__logo" /> : null}
                        <h3>{item.title}</h3>
                        {item.body ? <p>{item.body}</p> : null}
                        {item.meta ? (
                            <p className="nt-story-card__highlight">
                                <Icon name="trend" />
                                {item.meta}
                            </p>
                        ) : null}
                        {link}
                    </div>
                </article>
            );
        case 'tall':
            return (
                <article className="nt-tall-card">
                    <Media image={item.image} sizes="(min-width: 992px) 25vw, 80vw" className="nt-tall-card__media" />
                    <div className="nt-tall-card__body">
                        {item.date || item.tag ? <p className="nt-tall-card__meta">{[item.tag, item.date].filter(Boolean).join(' · ')}</p> : null}
                        <h3>{item.link_url ? <SmartLink href={item.link_url} className="stretched-link">{item.title}</SmartLink> : item.title}</h3>
                        {item.subtitle ? <p className="nt-hcard__sub">{item.subtitle}</p> : null}
                        {item.body ? <p>{item.body}</p> : null}
                        {item.link_url && linkLabel ? (
                            <span className="nt-link-arrow mt-auto" aria-hidden="true">
                                {linkLabel} <ArrowDot />
                            </span>
                        ) : null}
                    </div>
                </article>
            );
        default:
            return <SimpleCard item={{ ...item, url: item.link_url, summary: item.body }} linkLabel={linkLabel} />;
    }
}

export function MediaCards({ data }) {
    const layout = data.layout || 'cards';
    const items = data.items ?? [];
    const widths = { cards: 'min(22rem, 82%)', showcase: 'min(56rem, 88%)', horizontal: 'min(60rem, 92%)', story: 'min(62rem, 92%)', logo: 'min(24rem, 85%)', tall: 'min(18rem, 75%)' };

    return (
        <section className={`nt-section ${toneClass(data.tone)} nt-media-cards--${layout}`}>
            <div className="container">
                <SplitHead data={data} />
                <Carousel label={data.heading || 'Highlights'} slideWidth={widths[layout] ?? widths.cards} gap={layout === 'tall' ? '1.25rem' : '2rem'} align={layout === 'showcase' ? 'center' : 'start'}>
                    {items.map((item, i) => (
                        <MediaCard key={i} item={item} layout={layout} linkLabel={data.card_link_label} />
                    ))}
                </Carousel>
                {data.footer_label && data.footer_url ? (
                    <p className="text-center mt-4 mb-0">
                        <SmartLink href={data.footer_url} className="nt-link-arrow">
                            {data.footer_label} <ArrowDot />
                        </SmartLink>
                    </p>
                ) : null}
            </div>
        </section>
    );
}

export function TabsSection({ data }) {
    if (!data.tabs?.length) return null;
    const centered = data.layout === 'centered';
    return (
        <section className={`nt-section ${toneClass(data.tone)}`}>
            <div className="container">
                <div className={centered ? 'text-center mx-auto' : ''} style={centered ? { maxWidth: '48rem' } : undefined}>
                    {data.eyebrow ? <p className={`nt-pill ${centered ? 'd-table mx-auto' : ''}`}>{data.eyebrow}</p> : null}
                    {data.heading ? <h2 className="nt-h2">{data.heading}</h2> : null}
                    {data.body ? <p className={`nt-lead mt-3 mb-0 ${centered ? 'mx-auto' : ''}`} style={{ maxWidth: '48rem' }}>{data.body}</p> : null}
                </div>
                <Tabs
                    label={data.heading || 'Tabs'}
                    className={`mt-4 ${centered ? 'nt-tabs-center' : ''}`}
                    tabs={data.tabs.map((tab, i) => ({
                        key: i,
                        label: tab.label,
                        content: centered ? (
                            <div className="text-center mx-auto nt-fade-in" style={{ maxWidth: '48rem' }}>
                                {tab.image ? <Media image={tab.image} sizes="(min-width: 992px) 48rem, 100vw" className="mb-4" style={{ aspectRatio: '16 / 9' }} /> : null}
                                {tab.title ? <h3 className="nt-h3 mb-3">{tab.title}</h3> : null}
                                <RichText html={tab.body} />
                            </div>
                        ) : (
                            <div className="row g-4 g-lg-5 align-items-center nt-fade-in">
                                <div className={tab.image ? 'col-lg-6' : 'col-12'}>
                                    {tab.title ? <h3 className="nt-h3 mb-3">{tab.title}</h3> : null}
                                    <RichText html={tab.body} />
                                </div>
                                {tab.image ? (
                                    <div className="col-lg-6">
                                        <Media image={tab.image} sizes="(min-width: 992px) 50vw, 100vw" style={{ aspectRatio: '4 / 3' }} />
                                    </div>
                                ) : null}
                            </div>
                        ),
                    }))}
                />
            </div>
        </section>
    );
}

export function FaqItems({ items }) {
    return (
        <div className="nt-faq">
            {(items ?? []).map((item, i) => (
                <details key={i}>
                    <summary>{item.question}</summary>
                    <RichText html={item.answer} />
                </details>
            ))}
        </div>
    );
}

export function Faq({ data }) {
    if (data.layout === 'centered') {
        return (
            <section className="nt-section">
                <div className="container">
                    <div className="nt-faq-panel">
                        <h2 className="nt-h2 text-center">{data.heading || 'Frequently Asked Questions'}</h2>
                        {data.body ? <p className="text-center mb-4">{data.body}</p> : null}
                        <FaqItems items={data.items} />
                    </div>
                </div>
            </section>
        );
    }
    return (
        <section className="nt-section">
            <div className="container">
                <div className="row g-4 g-lg-5">
                    <div className="col-lg-4">
                        <h2 className="nt-h2">{data.heading || 'Frequently Asked Questions'}</h2>
                        {data.body ? <p>{data.body}</p> : null}
                    </div>
                    <div className="col-lg-8">
                        <FaqItems items={data.items} />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function Steps({ data }) {
    const items = data.items ?? [];
    if (data.layout === 'panel') {
        return (
            <section className="nt-section">
                <div className="container">
                    <SplitHead data={data} />
                    <div className="nt-steps-panel">
                        {data.image ? <Media image={data.image} sizes="(min-width: 992px) 45vw, 100vw" className="nt-steps-panel__media" /> : null}
                        <div className="nt-steps-panel__list">
                            {data.panel_title ? <p className="nt-steps-panel__title">{data.panel_title}</p> : null}
                            <ol>
                                {items.map((item, i) => (
                                    <li key={i}>
                                        <span>{String(i + 1).padStart(2, '0')}</span>
                                        <div>
                                            <h3>{item.title}</h3>
                                            {item.body ? <p>{item.body}</p> : null}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    return (
        <section className="nt-section">
            <div className="container">
                <div className="row g-4 g-lg-5">
                    <div className="col-lg-5">
                        <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
                        {data.body ? <p>{data.body}</p> : null}
                        {data.image ? <Media image={data.image} sizes="(min-width: 992px) 40vw, 100vw" className="mt-4" style={{ aspectRatio: '4 / 3' }} /> : null}
                    </div>
                    <div className="col-lg-7">
                        <ol className="nt-steps">
                            {items.map((item, i) => (
                                <li key={i}>
                                    <h3>{item.title}</h3>
                                    {item.body ? <p className="mb-0">{item.body}</p> : null}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function People({ data }) {
    const people = data.people ?? [];
    if (!people.length) return null;
    const layout = data.layout || 'grid';

    let body;
    if (layout === 'carousel') {
        const groups = [
            ['residential', 'Residential Faculty'],
            ['visiting', 'Visiting Faculty'],
        ]
            .map(([key, label]) => ({ key, label, list: people.filter((p) => (p.category || 'residential') === key) }))
            .filter((g) => g.list.length);
        const carousel = (list, label) => (
            <Carousel label={label} slideWidth="min(17rem, 75%)" gap="1.5rem">
                {list.map((person) => (
                    <PersonCard key={person.id} person={person} />
                ))}
            </Carousel>
        );
        body = groups.length > 1 ? (
            <Tabs label="Faculty type" tabs={groups.map((g) => ({ key: g.key, label: g.label, content: carousel(g.list, g.label) }))} />
        ) : (
            carousel(people, data.heading || 'Faculty')
        );
    } else if (layout === 'list') {
        body = (
            <ul className="nt-people-list list-unstyled nt-stagger">
                {people.map((p) => (
                    <li key={p.id}>
                        <Media image={p.photo} sizes="96px" alt="" />
                        <div>
                            <h3><SmartLink href={p.url} className="stretched-link">{p.name}</SmartLink></h3>
                            {p.designation ? <p>{p.designation}</p> : null}
                        </div>
                        <Icon name="arrowRight" strokeWidth={2} />
                    </li>
                ))}
            </ul>
        );
    } else {
        body = (
            <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-4 nt-stagger">
                {people.map((person) => (
                    <div className="col" key={person.id}>
                        <PersonCard person={person} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <section className={`nt-section ${toneClass(data.tone)}`}>
            <div className="container">
                <SplitHead data={data} />
                {body}
            </div>
        </section>
    );
}

export function ProgramsList({ data }) {
    if (!data.programs?.length) return null;
    return (
        <section className="nt-section">
            <div className="container">
                <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
                <Carousel label={data.heading || 'Programs'} slideWidth="min(58.75rem, 88%)">
                    {data.programs.map((program) => (
                        <ProgramCard key={program.id} item={program} />
                    ))}
                </Carousel>
            </div>
        </section>
    );
}

export function PostList({ data }) {
    if (!data.posts?.length) return null;
    return (
        <section className="nt-section">
            <div className="container">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    {data.heading ? <h2 className="nt-h2 m-0">{data.heading}</h2> : null}
                    <Cta label={data.cta_label} url={data.cta_url} variant="outline" />
                </div>
                {data.layout === 'carousel' ? (
                    <Carousel label={data.heading || 'Articles'} slideWidth="min(21rem, 82%)" gap="1.5rem">
                        {data.posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </Carousel>
                ) : (
                    <div className="nt-card-grid nt-stagger">
                        {data.posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export function LogoStrip({ data }) {
    if (!data.logos?.length) return null;
    return (
        <section className={`nt-section ${toneClass(data.tone)}`}>
            <div className="container">
                {data.heading ? <h2 className="nt-h3 text-center mb-4">{data.heading}</h2> : null}
                <ul className="nt-logos list-unstyled m-0 justify-content-center flex-wrap nt-stagger" aria-label={data.heading || 'Partners'}>
                    {data.logos.map((logo) => (
                        <li key={logo.id}>
                            <img src={logo.logo?.src} width={logo.logo?.width} height={logo.logo?.height} alt={logo.name} loading="lazy" />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function Spotlight({ items }) {
    const [active, setActive] = useState(0);
    const item = items[active];
    return (
        <div className="nt-spotlight">
            <ul className="nt-spotlight__names" role="tablist" aria-label="Testimonials">
                {items.map((it, i) => (
                    <li key={i} role="presentation">
                        <button type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)}>
                            <strong>{it.name}</strong>
                            {it.role ? <span>{it.role}</span> : null}
                        </button>
                    </li>
                ))}
            </ul>
            <figure className="nt-spotlight__card nt-fade-in" key={active} role="tabpanel">
                {item.image ? <Media image={item.image} sizes="(min-width: 992px) 30vw, 90vw" alt="" className="nt-spotlight__media" /> : null}
                <blockquote>“{item.quote}”</blockquote>
                <figcaption>
                    <strong>{item.name}</strong>
                    {item.role ? <span>{item.role}</span> : null}
                </figcaption>
            </figure>
        </div>
    );
}

export function Testimonials({ data }) {
    const items = data.items ?? [];
    const layout = data.layout || 'quotes';
    let body;
    if (layout === 'spotlight' && items.length) {
        body = <Spotlight items={items} />;
    } else if (layout === 'portrait') {
        body = (
            <Carousel label={data.heading || 'Testimonials'} slideWidth="min(60rem, 92%)">
                {items.map((item, i) => (
                    <figure className="nt-portrait-quote m-0" key={i}>
                        {item.image ? <Media image={item.image} sizes="(min-width: 992px) 30vw, 90vw" alt="" className="nt-portrait-quote__media" /> : null}
                        <div className="nt-portrait-quote__box on-dark">
                            <Icon name="quote" />
                            <blockquote>{item.quote}</blockquote>
                            <figcaption>
                                <strong>{item.name}</strong>
                                {item.role ? <span>{item.role}</span> : null}
                            </figcaption>
                        </div>
                    </figure>
                ))}
            </Carousel>
        );
    } else {
        body = (
            <Carousel label={data.heading || 'Testimonials'} slideWidth="min(36rem, 88%)">
                {items.map((item, i) => (
                    <figure className="nt-quote m-0" key={i}>
                        <blockquote>“{item.quote}”</blockquote>
                        <figcaption className="d-flex align-items-center gap-3">
                            {item.image ? <Media image={item.image} sizes="64px" alt="" style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%' }} /> : null}
                            <span>
                                <strong className="d-block">{item.name}</strong>
                                {item.role ? <span className="small">{item.role}</span> : null}
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </Carousel>
        );
    }
    return (
        <section className={`nt-section ${toneClass(data.tone)}`}>
            <div className="container">
                <SplitHead data={data} />
                {body}
            </div>
        </section>
    );
}

export function GallerySection({ data }) {
    const gallery = data.gallery;
    if (!gallery) return null;
    return (
        <section className="nt-section">
            <div className="container">
                {data.heading ? <h2 className="nt-h2">{data.heading}</h2> : null}
                {gallery.description ? <p className="nt-lead mb-4">{gallery.description}</p> : null}
                {data.show_tour ? (
                    <div className="mb-5">
                        <TourEmbed gallery={gallery} />
                    </div>
                ) : null}
                <GalleryGrid items={gallery.items} />
            </div>
        </section>
    );
}

export function VideoSection({ data }) {
    return (
        <section className="nt-section">
            <div className="container">
                {data.heading ? <h2 className="nt-h2">{data.heading}</h2> : null}
                <figure className="m-0">
                    <VideoEmbed url={data.video_url} poster={data.poster} title={data.heading || data.caption} />
                    {data.caption ? <figcaption className="mt-2 small">{data.caption}</figcaption> : null}
                </figure>
            </div>
        </section>
    );
}

const formatSize = (bytes) => (bytes ? (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`) : null);

export function Documents({ data }) {
    const items = (data.items ?? []).map((item) => ({
        title: item.title,
        url: item.file?.url || item.url,
        meta: item.meta || (item.file ? ['PDF', formatSize(item.file.size)].filter(Boolean).join(' · ') : null),
        isFile: Boolean(item.file?.url),
    }));

    if (data.layout === 'list') {
        return (
            <section className={`nt-section ${toneClass(data.tone)}`}>
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-4">
                            <SectionHeading eyebrow={data.eyebrow} heading={data.heading} />
                            {data.body ? <p>{data.body}</p> : null}
                        </div>
                        <div className="col-lg-8">
                            <ul className="nt-doc-rows">
                                {items.map((item, i) => (
                                    <li key={i}>
                                        <span>
                                            {item.title}
                                            {item.meta ? <small className="d-block text-muted">{item.meta}</small> : null}
                                        </span>
                                        {item.url ? (
                                            <a href={item.url} className="nt-link-arrow" {...(item.isFile ? { target: '_blank', rel: 'noopener' } : {})}>
                                                Download<span className="visually-hidden"> {item.title}</span> <Icon name="download" strokeWidth={1.8} />
                                            </a>
                                        ) : (
                                            <span className="small text-muted">Coming soon</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`nt-section ${toneClass(data.tone)}`}>
            <div className="container">
                <SplitHead data={data} />
                <ul className="nt-doc-grid nt-stagger">
                    {items.map((item, i) => (
                        <li key={i}>
                            <Icon name="document" strokeWidth={1.1} />
                            <span className="nt-doc-grid__title">
                                {item.url ? (
                                    <a href={item.url} className="stretched-link" {...(item.isFile ? { target: '_blank', rel: 'noopener' } : {})}>
                                        {item.title}
                                    </a>
                                ) : (
                                    item.title
                                )}
                            </span>
                            {item.meta ? <span className="nt-doc-grid__meta">{item.meta}</span> : null}
                            {item.url ? <Icon name="download" strokeWidth={1.8} className="nt-doc-grid__dl" /> : null}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export function CtaBand({ data }) {
    return (
        <section className={`nt-cta-band ${data.tone && data.tone !== 'purple' ? `nt-cta-band--${data.tone}` : ''}`}>
            <div className="container">
                <div>
                    <h2>{data.heading}</h2>
                    {data.body ? <p className="m-0">{data.body}</p> : null}
                </div>
                <Cta label={data.cta_label} url={data.cta_url} />
            </div>
        </section>
    );
}

export function EnquiryFormSection({ data, anchor }) {
    const { site } = usePage().props;
    const settings = site?.settings ?? {};
    return (
        <section className="nt-section" aria-labelledby={`${anchor || 'enquiry'}-heading`}>
            <div className="container">
                <div className="row g-5">
                    <div className={data.show_contact_details ? 'col-lg-7' : 'col-lg-8 mx-auto'}>
                        <h2 className="nt-h2" id={`${anchor || 'enquiry'}-heading`}>
                            {data.heading || 'Send us an enquiry'}
                        </h2>
                        {data.body ? <p className="mb-4">{data.body}</p> : null}
                        <EnquiryForm type={data.form_type || 'contact'} programs={data.programs ?? []} />
                    </div>
                    {data.show_contact_details ? (
                        <aside className="col-lg-4 offset-lg-1" aria-label="Contact details">
                            <div className="nt-quote">
                                {settings.address ? (
                                    <>
                                        <h3 className="h6 text-uppercase">{settings.address_title || 'Address'}</h3>
                                        <address>{settings.address}</address>
                                    </>
                                ) : null}
                                {settings.phones?.length ? (
                                    <>
                                        <h3 className="h6 text-uppercase mt-4">Phone</h3>
                                        {settings.phones.map((p) => (
                                            <a key={p.number} className="d-block" href={`tel:${p.number.replace(/[^+\d]/g, '')}`}>
                                                {p.number}
                                            </a>
                                        ))}
                                    </>
                                ) : null}
                                {settings.email ? (
                                    <>
                                        <h3 className="h6 text-uppercase mt-4">Email</h3>
                                        <a href={`mailto:${settings.email}`}>{settings.email}</a>
                                    </>
                                ) : null}
                            </div>
                        </aside>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
