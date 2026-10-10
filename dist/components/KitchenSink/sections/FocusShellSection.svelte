<script lang="ts">
	import { LayoutFocusShell, Button, Field, TextInput } from '../../../index.js';

	const steps = ['login', 'register', 'success'] as const;
	let stepIndex = $state(0);
	let loading = $state(false);

	const viewState = $derived(steps[stepIndex]);
	const nextStep = () => (stepIndex = (stepIndex + 1) % steps.length);
</script>

<section>
	<h2>LayoutFocusShell (contained)</h2>

	<div class="demo-row">
		<Button size="small" onclick={nextStep}>Next view ({viewState})</Button>
		<Button size="small" onclick={() => (loading = !loading)}>Loading: {loading ? 'on' : 'off'}</Button>
	</div>

	<!-- Contained shells fill their parent, so this wrapper decides the size. -->
	<div class="demo-box" style="height: 40rem; width: 100%;">
		<LayoutFocusShell contained {viewState} {loading} slideDirection="left" backTo="#">
			<div style="display: flex; flex-direction: column; gap: 1rem;">
				<strong style="text-align: center;">{viewState}</strong>
				<Field label="Example field" hint="Inside the focus shell">
					<TextInput placeholder="Type here" />
				</Field>
				<Button variant="accent" onclick={nextStep}>Continue</Button>
			</div>
		</LayoutFocusShell>
	</div>
</section>
