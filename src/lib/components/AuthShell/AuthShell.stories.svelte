<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuthShell from './AuthShell.svelte';
	import Button from '../Button/Button.svelte';
	import TextInput from '../Input/Text/TextInput.svelte';
	import Field from '../Input/Field/Field.svelte';
	import Icon from '../Icon/Icon.svelte';
	import Padding from '../Padding/Padding.svelte';
	import ProgressBar from '../ProgressBar/ProgressBar.svelte';

	const { Story } = defineMeta({
		title: 'Components/AuthShell',
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let currentStep = $state<'login' | 'register' | 'success'>('login');
	let stateKey = $state('login');
	let slideDir = $state<'left' | 'right' | 'up' | 'down' | 'none'>('up');
	let isLoading = $state(false);

	function goToRegister() {
		slideDir = 'left';
		currentStep = 'register';
		stateKey = 'register';
	}

	function goToLogin() {
		slideDir = 'right';
		currentStep = 'login';
		stateKey = 'login';
	}

	function handleLoginSubmit() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
			slideDir = 'left';
			currentStep = 'success';
			stateKey = 'success';
		}, 1500);
	}

	function handleRegisterSubmit() {
		isLoading = true;
		setTimeout(() => {
			isLoading = false;
			slideDir = 'left';
			currentStep = 'success';
			stateKey = 'success';
		}, 1500);
	}

	function resetFlow() {
		slideDir = 'down';
		currentStep = 'login';
		stateKey = 'login';
	}
</script>

<!-- Story 1: Simple Cozy Login page -->
<Story name="Login View">
	<AuthShell
		viewState="login"
		backgroundImage="/faded_gallery-SiAJGyR15Aw-unsplash.jpg"
		darkBackgroundImage="/philip-oroni-KbusKKAZ968-unsplash.jpg"
		backTo="#"
	>
		<div style="display: flex; flex-direction: column; gap: var(--akui-space-m, 1rem);">
			<div style="text-align: center; margin-bottom: 8px;">
				<div
					style="font-size: var(--akui-font-size-xl, 1.5rem); font-weight: 700; color: var(--akui-fg);"
				>
					Wand Licensing Portal
				</div>
				<div
					style="font-size: var(--akui-font-size-s, 0.875rem); color: var(--akui-fg-secondary); margin-top: 4px;"
				>
					Login to authenticate your magical implement
				</div>
			</div>

			<Field label="Wand Serial Number" hint="Found etched on the base of your wand">
				<TextInput placeholder="e.g. OAK-1294-DRAGON" />
			</Field>

			<Field label="Secret phrase">
				<TextInput type="password" placeholder="••••••••••••" />
			</Field>

			<Button variant="accent" style="width: 100%; margin-top: 8px;">Whisper Incantation</Button>

			<div
				style="text-align: center; font-size: 0.875rem; color: var(--akui-fg-secondary); margin-top: 8px;"
			>
				First time visiting? <a
					href="#register"
					style="color: var(--akui-bg-accent); font-weight: 500;">Register your wand</a
				>
			</div>
		</div>
	</AuthShell>
</Story>

<!-- Story: No Background Image -->
<Story name="No Background Image">
	<AuthShell viewState="login" backTo="#">
		<div style="display: flex; flex-direction: column; gap: var(--akui-space-m, 1rem);">
			<div style="text-align: center; margin-bottom: 8px;">
				<div
					style="font-size: var(--akui-font-size-xl, 1.5rem); font-weight: 700; color: var(--akui-fg);"
				>
					Wand Licensing Portal
				</div>
				<div
					style="font-size: var(--akui-font-size-s, 0.875rem); color: var(--akui-fg-secondary); margin-top: 4px;"
				>
					Login to authenticate your magical implement
				</div>
			</div>

			<Field label="Wand Serial Number">
				<TextInput placeholder="e.g. OAK-1294-DRAGON" />
			</Field>

			<Button variant="accent" style="width: 100%; margin-top: 8px;">Whisper Incantation</Button>
		</div>
	</AuthShell>
</Story>

<!-- Story 2: Interactive Wizard with slideDirection, loading states, and crossfades -->
<Story name="Interactive Multi-step Flow">
	{#snippet authForm()}
		{#if currentStep === 'login'}
			<div style="display: flex; flex-direction: column; gap: var(--akui-space-m, 1rem);">
				<div style="text-align: center; margin-bottom: 8px;">
					<div
						style="font-size: var(--akui-font-size-xl, 1.5rem); font-weight: 700; color: var(--akui-fg);"
					>
						Wand Licensing Portal
					</div>
					<div
						style="font-size: var(--akui-font-size-s, 0.875rem); color: var(--akui-fg-secondary); margin-top: 4px;"
					>
						Login to authenticate your magical implement
					</div>
				</div>

				<Field label="Wand Serial Number">
					<TextInput placeholder="e.g. OAK-1294-DRAGON" />
				</Field>

				<Button variant="accent" style="width: 100%;" onclick={handleLoginSubmit}>
					Login to Portal
				</Button>

				<div style="text-align: center; font-size: 0.875rem; color: var(--akui-fg-secondary);">
					Need a wand license?
					<button
						onclick={goToRegister}
						style="background: none; border: none; color: var(--akui-bg-accent); font-weight: 500; cursor: pointer; padding: 0;"
					>
						Register here
					</button>
				</div>
			</div>
		{:else if currentStep === 'register'}
			<div style="display: flex; flex-direction: column; gap: var(--akui-space-m, 1rem);">
				<div style="text-align: center; margin-bottom: 8px;">
					<div
						style="font-size: var(--akui-font-size-xl, 1.5rem); font-weight: 700; color: var(--akui-fg);"
					>
						Wand Registration
					</div>
					<div
						style="font-size: var(--akui-font-size-s, 0.875rem); color: var(--akui-fg-secondary); margin-top: 4px;"
					>
						Register your newly crafted magical implement
					</div>
				</div>

				<Field label="Core Material">
					<TextInput placeholder="e.g. Phoenix Feather, Dragon Heartstring" />
				</Field>

				<Field label="Wood Type">
					<TextInput placeholder="e.g. Elder, Rowan, Willow" />
				</Field>

				<Button variant="accent" style="width: 100%;" onclick={handleRegisterSubmit}>
					Complete Registration
				</Button>

				<div style="text-align: center; font-size: 0.875rem; color: var(--akui-fg-secondary);">
					Already registered?
					<button
						onclick={goToLogin}
						style="background: none; border: none; color: var(--akui-bg-accent); font-weight: 500; cursor: pointer; padding: 0;"
					>
						Login instead
					</button>
				</div>
			</div>
		{:else if currentStep === 'success'}
			<div
				style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--akui-space-m, 1rem); padding: 12px 0;"
			>
				<div
					style="width: 60px; height: 60px; background: rgba(16, 185, 129, 0.1); color: rgb(16, 185, 129); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem;"
				>
					<Icon name="check-circle" size={32} />
				</div>
				<div>
					<div
						style="font-size: var(--akui-font-size-xl, 1.5rem); font-weight: 700; color: var(--akui-fg);"
					>
						Credentials Confirmed!
					</div>
					<div
						style="font-size: var(--akui-font-size-s, 0.875rem); color: var(--akui-fg-secondary); margin-top: 8px; line-height: 1.5;"
					>
						Spellcasting credentials confirmed, you can continue through the wand licensing portal.
					</div>
				</div>
				<Button variant="regular" style="width: 100%; margin-top: 8px;" onclick={resetFlow}>
					Jeepers
				</Button>
			</div>
		{/if}
	{/snippet}

	<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
		<!-- Control Bar to showcase different component states -->
		<div
			style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; background: var(--akui-bg-secondary); padding: 12px; border-radius: 8px; z-index: 20; position: relative;"
		>
			<Button
				size="small"
				onclick={() => {
					currentStep = 'login';
					stateKey = 'login';
					slideDir = 'up';
					isLoading = false;
				}}>Login State</Button
			>
			<Button
				size="small"
				onclick={() => {
					currentStep = 'register';
					stateKey = 'register';
					slideDir = 'left';
					isLoading = false;
				}}>Register State</Button
			>
			<Button
				size="small"
				onclick={() => {
					isLoading = !isLoading;
				}}>Toggle Loading ({isLoading ? 'ON' : 'OFF'})</Button
			>
			<Button
				size="small"
				onclick={() => {
					stateKey = 'blank';
					isLoading = false;
				}}>Blank State</Button
			>
			<Button
				size="small"
				onclick={() => {
					currentStep = 'success';
					stateKey = 'success';
					slideDir = 'left';
					isLoading = false;
				}}>Success State</Button
			>
		</div>

		<AuthShell
			viewState={stateKey}
			slideDirection={slideDir}
			loading={isLoading}
			backgroundImage="/bharath-kumar-csws9NlWGls-unsplash.jpg"
			backTo="#"
		>
			{@render authForm()}
		</AuthShell>
	</div>
</Story>
