import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, click, fillIn, triggerEvent, waitFor } from '@ember/test-helpers';
import { login } from '../helpers/login';

function findTriggerElementWithLabel(labelRegex) {
  return [...this.element.querySelectorAll('.cs-toolbox-section label')].find(element => labelRegex.test(element.textContent));
}

function findSectionLabels(label) {
  return [...this.element.querySelectorAll('.cs-toolbox-section label')].filter(element => label === element.textContent);
}

function findInputWithValue(value) {
  return Array.from(this.element.querySelectorAll('input'))
    .find(element => element.value === value);
}

module('Acceptance | tools', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    delete localStorage['cardstack-tools'];
  });

  hooks.afterEach(function() {
    delete localStorage['cardstack-tools'];
  });

  test('activate tools', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');
    await waitFor('.cs-active-composition-panel');

    let element = findTriggerElementWithLabel.call(this, /Title/);
    await click(element);
    let matching = findInputWithValue.call(this, '10 steps to becoming a fearsome pirate');
    assert.ok(matching, 'found field editor for title');

    element = findTriggerElementWithLabel.call(this, /Comment #1: Body/);
    await click(element);
    matching = findInputWithValue.call(this, 'Look behind you, a Three-Headed Monkey!');
    assert.ok(matching, 'found field editor for comment body');

    element = findTriggerElementWithLabel.call(this, /Author Name/);
    await click(element);
    matching = findInputWithValue.call(this, 'LeChuck');
    assert.ok(matching, 'found field editor for comment poster name');
  });

  test('field groups for related types are rendered correctly', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');

    assert.dom('[data-test=reading-time]').containsText('8 minutes');
    assert.dom('[data-test=karma-0]').containsText('10 Good');
    assert.dom('[data-test=karma-1]').containsText('5 Bad');
  });

  test('show validation error', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');

    let element = findTriggerElementWithLabel.call(this, /Title/);
    await click(element);

    let titleEditor = findInputWithValue.call(this, '10 steps to becoming a fearsome pirate');
    await fillIn(titleEditor, '');
    await triggerEvent(titleEditor, 'blur');
    await waitFor('[data-test-validation-error=title]')
    assert.dom('[data-test-validation-error=title]').hasText('title must not be empty');

    element = findTriggerElementWithLabel.call(this, /Body/);
    await click(element);
    let commentBodyEditor = findInputWithValue.call(this, 'Look behind you, a Three-Headed Monkey!');
    await fillIn(commentBodyEditor, '');
    await triggerEvent(commentBodyEditor, 'blur');
    await waitFor('[data-test-validation-error=body]')
    assert.dom('[data-test-validation-error=body]').hasText('body must not be empty');
  });

  test('show all fields, not just those rendered from template', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');

    let archivedSection = findTriggerElementWithLabel.call(this, /Archived/);
    assert.ok(archivedSection, "Unrendered field appears in editor");

    let titleSections = findSectionLabels.call(this, "Title");
    assert.equal(titleSections.length, 1, "Rendered fields only appear once");
  });

  test('it does not collapse sections for right edge input fields that are not rendered in the template when you type in the field', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');

    let slugLabel = findTriggerElementWithLabel.call(this, /Slug/);
    await click(slugLabel);
    let slugSection = slugLabel.closest('section');

    let slugInput = slugSection.querySelector('input');
    await fillIn(slugInput, 'h');

    slugInput = slugSection.querySelector('input');
    assert.dom(slugInput).isVisible();
  });

  test('show unrendered fields from related, owned records', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');

    assert.ok(findTriggerElementWithLabel.call(this, /Comment #1: Review Status/));
    assert.ok(findTriggerElementWithLabel.call(this, /Comment #2: Review Status/));
  });


  test('collapsible panel captions are unambiguous', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');

    assert.ok(findTriggerElementWithLabel.call(this, /Comment #1: Body/));
    assert.ok(findTriggerElementWithLabel.call(this, /Comment #1: Karma/));
    assert.ok(findTriggerElementWithLabel.call(this, /Comment #2: Body/));
    assert.ok(findTriggerElementWithLabel.call(this, /Comment #2: Karma/));
  });

  test('disable inputs for computed fields', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');

    let authorNameSectionTrigger = findTriggerElementWithLabel.call(this, /Author Name/);
    await click(authorNameSectionTrigger);

    let nameInput = findInputWithValue.call(this, 'LeChuck');
    assert.dom(nameInput).isDisabled('Computed field is disabled');
  });

  test('allow editing fields for related, owned records', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');
    await waitFor('.cs-editor-switch')
    await click('.cs-editor-switch');

    let reviewStatusActionTrigger = findTriggerElementWithLabel.call(this, /Comment #1: Review Status/);
    await click(reviewStatusActionTrigger);

    let reviewStatusInput = findInputWithValue.call(this, 'approved');
    assert.dom(reviewStatusInput).isNotDisabled();

    reviewStatusActionTrigger = findTriggerElementWithLabel.call(this, /Comment #2: Review Status/);
    await click(reviewStatusActionTrigger);

    reviewStatusInput = findInputWithValue.call(this, 'pending');
    assert.dom(reviewStatusInput).isNotDisabled();
  });

  test('track field dirtiness in owned, related records', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');
    await waitFor('.cs-editor-switch')
    await click('.cs-editor-switch');

    assert.dom('[data-test-cs-version-control-dropdown-option-status]').hasText('published');

    let reviewStatusActionTrigger = findTriggerElementWithLabel.call(this, /Comment #1: Karma/);
    await click(reviewStatusActionTrigger);

    let karmaInput = findInputWithValue.call(this, '10');
    await fillIn(karmaInput, '9');
    assert.dom('[data-test-cs-version-control-dropdown-option-status]').hasText('edited');

    await fillIn(karmaInput, '10');
    assert.dom('[data-test-cs-version-control-dropdown-option-status]').hasText('published');
  });

  test('allow editing fields of newly added, owned records', async function(assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');
    await waitFor('.cs-editor-switch')
    await click('.cs-editor-switch');

    let categoryPanel = findTriggerElementWithLabel.call(this, /Categories/);
    await click(categoryPanel);
    await click('[data-test-add-category-button]');
    await fillIn('.category-editor:last-of-type > input', 'Pirating');

    let popularityPanel = findTriggerElementWithLabel.call(this, /Category #: Popularity/);
    await click(popularityPanel);
    assert.dom('.field-editor > input').isNotDisabled();
  });

  test('can hide fields from editor', async function (assert) {
    await visit('/1');
    await login();
    await click('.cardstack-tools-launcher');
    await waitFor('.cs-editor-switch')
    await click('.cs-editor-switch');

    assert.dom('[data-test-field-name="hidden-field-from-editor"]').doesNotExist();
    assert.dom('[data-test-dummy-hidden-field-from-editor]').hasText('This field is hidden from the editor');
    assert.dom('[data-test-field-name="hidden-computed-field-from-editor"]').doesNotExist();
  });
});
