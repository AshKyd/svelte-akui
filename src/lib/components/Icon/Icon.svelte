<script lang="ts">
  /**
   * @component Icon
   * A component for rendering Bootstrap Icons with automatic code splitting.
   */

  import { loadIconSvg } from "./iconSource.js";

  const FALLBACK_ICON = "exclamation-triangle";

  interface Props {
    /** The name of the Bootstrap Icon (e.g. "trash", "search") */
    name: string;
    /**
     * Accessible label for the icon.
     * If provided, the icon will have role="img" and aria-label.
     * If omitted, the icon will be hidden from screen readers (decorative).
     */
    alt?: string;
    /** Size of the icon (e.g. "1.5rem", "24px", 20) */
    size?: string | number;
    /** Colour of the icon. Defaults to "currentColor". */
    colour?: string;
    /** Additional CSS classes */
    class?: string;
    /** Spread remaining attributes to the container */
    [key: string]: unknown;
  }

  let {
    name,
    alt,
    size = "1em",
    colour = "currentColor",
    class: className = "",
    ...rest
  }: Props = $props();

  let svgContent = $state<string | null>(null);

  // Icons are fetched from the folder set by `configureIcons` (see iconSource.ts), so no bundler is involved.
  $effect(() => {
    if (!name) return;
    const requestedName = name;
    loadIconSvg(requestedName)
      .catch(() => {
        console.error(
          `[Akui] Icon "${requestedName}" not found. Falling back to ${FALLBACK_ICON}.`,
        );
        return loadIconSvg(FALLBACK_ICON);
      })
      .then((content) => {
        // Ignore a slow load that finished after the name changed.
        if (requestedName === name) svgContent = content;
      })
      .catch((err) => {
        console.error(`[Akui] Error loading icon "${requestedName}":`, err);
        svgContent = null;
      });
  });

  // Normalize size to include units if it's a number
  let computedSize = $derived.by(() =>
    typeof size === "number" ? `${size}px` : size,
  );
</script>

<span
  class="akui-icon {className}"
  role={alt ? "img" : "presentation"}
  aria-label={alt}
  aria-hidden={alt ? undefined : "true"}
  style:width={computedSize}
  style:height={computedSize}
  style:color={colour}
  {...rest}
>
  {#if svgContent}
    <!-- We trust the SVG content from bootstrap-icons -->
    {@html svgContent}
  {/if}
</span>

<style>
  .akui-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    flex-shrink: 0;
  }

  .akui-icon :global(svg) {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
</style>
