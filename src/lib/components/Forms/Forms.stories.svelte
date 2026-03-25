<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Padding from '../Padding/Padding.svelte';
	import Panel from '../Panel/Panel.svelte';
	import Button from '../Button/Button.svelte';
	import { InputField, InputGroup } from '../Input/index.ts';
	import { Fieldset } from '../Fieldset/index.ts';

	const { Story } = defineMeta({
		title: 'Components/Forms',
		tags: ['autodocs']
	});
</script>

<Story name="Complete Form">
	<div style="max-width: 600px; margin: 0 auto;">
		<Panel>
			<Padding size="l">
				<form onsubmit={(e) => e.preventDefault()}>
					<Fieldset legend="Personal Information" isInForm>
						<InputField
							label="Full Name"
							placeholder="John Doe"
							required
							hint="Enter your legal full name."
						/>

						<InputField label="Email Address" type="email" placeholder="john@example.com" />

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
							<InputField label="Password" type="password" value="secret" />
							<InputField label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
						</div>
					</Fieldset>

					<Padding y size="m">
						<Fieldset legend="Preferences" isInForm>
							<InputField
								label="Primary Role"
								type="select"
								options={[
									{ value: 'developer', label: 'Developer' },
									{ value: 'designer', label: 'Designer' },
									{ value: 'manager', label: 'Manager' },
									{ value: 'other', label: 'Other' }
								]}
							/>

							<InputField
								label="Biography"
								type="textarea"
								placeholder="Tell us about yourself..."
							/>

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
						</Fieldset>
					</Padding>

					<InputField label="Birth Date" type="date" />

					<div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
						<Button label="Reset" type="reset" />
						<Button label="Save Changes" type="submit" variant="accent" />
					</div>
				</form>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Field with Button">
	<div style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
		<!-- Standard Side-by-Side -->
		<Panel>
			<Padding size="l">
				<p class="akui-label">Standard Side-by-Side (Space Gap)</p>
				<InputGroup>
					<InputField label="Search" placeholder="Search for anything..." />
					<Button variant="accent" label="Search" />
				</InputGroup>
			</Padding>
		</Panel>

		<!-- Joined Group Pattern -->
		<Panel>
			<Padding size="l">
				<p class="akui-label">Joined Group (Merged Borders)</p>
				<InputGroup joined>
					<InputField label="Email Newsletter" type="email" placeholder="you@example.com" />
					<Button variant="accent" label="Subscribe" />
				</InputGroup>
			</Padding>
		</Panel>

		<!-- Icons with Input -->
		<Panel>
			<Padding size="l">
				<p class="akui-label">Input with Icon Button</p>
				<InputGroup joined>
					<InputField label="Project URL" value="https://github.com/ash/svelte-akui" readonly />
					<Button icon="clipboard" iconPosition="only" label="Copy URL" />
				</InputGroup>
			</Padding>
		</Panel>

		<!-- Complex Joined Group -->
		<Panel>
			<Padding size="l">
				<p class="akui-label">Prefix Select + Input + Action</p>
				<InputGroup joined>
					<InputField
						label="Region"
						type="select"
						options={[
							{ value: 'us', label: 'US' },
							{ value: 'eu', label: 'EU' },
							{ value: 'au', label: 'AU' }
						]}
						style="width: 80px;"
					/>
					<InputField label="Domain Name" placeholder="example.com" />
					<Button variant="accent" icon="plus" iconPosition="only" label="Add Domain" />
				</InputGroup>
			</Padding>
		</Panel>
	</div>
</Story>

<Story name="Opt-out (Bespoke)">
	<div style="max-width: 600px; margin: 0 auto;">
		<Panel>
			<Padding size="l">
				<div class="akui-field">
					<label for="bespoke-1">Bespoke Input (Bypasses AKUI styles)</label>
					<input type="text" id="bespoke-1" class="bespoke" placeholder="Browser default style" />
				</div>
				<InputField label="AKUI Input (Standard)" placeholder="AKUI premium style" />
			</Padding>
		</Panel>
	</div>
</Story>

<style>
	.akui-label {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.375rem;
		color: var(--akui-fg-secondary);
	}
</style>
