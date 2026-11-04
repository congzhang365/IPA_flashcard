export interface CalloutAnchor {
  left: number; right: number; top: number; bottom: number;
}

export interface CalloutViewport {
  left: number; top: number; width: number; height: number;
  /** Top of a visible fixed navigation bar, in viewport coordinates. */
  bottomLimit?: number;
}

export interface CalloutPosition {
  left: number; top: number; width: number; maxHeight: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  arrowOffset: number;
}

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/** Keep the source symbol and bottom navigation exposed, including on phones. */
export function positionChartCallout(anchor: CalloutAnchor, viewport: CalloutViewport, naturalHeight: number): CalloutPosition {
  const padding = 12;
  const gap = 12;
  const leftEdge = viewport.left + padding;
  const rightEdge = viewport.left + viewport.width - padding;
  const topEdge = viewport.top + padding;
  const bottomEdge = Math.min(viewport.top + viewport.height, viewport.bottomLimit ?? Infinity) - padding;
  const width = Math.max(1, Math.min(340, rightEdge - leftEdge));
  const height = Math.min(naturalHeight, 480, bottomEdge - topEdge);
  const centerX = (anchor.left + anchor.right) / 2;
  const centerY = (anchor.top + anchor.bottom) / 2;
  const above = Math.max(0, Math.min(anchor.top - gap, bottomEdge) - topEdge);
  const below = Math.max(0, bottomEdge - Math.max(anchor.bottom + gap, topEdge));
  let placement: CalloutPosition['placement'];
  let left = clamp(centerX - width / 2, leftEdge, rightEdge - width);
  let maxHeight = height;
  let top: number;

  if (below >= height) {
    placement = 'bottom'; top = Math.max(topEdge, anchor.bottom + gap);
  } else if (above >= height) {
    placement = 'top'; top = anchor.top - gap - height;
  } else if (rightEdge - anchor.right - gap >= width) {
    placement = 'right'; left = anchor.right + gap;
    top = clamp(centerY - height / 2, topEdge, bottomEdge - height);
  } else if (anchor.left - gap - leftEdge >= width) {
    placement = 'left'; left = anchor.left - gap - width;
    top = clamp(centerY - height / 2, topEdge, bottomEdge - height);
  } else if (above >= below) {
    placement = 'top'; maxHeight = Math.max(1, above);
    top = anchor.top - gap - Math.min(naturalHeight, maxHeight);
  } else {
    placement = 'bottom'; maxHeight = Math.max(1, below);
    top = Math.max(topEdge, anchor.bottom + gap);
  }

  const vertical = placement === 'top' || placement === 'bottom';
  const arrowOffset = vertical
    ? clamp(centerX - left, 20, width - 20)
    : clamp(centerY - top, 20, Math.min(naturalHeight, maxHeight) - 20);
  return { left, top, width, maxHeight, placement, arrowOffset };
}
