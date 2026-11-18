// Inline SVG icon set (stroke icons, inherit currentColor). Decorative by default.
const paths = {
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
    arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronLeft: <path d="m15 6-6 6 6 6" />,
    chevronRight: <path d="m9 6 6 6-6 6" />,
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    download: <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    play: <path d="M8 5v14l11-7z" fill="currentColor" />,
    pause: <path d="M9 5v14M15 5v14" />,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
    phoneChat: {
        viewBox: '0 0 23 23',
        fill: 'currentColor',
        stroke: 'none',
        content: (
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.7811 0H21.014C22.1076 0 23 0.891889 23 1.9849V7.29483C23 8.38784 22.1076 9.27973 21.014 9.27973H16.818L13.992 11.3847C13.5939 11.6807 13.0378 11.3809 13.0383 10.9048H13.0365V9.27973C12.3732 9.27973 11.8797 9.19872 11.378 8.69707C11.0185 8.33776 10.7953 7.84121 10.7953 7.29483V1.9849C10.7953 1.45616 11.0234 0.921022 11.3793 0.583689L11.378 0.582667C11.7376 0.2231 12.2344 0 12.7811 0ZM21.2219 22.9977C22.1917 23.0475 23 22.2806 23 21.311L22.9969 17.4654C22.9967 16.7044 22.5027 16.0512 21.7742 15.8416L21.7737 15.8437L17.7255 14.6781C17.21 14.5296 16.6981 14.6193 16.2662 14.9329L14.5799 16.1578C14.4298 16.2669 14.2378 16.2896 14.078 16.2063C11.0454 14.627 8.42499 11.9613 6.80924 8.95058L6.80822 8.95109C6.71566 8.77706 6.7287 8.58922 6.84606 8.42797L8.07162 6.74258C8.38536 6.31095 8.47511 5.79932 8.32655 5.28438L7.17412 1.28621C6.99258 0.540245 6.31498 0.0158444 5.53766 0.0158444L1.68967 0.0127778C0.719554 0.0127778 -0.0477943 0.820589 0.00232241 1.78991C0.593495 13.2332 9.76945 22.4048 21.2219 22.9977ZM7.38789 15.6162C10.9855 19.2119 15.8663 21.5234 21.283 21.8037C21.5668 21.8183 21.801 21.6008 21.801 21.3108V18.8804H21.8028L21.8026 17.4649C21.8026 17.2388 21.6665 17.0558 21.4464 16.9927L21.4469 16.9906L17.3974 15.8248C17.244 15.7806 17.1 15.8064 16.9689 15.9017L15.2825 17.1266C14.7512 17.5125 14.0695 17.5587 13.4901 17.2477C10.2046 15.4836 7.51829 12.8021 5.75526 9.51715L5.75628 9.51663C5.44075 8.94496 5.49266 8.25342 5.87646 7.7257C6.0782 7.44817 7.15494 6.05028 7.19228 5.83663C7.20506 5.7638 7.20071 5.68816 7.17872 5.612L6.01019 1.56553C5.94729 1.34576 5.7637 1.20954 5.53766 1.20954C4.85392 1.20954 1.6843 1.16584 1.49406 1.24737C1.30766 1.32736 1.18569 1.5157 1.19668 1.72883C1.47744 7.14252 3.79022 12.0208 7.38789 15.6162ZM13.8846 6.32526H18.243C19.0323 6.32526 19.0323 5.1267 18.243 5.1267H13.8846C13.0953 5.1267 13.0953 6.32526 13.8846 6.32526ZM13.8846 4.15303H19.9104C20.6997 4.15303 20.6997 2.95448 19.9104 2.95448H13.8846C13.0953 2.95448 13.0953 4.15303 13.8846 4.15303ZM21.014 1.19856H12.7811C12.5652 1.19856 12.3686 1.28723 12.2257 1.43009L12.2244 1.42881C12.0822 1.57141 11.994 1.76819 11.994 1.9849V7.29483C11.994 7.72596 12.3494 8.08118 12.7808 8.08118H13.6359C13.967 8.08118 14.2355 8.34951 14.2355 8.68046V9.71316L16.2279 8.22915C16.3332 8.13689 16.4713 8.08118 16.6221 8.08118H21.0137C21.4451 8.08118 21.8005 7.72596 21.8005 7.29483V1.9849C21.801 1.55352 21.4456 1.19856 21.014 1.19856Z"
            />
        ),
    },
    plusCircle: {
        viewBox: '0 0 32 32',
        fill: 'currentColor',
        stroke: 'none',
        content: (
            <path d="M16 3C13.4288 3 10.9154 3.76244 8.77759 5.1909C6.63975 6.61935 4.97351 8.64968 3.98957 11.0251C3.00563 13.4006 2.74819 16.0144 3.2498 18.5362C3.75141 21.0579 4.98953 23.3743 6.80762 25.1924C8.6257 27.0105 10.9421 28.2486 13.4638 28.7502C15.9856 29.2518 18.5995 28.9944 20.9749 28.0104C23.3503 27.0265 25.3807 25.3603 26.8091 23.2224C28.2376 21.0846 29 18.5712 29 16C28.9957 12.5535 27.6247 9.2494 25.1876 6.81236C22.7506 4.37532 19.4465 3.0043 16 3ZM21 17H17V21C17 21.2652 16.8946 21.5196 16.7071 21.7071C16.5196 21.8946 16.2652 22 16 22C15.7348 22 15.4804 21.8946 15.2929 21.7071C15.1054 21.5196 15 21.2652 15 21V17H11C10.7348 17 10.4804 16.8946 10.2929 16.7071C10.1054 16.5196 10 16.2652 10 16C10 15.7348 10.1054 15.4804 10.2929 15.2929C10.4804 15.1054 10.7348 15 11 15H15V11C15 10.7348 15.1054 10.4804 15.2929 10.2929C15.4804 10.1054 15.7348 10 16 10C16.2652 10 16.5196 10.1054 16.7071 10.2929C16.8946 10.4804 17 10.7348 17 11V15H21C21.2652 15 21.5196 15.1054 21.7071 15.2929C21.8946 15.4804 22 15.7348 22 16C22 16.2652 21.8946 16.5196 21.7071 16.7071C21.5196 16.8946 21.2652 17 21 17Z" />
        ),
    },
    graduate: {
        viewBox: '0 0 39 39',
        fill: 'none',
        stroke: 'currentColor',
        content: (
            <>
                <path d="M38.4139 11.2748L19.414 22.1253L0.414062 11.2748L19.414 0.415039L38.4139 11.2748Z" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M5.8418 14.3408V24.8455L19.4118 32.9856L32.9818 24.8455V14.3408" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M38.4141 11.2754V38.4155" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M19.4121 25.752V32.9856" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M11.2635 8.55469L6.74023 11.2743L11.2635 13.9846" strokeWidth="1.2" strokeLinejoin="round" />
            </>
        ),
    },
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </>
    ),
    pin: (
        <>
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </>
    ),
    trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
    image: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 16 5-5 4 4 3-3 6 6" />
        </>
    ),
    tour: (
        <>
            <ellipse cx="12" cy="13" rx="9" ry="4" />
            <path d="M16 6.5A9 4 0 0 1 21 9" />
            <path d="m19 6 2 3-3 1" />
        </>
    ),
    document: (
        <>
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v5h5M10 13h6M10 17h6" />
        </>
    ),
    external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
    graduation: (
        <>
            <path d="M2 9.5 12 5l10 4.5L12 14z" />
            <path d="M6 11.5V16c3 2.5 9 2.5 12 0v-4.5M22 9.5V15" />
        </>
    ),
    book: {
        viewBox: '0 0 39 38',
        fill: 'none',
        stroke: 'currentColor',
        content: (
            <>
                <path d="M35.3168 9.66879C35.1825 8.50884 34.4104 7.36546 33.0089 6.47893C29.9038 4.50702 24.8601 4.50702 21.7549 6.47893C20.3534 7.36546 19.5814 8.50884 19.4471 9.66879H19.4219V29.711C19.4219 28.4185 20.2024 27.1343 21.7549 26.1483C24.8601 24.1764 29.9038 24.1764 33.0089 26.1483C34.5615 27.1343 35.342 28.4185 35.342 29.711V9.66879H35.3168Z" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M19.3812 9.66879C19.2469 8.50884 18.4749 7.36546 17.0734 6.47893C13.9682 4.50702 8.92452 4.50702 5.81939 6.47893C4.41789 7.36546 3.64581 8.50884 3.51153 9.66879H3.48633V29.711C3.48633 28.4185 4.26683 27.1343 5.81939 26.1483C8.92452 24.1764 13.9682 24.1764 17.0734 26.1483C18.6259 27.1343 19.4064 28.4185 19.4064 29.711V9.66879H19.3812Z" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M3.5108 9.77637H0.414062V33.0002H38.4141V9.77637H35.3425" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M33.0098 10.7298C29.9047 7.96247 24.861 7.96247 21.7559 10.7298" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M17.0743 10.7298C13.9691 7.96247 8.92544 7.96247 5.82031 10.7298" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M33.0098 14.6477C29.9047 11.8804 24.861 11.8804 21.7559 14.6477" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M17.0743 14.6477C13.9691 11.8804 8.92544 11.8804 5.82031 14.6477" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M33.0098 18.5677C29.9047 15.8004 24.861 15.8004 21.7559 18.5677" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M17.0743 18.5677C13.9691 15.8004 8.92544 15.8004 5.82031 18.5677" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M33.0098 22.4856C29.9047 19.7183 24.861 19.7183 21.7559 22.4856" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M17.0743 22.4856C13.9691 19.7183 8.92544 19.7183 5.82031 22.4856" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M3.48633 29.7188H35.3433" strokeWidth="1.2" strokeLinejoin="round" />
            </>
        ),
    },
    people: {
        viewBox: '0 0 38 38',
        fill: 'none',
        stroke: 'currentColor',
        content: (
            <>
                <path d="M14.5312 35H4.68361L4.68361 17.8169C4.68361 15.4243 6.61164 13.4841 8.98925 13.4841H10.2169C12.5946 13.4841 14.5226 15.4243 14.5226 17.8169L14.5226 35H14.5312Z" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M9.60928 3C11.8918 3 13.742 4.86187 13.742 7.15875C13.742 9.45563 11.8918 11.3175 9.60928 11.3175C7.32677 11.3175 5.47656 9.45563 5.47656 7.15875C5.47656 4.86187 7.32677 3 9.60928 3Z" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M9.61133 34.9996V24.2373" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M25.2063 13.4756C25.3101 13.4756 25.4052 13.4756 25.5089 13.4756C28.8895 13.6496 31.2065 17.0166 30.3506 20.314L29.3391 24.2292L33.3162 34.9915H17.0879L21.065 24.2292L20.0534 20.314C19.2061 17.0166 21.5146 13.6496 24.8951 13.4756C24.9988 13.4756 25.094 13.4756 25.1977 13.4756H25.2063Z" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M25.2069 3C27.4894 3 29.3397 4.86187 29.3397 7.15875C29.3397 9.45563 27.4894 11.3175 25.2069 11.3175C22.9244 11.3175 21.0742 9.45563 21.0742 7.15875C21.0742 4.86187 22.9244 3 25.2069 3Z" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M21.0664 24.2373H25.8562" strokeWidth="1.2" strokeLinejoin="round" />
            </>
        ),
    },
    factory: <path d="M3 21V10l5 3V10l5 3V10l5 3V4h3v17zM7 17h2M12 17h2M17 17h2" />,
    chip: (
        <>
            <rect x="7" y="7" width="10" height="10" rx="1" />
            <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
        </>
    ),
    robot: <path d="M4 21h8M8 21v-5l5-5 4 2M13 11l-2-4 3-3 3 3M17 13l2 3" />,
    leaf: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7" />,
    globe: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </>
    ),
    handshake: <path d="m3 11 4-4 4 2 2-2 4 1 4 4-6 6-3-3-2 2-3-3-2 2zM10 9l3 3" />,
    chart: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />,
    lightbulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3" />,
    gear: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
        </>
    ),
    flask: <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 14h9" />,
    award: (
        <>
            <circle cx="12" cy="9" r="5" />
            <path d="m9 13.5-2 7.5 5-3 5 3-2-7.5" />
        </>
    ),
    building: <path d="M4 21V5l8-2v18M12 7l8 2v12M3 21h18M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2" />,
    linkedin: <path d="M6 9v9M6 6v.01M10 18v-5a3 3 0 0 1 6 0v5M10 9v9" />,
    x: <path d="m4 4 16 16M20 4 4 20" />,
    youtube: (
        <>
            <rect x="3" y="6" width="18" height="12" rx="4" />
            <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" />
        </>
    ),
    instagram: (
        <>
            <rect x="4" y="4" width="16" height="16" rx="5" />
            <circle cx="12" cy="12" r="3.5" />
            <path d="M17 7v.01" />
        </>
    ),
    calendar: (
        <>
            <rect x="3.5" y="5" width="17" height="15" rx="2" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
        </>
    ),
    check: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="m8.5 12 2.5 2.5 4.5-5" />
        </>
    ),
    bank: <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />,
    rupee: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M9 8h6M9 10.5h6M11 8c3 0 3 5 0 5H9l4.5 3.5" />
        </>
    ),
    id: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="11" r="2" />
            <path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14.5 10h4M14.5 13h3" />
        </>
    ),
    portfolio: <path d="M4 8h16v11H4zM9 8V5.5h6V8M4 12.5h16" />,
    sparkle: <path d="M12 3c.6 4.5 2.5 6.4 7 7-4.5.6-6.4 2.5-7 7-.6-4.5-2.5-6.4-7-7 4.5-.6 6.4-2.5 7-7ZM18.5 16.5c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2Z" />,
    cap: (
        <>
            <path d="M2 9.5 12 5l10 4.5L12 14z" />
            <path d="M6 11.5V16c3 2.5 9 2.5 12 0v-4.5" />
        </>
    ),
    bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
    drone: (
        <>
            <circle cx="5.5" cy="6" r="2.5" />
            <circle cx="18.5" cy="6" r="2.5" />
            <path d="M7.5 7.5 10 10h4l2.5-2.5M10 10v4h4v-4M9 18l1-4M15 18l-1-4" />
        </>
    ),
    magnet: <path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4zM6 8h4M14 8h4" />,
    code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
    quote: <path d="M5 17c0-4 1-7 5-9M14 17c0-4 1-7 5-9M5 17h4v-4H5zM14 17h4v-4h-4z" />,
    facebook: <path d="M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.5 1.5-1.5H18V3h-3a4 4 0 0 0-4 4v2.5H8V13h3v8" />,
};

export default function Icon({ name, title, className, strokeWidth = 1.6 }) {
    const raw = paths[name] ?? paths.document;
    const isCustom = raw && typeof raw === 'object' && !raw.$$typeof && 'content' in raw;
    const viewBox = isCustom ? raw.viewBox : '0 0 24 24';
    const fill = isCustom ? raw.fill : 'none';
    const stroke = isCustom ? raw.stroke : 'currentColor';
    const content = isCustom ? raw.content : raw;

    return (
        <svg
            viewBox={viewBox}
            fill={fill}
            stroke={stroke}
            strokeWidth={stroke === 'none' ? undefined : strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden={title ? undefined : true}
            role={title ? 'img' : undefined}
            focusable="false"
        >
            {title ? <title>{title}</title> : null}
            {content}
        </svg>
    );
}

export function ArrowDot() {
    return (
        <span className="nt-arrow-dot" aria-hidden="true">
            <Icon name="arrowRight" strokeWidth={2.2} />
        </span>
    );
}

/** "360°" virtual tour mark from the header design: the figure above an orbit arrow. */
export function Tour360Icon({ className }) {
    return (
        <svg viewBox="0 0 36 20" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
            <text x="18.5" y="9" textAnchor="middle" fontSize="9.5" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif" fill="currentColor" stroke="none" letterSpacing="-0.2">
                360°
            </text>
            <path d="M6.2 8.4C2.2 10 2.4 15.7 17.5 16.2C29.8 16.5 35.2 13.9 32.3 10.3" />
            <path d="M14.3 14.2L16.9 16.2L14.3 18.2" />
        </svg>
    );
}
