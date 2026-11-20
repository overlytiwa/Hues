export default function Icon({ name, size = 24, ...props }) {
  const paths = {
    tv: <><rect x="3" y="4" width="18" height="13" rx="2.5" /><path d="M8 21h8m-4-4v4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 18 17" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.2 9a2.8 2.8 0 1 1 4.3 2.4c-1 .6-1.5 1.1-1.5 2.6m0 3h.01" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4.5 4.5L19 7" />,
    link: <><path d="m10 13 4-4m-6 6-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m2 2 1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" /></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 5h2m-2 14h2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
