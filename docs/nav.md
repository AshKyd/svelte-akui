msidebar/Navigation Drawer: On desktop the sidebar is always present, but we can optionally have a show/hide method to slide the sidebar in or out. On mobile the sidebar slides over the top of the content and a scrim fades in. We require a hamburger button to show, but have a clickable scrim to close. The side bar has two components, the top part which is scrollable, and the bottom part which is fixed; the bottom part can have things like the settings button etc, where is the top can be an unlimited list of content if required.

We need a Top App Bar component that has room for a customisable icon button on the left, an optional title after the icon, and a snippet of content on the right (icons and other elements). Pinned or scrolling. Left nav icon, Center/Left title, Right actions.

bottom Navigation Bar: a seris of icons and buttons pinned to the bottom of the screen, max 5. This only really gets used. on mobile. We should have a standard button component to use here, but the main component should take snippets so we can implement custom buttons if we want. Icons should have the option for text underneath, or to the right. This allows us to relocate the icons to the sidebar on desktop.

We should have a main orchestration system that handles navigating between pages. Maybe this is based on svelte routing, but it should be formalise so that implementers have one approved way of doing things. For instance on mobile we have two levels of pages that swipe over the top, whereas on desktop we can show them side-by-side if there's enough space. So it may need to be a special component after all.

We will need some sort of state management to keep everything in line. This could be svelte routing for the pages, but we will need a sidebar state.

---

## 1. Naming & Component Alignment

Aligning your vocabulary with MD3 standards will help you map your components directly to Material design tokens and specs.

| Your Name | MD3 Name | Svelte Component Proposal | Key Behavior / Notes |
| --- | --- | --- | --- |
| **Sidebar** | Navigation Drawer | `<NavigationDrawer>` | Permanent/Dismissible on desktop; Modal with scrim on mobile. |
| **Header** | Top App Bar | `<TopAppBar>` | Pinned or scrolling. Left nav icon, Center/Left title, Right actions. |
| **Bottom Nav** | Navigation Bar | `<NavigationBar>` | Mobile only. Fits 3–5 destinations. |
| **Orchestrator** | Canonical Layouts | `<AdaptiveLayout>` / `<AppShell>` | Manages responsive viewports, pane syncing, and page transitions. |

---

---

## 2. Refining the Components

### The Navigation Drawer (Sidebar)

Your idea of dividing this into a scrollable top and a fixed bottom is spot-on. Using Svelte 5 snippets makes this incredibly clean to implement without polluting the component with endless props.

```svelte
<NavigationDrawer isOpen={ui.sidebarOpen} mode={ui.displayMode}>
	{#snippet content()}
		{/snippet}
	
	{#snippet footer()}
		{/snippet}
</NavigationDrawer>

```

### The Top App Bar (Header)

MD3 defines standard, medium, and large top app bars. For your setup, keeping it simple with three distinct snippet zones is ideal:

```svelte
<TopAppBar>
	{#snippet navigation()}
		<IconButton icon="menu" onclick={ui.toggleSidebar} />
	{/snippet}
	
	{#snippet title()}
		<h1>Dashboard</h1>
	{#snippet}
	
	{#snippet actions()}
		<IconButton icon="search" />
		<IconButton icon="notifications" />
	{/snippet}
</TopAppBar>

```

---

## 3. The Orchestrator & State Management (The Hard Part)

The behavior you described—where mobile screens swipe over each other, but desktop displays them side-by-side—is what Material Design calls a **List-Detail View** (a type of Canonical Layout).

To pull this off seamlessly, your state management and your router need to talk to each other.

### The Responsive State (The Brain)

You need a centralized global or context-based state driven by window media queries. Using Svelte runes, it looks something like this:

```ts
// uiState.svelte.ts
export function createUIState() {
	let width = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	
	// Derived states based on MD3 breakpoints
	let isMobile = $derived(width < 600);
	let isTablet = $derived(width >= 600 && width < 840);
	let isDesktop = $derived(width >= 840);
	
	let sidebarOpen = $state(false);

	// Automatically close sidebar/modal when scaling up to desktop if desired
	return {
		get displayMode() { return isMobile ? 'modal' : 'permanent'; },
		get isMobile() { return isMobile; },
		sidebarOpen,
		toggleSidebar: () => sidebarOpen = !sidebarOpen
	};
}

```

### The `<AdaptiveLayout>` Component

Instead of forcing a standard router to figure out the visual layout, your router should just feed page data to a smart layout component.

On **Desktop**, this component renders a split pane. On **Mobile**, it uses Svelte's `fly` transitions to simulate a native app page stack swipe.

```svelte
<div class="app-shell" class:is-mobile={ui.isMobile}>
	{#if !ui.isMobile}
		<NavigationDrawer />
	{/if}

	<main>
		<TopAppBar />
		
		<div class="content-container">
			{#key currentPath}
				<div in:fly={{ x: ui.isMobile ? 300 : 0 }}>
					<slot /> 
				</div>
			{#key}
		</div>

		{#if ui.isMobile}
			<NavigationBar />
			{#if ui.sidebarOpen}
				<div class="scrim" onclick={ui.toggleSidebar}></div>
				<NavigationDrawer mode="modal" />
			{/if}
		{/if}
	</main>
</div>

```

---

## Moving Forward

This structure solves the desktop-to-mobile transformation nicely. By making the `NavigationBar` (bottom nav) and the `NavigationDrawer` (sidebar) share the exact same configuration array of links, you can automatically hide the bottom nav on desktop and show those identical links inside the sidebar instead.

How do you want to handle the routing integration? Are you planning to build this on top of SvelteKit, or are you looking to write a lightweight, custom client-side router specifically designed to handle these multi-pane layout structures?
