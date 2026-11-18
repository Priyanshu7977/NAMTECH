import usePage from '../../hooks/usePage';
import { useId, useState } from 'react';
import Icon from '../Icon';
import SmartLink from '../SmartLink';
import NewsletterForm from './NewsletterForm';

function LinkColumn({ title, items, className = '' }) {
    const [open, setOpen] = useState(false);
    const id = useId();
    if (!items?.length) return null;

    return (
        <div className={`nt-footer__accordion ${className}`}>
            <h2>
                <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
                    {title}
                    <Icon name={open ? 'close' : 'plus'} strokeWidth={1.5} />
                </button>
            </h2>
            <ul id={id} hidden={!open}>
                {items.map((item) => (
                    <li key={item.id}>
                        <SmartLink href={item.url} newTab={item.newTab}>
                            {item.label}
                        </SmartLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const socials = [
    ['linkedin_url', 'linkedin', 'LinkedIn'],
    ['x_url', 'x', 'X'],
    ['youtube_url', 'youtube', 'YouTube'],
    ['instagram_url', 'instagram', 'Instagram'],
    ['facebook_url', 'facebook', 'Facebook'],
];

export default function Footer() {
    const { site } = usePage().props;
    const { menus = {}, settings = {} } = site ?? {};
    const phones = (settings.phones ?? []).map((p) => p.number).filter(Boolean);
    // Global settings → Show / hide; anything not switched off is shown.
    const shown = (key) => settings[key] !== false;

    return (
        <footer className="nt-footer on-dark">
            <div className="container">
                <div className="nt-footer__top">
                    <div>
                        <SmartLink href="/" className="nt-footer__logo" aria-label="NAMTECH home">
                            <img src="/images/namtech-logo-white.png" alt="NAMTECH – Institute of Manufacturing Innovation" width="700" height="192" loading="lazy" />
                        </SmartLink>
                        {shown('show_footer_social') ? (
                            <div className="nt-footer__social">
                                {socials
                                    .filter(([key]) => settings[key])
                                    .map(([key, icon, label]) => (
                                        <a key={key} href={settings[key]} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
                                            <Icon name={icon} strokeWidth={1.8} />
                                        </a>
                                    ))}
                            </div>
                        ) : null}
                    </div>
                    {shown('show_footer_newsletter') ? <NewsletterForm heading={settings.newsletter_heading ?? 'Subscribe to our newsletter'} consent={settings.newsletter_consent} /> : null}
                </div>

                {shown('show_footer_links') ? (
                    <nav className="nt-footer__links" aria-label="Footer">
                        <div className="nt-footer__col nt-footer__programs">
                            <LinkColumn title={settings.footer_programs_title || 'Programs'} items={menus.footer_programs} />
                        </div>
                        <div className="nt-footer__col">
                            <LinkColumn title={settings.footer_schools_title || 'Schools and Centers'} items={menus.footer_schools} />
                            <LinkColumn title={settings.footer_partnerships_title || 'Partnerships'} items={menus.footer_partnerships} className="mt-lg-4" />
                        </div>
                        <div className="nt-footer__col">
                            <LinkColumn title={settings.footer_quick_links_title || 'Quick Links'} items={menus.footer_quick_links} />
                        </div>
                    </nav>
                ) : null}

                {shown('show_footer_contact') ? (
                    <div className="nt-footer__contact">
                        {settings.address ? (
                            <div>
                                <Icon name="pin" />
                                <div>
                                    <strong>{settings.address_title || 'Address'}</strong>
                                    <address>{settings.address}</address>
                                </div>
                            </div>
                        ) : null}
                        {phones.length ? (
                            <div>
                                <Icon name="phone" />
                                <div>
                                    <strong>{settings.footer_contact_title || 'Contact'}</strong>
                                    {phones.map((phone) => (
                                        <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="d-block">
                                            {phone}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {settings.email ? (
                            <div>
                                <Icon name="mail" />
                                <div>
                                    <strong>Email:</strong>
                                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <div className="nt-footer__bottom">
                    <span>{settings.copyright}</span>
                    {(menus.legal ?? []).map((item) => (
                        <SmartLink key={item.id} href={item.url}>
                            {item.label}
                        </SmartLink>
                    ))}
                </div>
            </div>
        </footer>
    );
}
