import { useEffect, useId, useRef, useState } from 'react';
import Carousel from '../../Carousel';
import Icon, { ArrowDot } from '../../Icon';
import { Media } from '../../ResponsiveImage';
import SmartLink from '../../SmartLink';
import { IconCard, PersonCard, PostCard, ProgramCard, StoryCard } from '../Cards';
import { Cta, SectionHeading } from '../Common';
import { toEmbedUrl } from '../../../lib/embed';
import { TourButton } from './MediaEmbeds';
import indiaMap from '../../../images/india-map.svg';

export function HomeHero({ data }) {
    const slides = data.slides ?? [];
    const [index, setIndex] = useState(0);
    const touch = useRef(null);
    if (!slides.length) return null;
    const multiple = slides.length > 1;
    const go = (i) => setIndex((i + slides.length) % slides.length);

    return (
        <section
            className="nt-hero on-dark"
            aria-roledescription={multiple ? 'carousel' : undefined}
            aria-label="Introduction"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (!multiple || touch.current === null) return;
                const delta = e.changedTouches[0].clientX - touch.current;
                if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
                touch.current = null;
            }}
        >
            {slides.map((slide, i) => (
                <div key={i} className="nt-hero__slide" hidden={i !== index} role={multiple ? 'group' : undefined} aria-roledescription={multiple ? 'slide' : undefined} aria-label={multiple ? `${i + 1} of ${slides.length}` : undefined}>
                    <div className="nt-hero__media order-lg-2">
                        <Media image={slide.image} sizes="(min-width: 992px) 50vw, 100vw" priority={i === 0} />
                    </div>
                    <div className="nt-hero__content order-lg-1">
                        {data.badges?.length ? (
                            <p className="nt-hero__badges nt-hero-in" style={{ '--d': 0 }} aria-label="Focus areas">
                                {data.badges.map((badge) => (
                                    <span key={badge.text}>{badge.text}</span>
                                ))}
                            </p>
                        ) : null}
                        {i === 0 ? (
                            <h1 className="nt-hero__title nt-hero-in" style={{ '--d': 1 }}>{slide.title}</h1>
                        ) : (
                            <h2 className="nt-hero__title nt-hero-in" style={{ '--d': 1 }}>{slide.title}</h2>
                        )}
                        {slide.body ? <p className="nt-hero__body nt-hero-in" style={{ '--d': 2 }}>{slide.body}</p> : null}
                        {slide.cta_label && slide.cta_url ? <Cta label={slide.cta_label} url={slide.cta_url} variant="light" className="mt-4 align-self-start nt-hero-in" style={{ '--d': 3 }} /> : null}
                        {multiple ? (
                            <div className="nt-carousel__dots nt-hero__dots">
                                {slides.map((_, d) => (
                                    <button key={d} type="button" aria-label={`Show slide ${d + 1}`} aria-current={d === index ? 'true' : undefined} onClick={() => go(d)} />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            ))}
            {multiple ? (
                <button type="button" className="nt-hero__next" aria-label="Next slide" onClick={() => go(index + 1)}>
                    <Icon name="arrowRight" strokeWidth={2} />
                </button>
            ) : null}
        </section>
    );
}

function BlueprintText({ item, className }) {
    return (
        <div className={`nt-blueprint__text ${className}`}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {item.link_url ? (
                <SmartLink href={item.link_url} className="nt-link-arrow" aria-label={`Learn more about ${item.title}`}>
                    <ArrowDot />
                </SmartLink>
            ) : null}
        </div>
    );
}

export function FeatureBlocks({ data }) {
    const items = data.items ?? [];
    const listRef = useRef(null);

    // Cards stack while scrolling: each sticks near the top and the next slides over it.
    // A covered card shrinks and dims slightly. Active on all screens.
    useEffect(() => {
        const list = listRef.current;
        if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
        let frame = 0;
        const update = () => {
            frame = 0;
            const cards = [...list.querySelectorAll('.nt-blueprint__block')];
            cards.forEach((card, i) => {
                const next = cards[i + 1];
                if (!next) return card.style.removeProperty('--cover');
                const box = card.getBoundingClientRect();
                const covered = 1 - (next.getBoundingClientRect().top - box.top) / box.height;
                card.style.setProperty('--cover', Math.min(1, Math.max(0, covered)).toFixed(3));
            });
        };
        const onScroll = () => (frame ||= requestAnimationFrame(update));
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return (
        <section className="nt-section nt-blueprint" aria-labelledby="blueprint-heading">
            <div className="container" ref={listRef}>
                {data.eyebrow ? (
                    <div className="d-flex justify-content-center mb-3">
                        <span className="nt-pill">{data.eyebrow}</span>
                    </div>
                ) : null}
                {data.heading ? (
                    <h2 className="nt-blueprint__heading" id="blueprint-heading">
                        {data.heading}
                    </h2>
                ) : null}
                <div className="nt-blueprint__pairs">
                    {items.map((item, i) => (
                        <div key={i} className="nt-blueprint__block" style={{ '--i': i }}>
                            <div className="nt-blueprint__text">
                                <h3>{item.title}</h3>
                                <p>{item.body}</p>
                                {item.link_url ? (
                                    <SmartLink href={item.link_url} className="nt-link-arrow" aria-label={`Learn more about ${item.title}`}>
                                        <ArrowDot />
                                    </SmartLink>
                                ) : null}
                            </div>
                            <Media className="nt-blueprint__img" image={item.image} sizes="(min-width: 992px) 50vw, 100vw" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function AcademicsTabs({ data }) {
    const tabs = [
        { key: 'schools', label: data.schools_label || 'Schools', items: data.schools, heading: data.schools_heading, body: data.schools_body },
        { key: 'centres', label: data.centres_label || 'Centres', items: data.centres, heading: data.centres_heading, body: data.centres_body },
        { key: 'programs', label: data.programs_label || 'Programs', items: data.programs, heading: data.programs_heading, body: data.programs_body, groups: data.program_groups },
    ].filter((t) => t.items?.length || t.groups?.length);
    const initial = Math.max(0, tabs.findIndex((t) => t.key === (data.default_tab || 'programs')));
    const [active, setActive] = useState(initial);
    const [group, setGroup] = useState(0);
    const id = useId();
    const refs = useRef([]);
    if (!tabs.length) return null;
    const tab = tabs[active] ?? tabs[0];
    const groups = tab.groups?.length ? tab.groups : null;
    const items = groups ? groups[Math.min(group, groups.length - 1)].programs : tab.items;
    const select = (i) => {
        const next = (i + tabs.length) % tabs.length;
        setActive(next);
        setGroup(0);
        refs.current[next]?.focus();
    };

    return (
        <section className="nt-section nt-divider nt-academics" aria-labelledby="academics-heading">
            <div className="container">
                {/* The heading and introduction follow the selected tab (client copy). */}
                <div className="text-center mx-auto nt-academics__head" style={{ maxWidth: '52rem' }}>
                    <SectionHeading eyebrow={data.eyebrow} heading={tab.heading || data.heading} id="academics-heading" />
                    {tab.body ? (
                        <div className="nt-academics__intro nt-fade-in" key={tab.key}>
                            {tab.body.split(/\n{2,}/).map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    ) : null}
                </div>
                <div className="nt-tabs mt-4 mt-lg-5" role="tablist" aria-label={data.eyebrow || 'Schools, centres and programs'}>
                    {tabs.map((t, i) => (
                        <button
                            key={t.key}
                            ref={(el) => (refs.current[i] = el)}
                            type="button"
                            role="tab"
                            id={`${id}-tab-${i}`}
                            aria-selected={i === active}
                            aria-controls={`${id}-panel`}
                            tabIndex={i === active ? 0 : -1}
                            onClick={() => select(i)}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowRight') select(i + 1);
                                else if (e.key === 'ArrowLeft') select(i - 1);
                                else return;
                                e.preventDefault();
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
                    {groups && groups.length > 1 ? (
                        <div className="nt-chips" role="group" aria-label="Program level">
                            {groups.map((g, i) => (
                                <button key={g.key} type="button" aria-pressed={i === group} onClick={() => setGroup(i)}>
                                    {g.label}
                                    <span className="nt-chips__count">{g.programs.length}</span>
                                </button>
                            ))}
                        </div>
                    ) : null}
                    <div className="nt-fade-in" key={`${tab.key}-${group}`}>
                        <Carousel label={groups ? groups[Math.min(group, groups.length - 1)].label : tab.label} slideWidth="min(73rem, 88%)" className="nt-carousel--programs">
                            {items.map((item) => (
                                <ProgramCard key={item.id} item={item} />
                            ))}
                        </Carousel>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function PartnersShowcase({ data }) {
    return (
        <section className="nt-section nt-divider" aria-labelledby="partners-heading">
            <div className="container">
                <div className="nt-split-head">
                    <div>
                        <SectionHeading eyebrow={data.eyebrow} heading={data.heading} id="partners-heading" className="mb-0" />
                    </div>
                    <div className="nt-split-head__aside">
                        {data.body ? <p className="nt-lead">{data.body}</p> : null}
                        <div className="nt-split-head__actions">
                            <Cta label={data.cta_label} url={data.cta_url} />
                            <Cta label={data.cta2_label} url={data.cta2_url} />
                            <Cta label={data.cta3_label} url={data.cta3_url} />
                        </div>
                    </div>
                </div>
            </div>
            {data.logos?.length ? (
                <div className="container-fluid px-0 nt-marquee" style={{ '--nt-marquee-duration': `${Math.max(data.logos.length, 4) * 4}s` }}>
                    {/* The logos are listed twice so the strip scrolls right to left without a gap; the copy is hidden from assistive technology. */}
                    <ul className="nt-logos nt-marquee__track list-unstyled m-0" aria-label="Partners">
                        {[false, true].flatMap((copy) =>
                            data.logos.map((logo) => (
                                <li key={`${copy ? 'copy-' : ''}${logo.id}`} aria-hidden={copy || undefined}>
                                    {logo.url ? (
                                        <a href={logo.url} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined}>
                                            <img src={logo.logo?.src} width={logo.logo?.width} height={logo.logo?.height} alt={`${logo.name} (opens in a new tab)`} loading="lazy" />
                                        </a>
                                    ) : (
                                        <img src={logo.logo?.src} width={logo.logo?.width} height={logo.logo?.height} alt={logo.name} loading="lazy" />
                                    )}
                                </li>
                            )),
                        )}
                    </ul>
                </div>
            ) : null}
            {data.stories?.length ? (
                <div className="container nt-stories-wrap">
                    <Carousel label="Partner stories" slideWidth="min(54.75rem, calc(100vw - 3rem))" gap="3rem" align="center" startIndex={1} className="nt-carousel--stories">
                        {data.stories.map((story) => (
                            <StoryCard key={story.id} item={story} />
                        ))}
                    </Carousel>
                    {data.stories_cta_label && data.stories_cta_url ? (
                        <div className="text-center mt-4">
                            <Cta label={data.stories_cta_label} url={data.stories_cta_url} variant="outline" />
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
}

export function FacultyShowcase({ data }) {
    const all = data.people ?? [];
    // Residential / Visiting faculty switch, shown when featured faculty of both kinds exist.
    const kinds = [
        ['residential', 'Residential Faculty'],
        ['visiting', 'Visiting Faculty'],
    ].filter(([key]) => all.some((p) => (p.category || 'residential') === key));
    const [kind, setKind] = useState(kinds[0]?.[0] ?? 'residential');
    const people = kinds.length > 1 ? all.filter((p) => (p.category || 'residential') === kind) : all;
    if (!all.length && !data.heading) return null;
    return (
        <section className="nt-section nt-faculty" aria-labelledby="faculty-heading">
            <div className="container">
                <div className="nt-faculty__grid">
                    <div>
                        <SectionHeading eyebrow={data.eyebrow} heading={data.heading} id="faculty-heading" />
                        {data.body ? <p className="nt-lead">{data.body}</p> : null}
                        <Cta label={data.cta_label} url={data.cta_url} className="mt-3" />
                    </div>
                    {people.length ? (
                        <div>
                            {kinds.length > 1 ? (
                                <div className="nt-chips" role="group" aria-label="Faculty type">
                                    {kinds.map(([key, label]) => (
                                        <button key={key} type="button" aria-pressed={kind === key} onClick={() => setKind(key)}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                            <Carousel key={kind} label="Faculty profiles" slideWidth="min(22.25rem, 78%)" gap="2.5rem" autoplay={4000}>
                                {people.map((person) => (
                                    <PersonCard key={person.id} person={person} />
                                ))}
                            </Carousel>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

function LabSlide({ slide, active }) {
    const [playing, setPlaying] = useState(false);
    const embed = slide.video_url ? toEmbedUrl(slide.video_url) : null;
    return (
        <figure className={`nt-lab-slide m-0 ${active ? 'is-active' : ''}`}>
            {playing && embed ? (
                <iframe src={embed} title={slide.caption_start || 'Lab video'} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="w-100 h-100 position-absolute top-0 start-0 border-0" />
            ) : (
                <>
                    <Media image={slide.image} sizes="(min-width: 1200px) 1012px, 88vw" className="w-100 h-100 position-absolute top-0 start-0" />
                    {embed ? (
                        <button type="button" className="nt-lab-slide__play" onClick={() => setPlaying(true)} aria-label={`Play video: ${slide.caption_start || 'lab video'}`}>
                            <Icon name="play" />
                        </button>
                    ) : null}
                    {slide.caption_start || slide.caption_end ? (
                        <figcaption className="nt-lab-slide__caption">
                            {slide.caption_start ? (
                                <span className="nt-lab-slide__phrase">
                                    <span>{slide.caption_start}</span>
                                </span>
                            ) : null}
                            {slide.caption_start && slide.caption_end ? <hr aria-hidden="true" /> : null}
                            {slide.caption_end ? (
                                <span className="nt-lab-slide__phrase">
                                    <span>{slide.caption_end}</span>
                                </span>
                            ) : null}
                        </figcaption>
                    ) : null}
                </>
            )}
        </figure>
    );
}

export function LabsShowcase({ data }) {
    const sectionRef = useRef(null);
    const [index, setIndex] = useState(0);
    // The centred slide grows into focus and its caption animates in once the gallery is on screen.
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node || !('IntersectionObserver' in window)) {
            setInView(true);
            return undefined;
        }
        const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold: 0.35 });
        io.observe(node);
        return () => io.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="nt-section nt-labs on-dark" aria-labelledby="labs-heading">
            <div className="container">
                <div className="nt-split-head">
                    <div>
                        <SectionHeading eyebrow={data.eyebrow} heading={data.heading} id="labs-heading" className="mb-0" />
                    </div>
                    <div className="nt-split-head__aside pt-lg-5">
                        {data.body ? <p className="nt-lead">{data.body}</p> : null}
                        <Cta label={data.cta_label} url={data.cta_url} variant="light" className="mt-2" />
                    </div>
                </div>
                {data.slides?.length ? (
                    <Carousel label="Labs gallery" slideWidth="min(63.25rem, 88%)" gap="0rem" align="center" startIndex={1} trackClassName="nt-labs__track" onIndexChange={setIndex}>
                        {data.slides.map((slide, i) => (
                            <LabSlide key={i} slide={slide} active={inView && i === index} />
                        ))}
                    </Carousel>
                ) : null}
            </div>
        </section>
    );
}

export function CampusShowcase({ data }) {
    const items = data.gallery?.items ?? [];
    const [active, setActive] = useState(0);
    const current = items[active] ?? null;

    return (
        <section className="nt-section nt-campus" aria-labelledby="campus-heading">
            <div className="container">
                <div className="nt-split-head">
                    <div>
                        <SectionHeading eyebrow={data.eyebrow} heading={data.heading} id="campus-heading" className="mb-0" />
                    </div>
                    {data.body ? (
                        <div className="nt-split-head__aside">
                            <p className="nt-lead">{data.body}</p>
                        </div>
                    ) : null}
                </div>
                <div className="nt-campus__grid">
                    <div className="nt-campus__main">
                        {current ? <Media image={current.image} sizes="(min-width: 992px) 40vw, 100vw" className="w-100 h-100" /> : null}
                        {data.gallery?.virtual_tour_url ? (
                            <a className="nt-campus__badge" href={data.gallery.virtual_tour_url} target="_blank" rel="noopener noreferrer" aria-label="360° virtual tour (opens in a new tab)">
                                <Icon name="image" /> 360°
                            </a>
                        ) : null}
                    </div>
                    <div className="nt-campus__feature">
                        {data.feature_title ? <h3>{data.feature_title}</h3> : null}
                        {data.feature_body ? <p>{data.feature_body}</p> : null}
                        <div className="d-flex flex-wrap gap-3 mt-2">
                            <Cta label={data.cta_label} url={data.cta_url} />
                            <TourButton gallery={data.gallery} label={data.tour_label || 'Virtual tour'} />
                        </div>
                        {items.length > 1 ? (
                            <div className="nt-campus__thumbs" role="group" aria-label="Choose campus photo">
                                {items.map((item, i) => (
                                    <button key={item.id} type="button" aria-pressed={i === active} onClick={() => setActive(i)} aria-label={`Show photo ${i + 1}${item.image?.alt ? `: ${item.image.alt}` : ''}`}>
                                        <Media image={item.image} sizes="140px" alt="" />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function Mission({ data }) {
    return (
        <section className="nt-section nt-mission on-dark" aria-labelledby="mission-heading">
            {/* Decorative India map from the design; its dots pulse in turn (see india-map.svg). */}
            <img src={indiaMap} alt="" aria-hidden="true" className="nt-mission__map nt-reveal" width="1440" height="1512" decoding="async" />
            <div className="container">
                {data.heading ? (
                    <h2 className="nt-mission__heading" id="mission-heading">
                        {data.heading}
                    </h2>
                ) : null}
                {data.body ? <p className="nt-mission__body">{data.body}</p> : null}
                {data.statistics?.length ? (
                    <dl className="nt-mission__stats">
                        {data.statistics.map((stat) => (
                            <div key={stat.label}>
                                <dt className="visually-hidden">{stat.label}</dt>
                                <dd className="m-0">
                                    <strong data-countup={stat.value}>{stat.value}</strong>
                                    <span>{stat.label}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>
                ) : null}
                {data.initiatives?.length ? (
                    <>
                        {/* Desktop: 3-column layout matching Figma handoff */}
                        <div className="d-none d-md-grid nt-mission__cards" style={{ gridTemplateColumns: `repeat(${Math.min(3, data.initiatives.length || 3)}, minmax(0, 1fr))` }}>
                            {data.initiatives.map((item) => (
                                <IconCard key={item.id} icon={item.icon} title={item.title} body={item.body} />
                            ))}
                        </div>
                        <div className="d-md-none">
                            <Carousel label="Mission initiatives" slideWidth="85%" gap="1rem" showArrows={false}>
                                {data.initiatives.map((item) => (
                                    <IconCard key={item.id} icon={item.icon} title={item.title} body={item.body} />
                                ))}
                            </Carousel>
                        </div>
                    </>
                ) : null}
                {data.cta_label && data.cta_url ? (
                    <div className="text-center mt-5">
                        <Cta label={data.cta_label} url={data.cta_url} variant="light" />
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export function NewsCarousel({ data }) {
    if (!data.posts?.length) return null;
    return (
        <section className="nt-section" aria-labelledby="news-heading">
            <div className="container">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 mb-lg-5">
                    <h2 className="nt-h2 m-0" id="news-heading">
                        {data.heading || 'News & Insights'}
                    </h2>
                    <Cta label={data.cta_label} url={data.cta_url} className="d-none d-md-inline-flex" />
                </div>
                <Carousel label={data.heading || 'News'} slideWidth="min(21.25rem, 82%)" gap="2rem">
                    {data.posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </Carousel>
                <div className="text-center mt-4 d-md-none">
                    <Cta label={data.cta_label} url={data.cta_url} />
                </div>
            </div>
        </section>
    );
}
