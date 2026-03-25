<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Padding from './Padding/Padding.svelte';
	import Panel from './Panel/Panel.svelte';

	const { Story } = defineMeta({
		title: 'Examples/Forms',
		tags: ['autodocs']
	});
</script>

<Story name="Complete Form">
	<div style="max-width: 600px; margin: 0 auto;">
		<Panel>
			<Padding size="l">
				<form onsubmit={(e) => e.preventDefault()}>
					<fieldset>
						<legend>Personal Information</legend>

						<div class="akui-field">
							<label for="name">Full Name</label>
							<input type="text" id="name" placeholder="John Doe" required />
							<p class="akui-field-hint">Enter your legal full name.</p>
						</div>

						<div class="akui-field">
							<label for="email">Email Address</label>
							<input type="email" id="email" placeholder="john@example.com" />
						</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
							<div class="akui-field">
								<label for="password">Password</label>
								<input type="password" id="password" value="secret" />
							</div>
							<div class="akui-field">
								<label for="tel">Phone Number</label>
								<input type="tel" id="tel" placeholder="+1 (555) 000-0000" />
							</div>
						</div>
					</fieldset>

					<Padding y size="m">
						<fieldset>
							<legend>Preferences</legend>

							<div class="akui-field">
								<label for="role">Primary Role</label>
								<select id="role">
									<option value="developer">Developer</option>
									<option value="designer">Designer</option>
									<option value="manager">Manager</option>
									<option value="other">Other</option>
								</select>
							</div>

							<div class="akui-field">
								<label for="bio">Biography</label>
								<textarea id="bio" placeholder="Tell us about yourself..."></textarea>
							</div>

							<div class="akui-field">
								<label
									for="newsletter"
									style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;"
								>
									<input type="checkbox" id="newsletter" checked />
									Receive newsletter updates
								</label>
							</div>

							<div class="akui-field">
								<p class="akui-label">Notification Frequency</p>
								<div style="display: flex; gap: 1.5rem; margin-top: 0.5rem;">
									<label
										for="notify-daily"
										style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;"
									>
										<input type="radio" id="notify-daily" name="freq" value="daily" checked />
										Daily
									</label>
									<label
										for="notify-weekly"
										style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;"
									>
										<input type="radio" id="notify-weekly" name="freq" value="weekly" />
										Weekly
									</label>
								</div>
							</div>
						</fieldset>
					</Padding>

					<div class="akui-field">
						<label for="date">Birth Date</label>
						<input type="date" id="date" />
					</div>

					<div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
						<button type="reset" class="akui-btn">Reset</button>
						<button type="submit" class="akui-btn accent">Save Changes</button>
					</div>
				</form>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Opt-out (Bespoke)">
	<div style="max-width: 600px; margin: 0 auto;">
		<Panel>
			<Padding size="l">
				<div class="akui-field">
					<label>Bespoke Input (Bypasses AKUI styles)</label>
					<input type="text" class="bespoke" placeholder="Browser default style" />
				</div>
				<div class="akui-field">
					<label>AKUI Input (Standard)</label>
					<input type="text" placeholder="AKUI premium style" />
				</div>
			</Padding>
		</Panel>
	</div>
</Story>

<style>
	/* Custom style for the label in the radio group since we don't have a global .akui-label yet */
	.akui-label {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
		color: var(--akui-fg-secondary);
	}
</style>
