/**
 * Responsive Typography Components
 * Fluid scaling based on viewport, platform-optimized
 */

import { type ReactNode, type CSSProperties } from 'react';
import { TYPOGRAPHY, BREAKPOINTS, detectPlatform } from '../utils/responsive';

type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'caption' | 'overline';
type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface ResponsiveTextProps {
  children: ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  align?: TextAlign;
  color?: string;
  arabic?: boolean;
  noMargin?: boolean;
  truncate?: boolean;
  lines?: number; // For line clamping
  style?: CSSProperties;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export function ResponsiveText({
  children,
  variant = 'body',
  weight = 'normal',
  align = 'left',
  color,
  arabic = false,
  noMargin = false,
  truncate = false,
  lines,
  style,
  className,
  as,
}: ResponsiveTextProps) {
  const platform = detectPlatform();

  // Map variant to font size
  const variantSizeMap: Record<TextVariant, keyof typeof TYPOGRAPHY.fontSize> = {
    display: '5xl',
    h1: '4xl',
    h2: '3xl',
    h3: '2xl',
    h4: 'xl',
    h5: 'lg',
    body: 'base',
    caption: 'sm',
    overline: 'xs',
  };

  // Map variant to default element
  const variantElementMap: Record<TextVariant, string> = {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    body: 'p',
    caption: 'span',
    overline: 'span',
  };

  // Map variant to default weight
  const variantWeightMap: Record<TextVariant, TextWeight> = {
    display: 'black',
    h1: 'bold',
    h2: 'bold',
    h3: 'semibold',
    h4: 'semibold',
    h5: 'medium',
    body: 'normal',
    caption: 'normal',
    overline: 'semibold',
  };

  // Map variant to line height
  const variantLineHeightMap: Record<TextVariant, number> = {
    display: TYPOGRAPHY.lineHeight.tight,
    h1: TYPOGRAPHY.lineHeight.tight,
    h2: TYPOGRAPHY.lineHeight.snug,
    h3: TYPOGRAPHY.lineHeight.snug,
    h4: TYPOGRAPHY.lineHeight.normal,
    h5: TYPOGRAPHY.lineHeight.normal,
    body: TYPOGRAPHY.lineHeight.relaxed,
    caption: TYPOGRAPHY.lineHeight.normal,
    overline: TYPOGRAPHY.lineHeight.tight,
  };

  const sizeKey = variantSizeMap[variant];
  const fontSize = TYPOGRAPHY.fontSize[sizeKey];
  const Element = (as || variantElementMap[variant]) as keyof JSX.IntrinsicElements;
  const fontWeight = TYPOGRAPHY.fontWeight[weight || variantWeightMap[variant]];
  const lineHeight = variantLineHeightMap[variant];

  // Responsive font size
  const responsiveFontSize = platform.isMobile ? fontSize.mobile : fontSize.desktop;

  // Line clamping
  const lineClampStyle: CSSProperties = lines ? {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } : {};

  // Truncate
  const truncateStyle: CSSProperties = truncate ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } : {};

  const textStyle: CSSProperties = {
    fontFamily: arabic ? TYPOGRAPHY.arabic : TYPOGRAPHY.sans,
    fontSize: responsiveFontSize,
    fontWeight,
    lineHeight,
    textAlign: align,
    color: color || '#0F172A',
    margin: noMargin ? 0 : undefined,
    ...lineClampStyle,
    ...truncateStyle,
    ...style,
  };

  return (
    <Element style={textStyle} className={className} dir={arabic ? 'rtl' : 'ltr'}>
      {children}
    </Element>
  );
}

/**
 * Heading components (shortcuts)
 */
export const Heading1 = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="h1" as="h1" />
);

export const Heading2 = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="h2" as="h2" />
);

export const Heading3 = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="h3" as="h3" />
);

export const Heading4 = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="h4" as="h4" />
);

export const Heading5 = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="h5" as="h5" />
);

/**
 * Body text (paragraph)
 */
export const BodyText = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="body" as="p" />
);

/**
 * Caption text (small)
 */
export const CaptionText = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="caption" as="span" />
);

/**
 * Overline text (uppercase label)
 */
export const OverlineText = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText 
    {...props} 
    variant="overline" 
    as="span" 
    style={{ 
      textTransform: 'uppercase', 
      letterSpacing: '0.1em',
      ...props.style 
    }} 
  />
);

/**
 * Display text (hero)
 */
export const DisplayText = (props: Omit<ResponsiveTextProps, 'variant' | 'as'>) => (
  <ResponsiveText {...props} variant="display" as="h1" />
);
