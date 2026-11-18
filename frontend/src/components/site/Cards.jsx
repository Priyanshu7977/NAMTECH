import Icon, { ArrowDot } from '../Icon';
import { Media } from '../ResponsiveImage';
import SmartLink from '../SmartLink';

export function ProgramCard({ item, headingLevel = 3 }) {
    const Heading = `h${headingLevel}`;
    const facts = [
        ['Mode', item.location || item.mode, item.location ? item.mode : null],
        ['Intake', item.intake, item.deadline ? `Deadline ${item.deadline}` : null],
        ['Duration', item.duration, item.duration_detail],
    ].filter(([, value]) => value);

    return (
        <article className="nt-program-card">
            <Media className="nt-program-card__media" image={item.image} sizes="(min-width: 1200px) 560px, (min-width: 768px) 50vw, 90vw" alt="" />
            <div className="nt-program-card__panel">
                <Heading>{item.url ? <SmartLink href={item.url} className="stretched-link">{item.title}</SmartLink> : item.title}</Heading>
                {item.level || item.tagline ? <p className="nt-program-card__kicker">{item.level ?? item.tagline}</p> : null}
                {item.summary ? <p>{item.summary}</p> : null}
                {facts.length ? (
                    <dl className="nt-program-card__facts">
                        {facts.map(([label, value, detail]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>
                                    {value}
                                    {detail ? <small>{detail}</small> : null}
                                </dd>
                            </div>
                        ))}
                    </dl>
                ) : item.url ? (
                    <span className="nt-link-arrow text-white mt-auto" aria-hidden="true">
                        Learn more <ArrowDot />
                    </span>
                ) : null}
            </div>
        </article>
    );
}

export function StoryCard({ item }) {
    return (
        <article className="nt-story-card">
            <Media className="nt-story-card__media" image={item.image} sizes="(min-width: 1200px) 400px, (min-width: 768px) 40vw, 90vw" alt="" />
            <div className="nt-story-card__body">
                <h3>{item.name}</h3>
                {item.summary ? <p>{item.summary}</p> : null}
                {item.url ? (
                    <SmartLink href={item.url} className="nt-link-arrow">
                        Read story<span className="visually-hidden">: {item.name}</span> <ArrowDot />
                    </SmartLink>
                ) : null}
                {item.highlight ? (
                    <p className="nt-story-card__highlight">
                        <Icon name="trend" />
                        {item.highlight}
                    </p>
                ) : null}
            </div>
        </article>
    );
}

/** Faculty card; the whole card links to the full profile. */
export function PersonCard({ person, headingLevel = 3 }) {
    const Heading = `h${headingLevel}`;
    return (
        <article className="nt-person-card">
            <Media image={person.photo} sizes="(min-width: 1200px) 356px, (min-width: 576px) 45vw, 80vw" alt="" />
            <div className="nt-person-card__overlay" />
            <div className="nt-person-card__info">
                <div className="nt-person-card__text">
                    <Heading>
                        <SmartLink href={person.url} className="stretched-link">
                            {person.name}
                        </SmartLink>
                    </Heading>
                    {person.designation ? <p>{person.designation}</p> : null}
                    {person.phone ? <p className="nt-person-card__phone">{person.phone}</p> : null}
                </div>
                <span className="nt-person-card__plus" aria-hidden="true">
                    <Icon name="plusCircle" />
                </span>
            </div>
        </article>
    );
}

export function PostCard({ post, headingLevel = 3 }) {
    const Heading = `h${headingLevel}`;
    return (
        <article className="nt-post-card">
            <Media className="nt-post-card__media" image={post.image} sizes="(min-width: 1200px) 340px, (min-width: 768px) 33vw, 85vw" alt="" />
            <div className="nt-post-card__meta">
                <span className="nt-tag">{post.reading_minutes} min{post.reading_minutes === 1 ? '' : 's'} read</span>
                {post.date ? <time dateTime={post.datetime}>{post.date}</time> : null}
            </div>
            <Heading>
                <SmartLink href={post.url} className="stretched-link">
                    {post.title}
                </SmartLink>
            </Heading>
            <span className="nt-link-arrow mt-auto" aria-hidden="true">
                Read <ArrowDot />
            </span>
        </article>
    );
}

export function IconCard({ icon, title, body, url, outlined = false, headingLevel = 3 }) {
    const Heading = `h${headingLevel}`;
    return (
        <div className={`nt-icon-card ${outlined ? 'nt-icon-card--outlined' : ''}`}>
            <span className="nt-icon-card__icon">
                <Icon name={icon || 'graduation'} strokeWidth={1.1} />
            </span>
            <Heading>{url ? <SmartLink href={url} className="stretched-link text-decoration-none">{title}</SmartLink> : title}</Heading>
            {body ? <p>{body}</p> : null}
        </div>
    );
}

export function SimpleCard({ item, headingLevel = 3, linkLabel }) {
    const Heading = `h${headingLevel}`;
    return (
        <article className="nt-simple-card">
            <Media image={item.image} sizes="(min-width: 1200px) 300px, (min-width: 768px) 33vw, 90vw" alt="" />
            {item.tag ? <span className="nt-tag align-self-start">{item.tag}</span> : null}
            <Heading>{item.url ? <SmartLink href={item.url} className="stretched-link">{item.title}</SmartLink> : item.title}</Heading>
            {item.summary ? <p>{item.summary}</p> : null}
            {item.url && linkLabel ? (
                <span className="nt-link-arrow mt-auto" aria-hidden="true">
                    {linkLabel} <ArrowDot />
                </span>
            ) : null}
        </article>
    );
}

export function EventCard({ event, headingLevel = 3 }) {
    const Heading = `h${headingLevel}`;
    return (
        <article className="nt-event-card">
            <Media className="nt-event-card__media" image={event.image} sizes="(min-width: 1200px) 360px, (min-width: 768px) 40vw, 85vw" alt="" />
            <div className="nt-event-card__body">
                {event.category ? <span className="nt-tag align-self-start">{event.category}</span> : null}
                <Heading>
                    <SmartLink href={event.url} className="stretched-link">
                        {event.title}
                    </SmartLink>
                </Heading>
                <ul className="nt-meta-list">
                    {event.date ? (
                        <li>
                            <Icon name="calendar" strokeWidth={1.6} />
                            <time dateTime={event.datetime}>{event.date}</time>
                        </li>
                    ) : null}
                    {event.time ? (
                        <li>
                            <Icon name="clock" strokeWidth={1.6} />
                            {event.time}
                        </li>
                    ) : null}
                    {event.venue ? (
                        <li>
                            <Icon name="pin" strokeWidth={1.6} />
                            {event.venue}
                        </li>
                    ) : null}
                </ul>
            </div>
        </article>
    );
}

export function PublicationCard({ item, headingLevel = 3 }) {
    const Heading = `h${headingLevel}`;
    return (
        <article className="nt-pub-card">
            <Media className="nt-pub-card__media" image={item.image} sizes="(min-width: 1200px) 360px, (min-width: 768px) 40vw, 85vw" alt="" />
            <div className="nt-pub-card__body">
                {item.school || item.topic ? <span className="nt-tag align-self-start">{item.topic || item.school}</span> : null}
                <Heading>
                    <SmartLink href={item.url} className="stretched-link">
                        {item.title}
                    </SmartLink>
                </Heading>
                {item.authors ? <p className="nt-pub-card__authors">{item.authors}</p> : null}
                <p className="nt-pub-card__meta">{[item.publisher, item.date].filter(Boolean).join(' · ')}</p>
            </div>
        </article>
    );
}

/** Four-column faculty grid (school and program pages). */
export function FacultyGrid({ people }) {
    return (
        <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-4">
            {people.map((person) => (
                <div className="col" key={person.id}>
                    <PersonCard person={person} />
                </div>
            ))}
        </div>
    );
}
