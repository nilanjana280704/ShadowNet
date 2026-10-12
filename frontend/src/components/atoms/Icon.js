/**
 * Icon — outline icon atom.
 *
 * Renders a single glyph from the curated lucide set via a semantic name
 * (see constants/icons). Consistent stroke width across the app; no emojis, no
 * filled glyphs.
 *
 * @param {object} props
 * @param {keyof import('../../constants/icons').ICONS} props.name semantic icon name
 * @param {string|number} [props.size='md'] token key ('xs'..'xxl') or dp
 * @param {string} [props.color='primary'] semantic color key or raw color
 * @param {number} [props.strokeWidth=1.75] outline stroke width
 */
import React from 'react';

import { ICONS } from '../../constants/icons';
import { resolveColor, resolveIconSize } from '../../utils/theme';

function Icon({ name, size = 'md', color = 'primary', strokeWidth = 1.75, ...rest }) {
  const Glyph = ICONS[name] || ICONS.circle;
  return (
    <Glyph
      size={resolveIconSize(size)}
      color={resolveColor(color)}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}

export default React.memo(Icon);
