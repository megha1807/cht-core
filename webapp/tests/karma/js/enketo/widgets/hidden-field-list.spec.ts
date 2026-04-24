import { expect } from 'chai';
import sinon from 'sinon';
const $ = require('jquery');

const HiddenFieldList = require('../../../../../src/js/enketo/widgets/hidden-field-list');

const testId = 'hidden-field-list-test';
const buildHtml = (html: string) => document.body.insertAdjacentHTML(
  'afterbegin',
  `<div id="${testId}">${html}</div>`
);

describe('HiddenFieldList Widget', () => {

  afterEach(() => {
    sinon.restore();
    $(`#${testId}`).remove();
  });

  describe('selector', () => {
    it('matches groups with both field-list and hidden appearances', () => {
      buildHtml(`
        <div class="or-appearance-field-list or-appearance-hidden">
          <div class="question or-appearance-hidden"></div>
        </div>
      `);
      const el = document.querySelector('.or-appearance-field-list.or-appearance-hidden');
      expect(el).to.not.be.null;
      expect(el!.matches(HiddenFieldList.selector)).to.be.true;
    });

    it('does not match groups with only field-list appearance', () => {
      buildHtml(`<div class="or-appearance-field-list"></div>`);
      const el = document.querySelector(`#${testId} .or-appearance-field-list`);
      expect(el!.matches(HiddenFieldList.selector)).to.be.false;
    });

    it('does not match groups with only hidden appearance', () => {
      buildHtml(`<div class="or-appearance-hidden"></div>`);
      const el = document.querySelector(`#${testId} .or-appearance-hidden`);
      expect(el!.matches(HiddenFieldList.selector)).to.be.false;
    });
  });

  describe('_init', () => {
    it('adds disabled class to field-list group with hidden appearance', () => {
      buildHtml(`
        <div class="or-appearance-field-list or-appearance-hidden">
          <div class="question or-appearance-hidden"></div>
        </div>
      `);
      const el = document.querySelector(HiddenFieldList.selector) as HTMLElement;
      new HiddenFieldList(el, {});
      expect(el.classList.contains('disabled')).to.be.true;
    });

    it('preserves existing classes when adding disabled', () => {
      buildHtml(`
        <div class="or-appearance-field-list or-appearance-hidden">
          <div class="question or-appearance-hidden"></div>
        </div>
      `);
      const el = document.querySelector(HiddenFieldList.selector) as HTMLElement;
      new HiddenFieldList(el, {});
      expect(el.classList.contains('or-appearance-field-list')).to.be.true;
      expect(el.classList.contains('or-appearance-hidden')).to.be.true;
      expect(el.classList.contains('disabled')).to.be.true;
    });
  });

});
