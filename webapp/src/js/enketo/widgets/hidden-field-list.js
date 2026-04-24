'use strict';
const Widget = require('enketo-core/src/js/widget').default;

/**
 * Widget that disables field-list groups where all contents are hidden.
 * This prevents Enketo from rendering an empty page for the group.
 *
 * @extends Widget
 */
class HiddenFieldList extends Widget {
  /**
   * Matches groups that have BOTH field-list AND hidden appearances.
   * These are top-level groups that should not be rendered as a page.
   */
  static get selector() {
    return '.or-appearance-field-list.or-appearance-hidden';
  }

  _init() {
    this.element.classList.add('disabled');
  }
}

module.exports = HiddenFieldList;
