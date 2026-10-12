/**
 * Text — the typographic atom.
 *
 * The ONLY way text is rendered in ShadowNet. Enforces the typography scale and
 * color tokens; there are no raw fontSize/color literals downstream.
 *
 * @param {object} props
 * @param {keyof import('../../theme/typography').type} [props.variant='body'] semantic type token
 * @param {string} [props.color='primary'] semantic color key or raw color
 * @param {'auto'|'left'|'center'|'right'} [props.align] text alignment
 * @param {number} [props.numberOfLines] truncate after N lines
 * @param {boolean} [props.uppercase] force uppercase
 * @param {object} [props.style] extra style overrides (use sparingly)
 * @param {React.ReactNode} props.children
 */
import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';

import { type } from '../../theme';
import { resolveColor } from '../../utils/theme';

function Text({
  variant = 'body',
  color = 'primary',
  align,
  numberOfLines,
  uppercase = false,
  style,
  children,
  ...rest
}) {
  const variantStyle = type[variant] || type.body;
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        variantStyle,
        { color: resolveColor(color) },
        align && { textAlign: align },
        uppercase && styles.uppercase,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  uppercase: { textTransform: 'uppercase' },
});

export default React.memo(Text);
