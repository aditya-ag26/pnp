/** Small inline icon set — no icon library needed. */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  ...props,
})

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const PawIcon = (props: IconProps) => (
  <svg {...base(props)} fill="currentColor">
    <ellipse cx="5.2" cy="10.4" rx="2" ry="2.6" transform="rotate(-18 5.2 10.4)" />
    <ellipse cx="9.4" cy="6" rx="2.1" ry="2.8" transform="rotate(-6 9.4 6)" />
    <ellipse cx="14.6" cy="6" rx="2.1" ry="2.8" transform="rotate(6 14.6 6)" />
    <ellipse cx="18.8" cy="10.4" rx="2" ry="2.6" transform="rotate(18 18.8 10.4)" />
    <path d="M12 11.2c-3.1 0-6 3.3-6 6.1 0 1.9 1.4 3 3.1 3 1.1 0 1.9-.5 2.9-.5s1.8.5 2.9.5c1.7 0 3.1-1.1 3.1-3 0-2.8-2.9-6.1-6-6.1Z" />
  </svg>
)

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
)

export const ArrowDownIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M12 4.5v15M6 13.5l6 6 6-6" />
  </svg>
)

export const HeartIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M12 20.5S3.5 15.4 3.5 9.3C3.5 6.5 5.6 4.5 8.1 4.5c1.6 0 3 .9 3.9 2.3.9-1.4 2.300-2.3 3.900-2.300 2.500 0 4.600 2 4.600 4.800 0 6.100-8.500 11.200-8.500 11.200Z" />
  </svg>
)

export const InstagramIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </svg>
)

export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
  </svg>
)

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const MinusIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M5 12h14" />
  </svg>
)

export const ResetIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5M4.5 4.5v4h4" />
  </svg>
)

export const MailIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
    <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
  </svg>
)

export const PhoneIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M6.5 3.500h3l1.500 4-2 1.500a11 11 0 0 0 6 6l1.500-2 4 1.500v3a2 2 0 0 1-2.200 2A16.500 16.500 0 0 1 4.500 5.700a2 2 0 0 1 2-2.200Z" />
  </svg>
)

export const PinIcon = (props: IconProps) => (
  <svg {...base(props)} {...stroke}>
    <path d="M12 21s-6.500-5.600-6.500-10.500a6.500 6.500 0 0 1 13 0C18.500 15.400 12 21 12 21Z" />
    <circle cx="12" cy="10.500" r="2.300" />
  </svg>
)

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
}
