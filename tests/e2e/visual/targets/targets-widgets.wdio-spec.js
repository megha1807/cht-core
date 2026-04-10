const utils = require('@utils');
const commonPage = require('@page-objects/default/common/common.wdio.page');
const loginPage = require('@page-objects/default/login/login.wdio.page');
const analyticsPage = require('@page-objects/default/analytics/analytics.wdio.page');
const userFactory = require('@factories/cht/users/users');
const placeFactory = require('@factories/cht/contacts/place');
const personFactory = require('@factories/cht/contacts/person');
const deliveryFactory = require('@factories/cht/reports/delivery');
const pregnancyFactory = require('@factories/cht/reports/pregnancy');
const { generateScreenshot } = require('@utils/screenshots');
const { CONTACT_TYPES } = require('@medic/constants');

describe('Targets widgets', () => {
  const places = placeFactory.generateHierarchy();
  const healthCenter = places.get(CONTACT_TYPES.HEALTH_CENTER);
  const offlineUser = userFactory.build({
    username: 'offline-user-targets-widgets',
    roles: ['chw'],
    place: healthCenter._id
  });

  // Fewer patients with focused, extreme widget states
  const numberOfPatients = 6;
  const patients = Array.from({ length: numberOfPatients }, () =>
    personFactory.build({
      parent: { _id: healthCenter._id, parent: healthCenter.parent }
    })
  );

  const reports = [
    // All patients have 0 ANC visits → shows 0% percentage widget
    ...patients.slice(0, 4).map(patient => pregnancyFactory.build({
      fields: {
        patient_id: patient._id,
        patient_uuid: patient._id,
        patient_name: patient.name,
        anc_visits_hf: {
          anc_visits_hf_past: {
            visited_hf_count: '0',
          }
        }
      }
    })),

    // All deliveries are at home → shows 100% home delivery widget
    ...patients.slice(0, 6).map(patient => deliveryFactory.build({
      fields: {
        patient_id: patient._id,
        patient_uuid: patient._id,
        patient_name: patient.name,
        delivery_outcome: {
          delivery_place: 'home'
        },
        data: {
          __delivery_place: 'home'
        }
      }
    })),
  ];

  before(async () => {
    await utils.saveDocs([...places.values(), ...reports, ...patients]);
    await utils.createUsers([offlineUser]);
    await loginPage.login(offlineUser);
  });

  after(async () => {
    await utils.revertDb([/^form:/], true);
    await utils.deleteUsers([offlineUser]);
  });

  it('should show 0% ANC completion and 100% home delivery widget states', async () => {
    await commonPage.waitForPageLoaded();
    await commonPage.goToAnalytics();
    await commonPage.waitForPageLoaded();
    await browser.pause(2000);
    await generateScreenshot('targets', 'widgets');
  });
});
